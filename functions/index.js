const functions = require("firebase-functions");
const admin = require("firebase-admin");
const util = require("./utility/pass");
const serviceAccount = require("./keys/isdcoaching-dev-firebase-adminsdk-ylcvn-b2b91cfed5.json");
const sgMail = require("@sendgrid/mail");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://isdcoaching.firebaseio.com"
});

const settings = {
  timestampsInSnapshots: true
};
admin.firestore().settings(settings);
const db = admin.firestore();
sgMail.setApiKey(functions.config().sendgrid.key);

exports.attendSession = functions.https.onCall((data, context) => {
  return new Promise((resolve, reject) => {
    const uid = context.auth.uid;
    db.collection("sessions")
      .doc(data.session)
      .get()
      .then(doc => {
        const sessionToAttend = doc.data();
        let numberOfAttendees = 0;
        if (sessionToAttend.attendees) {
          numberOfAttendees = sessionToAttend.attendees.length;
        }
        let sessionCapacity = parseInt(sessionToAttend.capacity);
        if (numberOfAttendees >= sessionCapacity) {
          resolve(false);
          return;
        } else {
          db.collection("sessions")
            .where("attendees", "array-contains", uid)
            .get()
            .then(querySnapshot => {
              let overlap = false;
              querySnapshot.forEach(doc => {
                existingSession = doc.data();
                // Session starts during another session
                if (
                  sessionToAttend.startTime.toMillis() >=
                    existingSession.startTime.toMillis() &&
                  sessionToAttend.startTime.toMillis() <
                    existingSession.endTime.toMillis()
                ) {
                  overlap = true;
                  return;
                }
                // Session ends during another session
                if (
                  sessionToAttend.endTime.toMillis() >
                    existingSession.startTime.toMillis() &&
                  sessionToAttend.endTime.toMillis() <=
                    existingSession.endTime.toMillis()
                ) {
                  overlap = true;
                  return;
                }
                // Session falls inside existing session
                if (
                  sessionToAttend.startTime.toMillis() >
                    existingSession.startTime.toMillis() &&
                  sessionToAttend.endTime.toMillis() <
                    existingSession.endTime.toMillis()
                ) {
                  overlap = true;
                  return;
                }
                // Existing Session falls inside the session
                if (
                  existingSession.startTime.toMillis() >=
                    sessionToAttend.startTime.toMillis() &&
                  existingSession.endTime.toMillis() <=
                    sessionToAttend.endTime.toMillis()
                ) {
                  overlap = true;
                  return;
                }
              });
              if (!overlap) {
                db.collection("sessions")
                  .doc(data.session)
                  .update({
                    attendees: admin.firestore.FieldValue.arrayUnion(uid)
                  })
                  .then(result => {
                    resolve(true);
                    return;
                  })
                  .catch(error => {
                    reject(error);
                  });
              } else {
                resolve(false);
              }
              return;
            })
            .catch(err => {
              console.error(err);
            });
          return;
        }
      })
      .catch(err => {
        console.error(err);
      });
  });
});

exports.unattendSession = functions.https.onCall((data, context) => {
  return new Promise((resolve, reject) => {
    const uid = context.auth.uid;
    db.collection("sessions")
      .doc(data.session)
      .get()
      .then(doc => {
        const session = doc.data();
        if (Date.now() > session.startTime.toDate() - 300000) {
          resolve(false);
          return;
        } else {
          console.log("The session has not started");
          db.collection("sessions")
            .doc(data.session)
            .update({
              attendees: admin.firestore.FieldValue.arrayRemove(uid)
            })
            .then(result => {
              resolve(result);
              return;
            })
            .catch(error => {
              reject(error);
              return;
            });
          return;
        }
      })
      .catch(error => {
        reject(error);
        return;
      });
  });
});

exports.cancelSession = functions.https.onCall((data, context) => {
  return new Promise(resolve => {
    return db.collection("sessions")
      .doc(data.id)
      .get()
      .then(doc => {
        if (!doc.exists) throw(new Error("Session does not exist"));
        const session = doc.data();
        if (!session.presenters.includes(context.auth.uid)) {
          throw(new Error("Unauthorized!"));
        }
        resolve(session);
        return false;
      });
  })
    .then(session => {
      if (!session.attendees) return false;
      let notifyAttendeesPromises = [];
      session.attendees.forEach(attendeeId => {
        notifyAttendeesPromises.push(
          new Promise(resolve => {
            return db.collection("users")
              .doc(attendeeId)
              .get()
              .then(attendeeDoc => {
                const attendee = attendeeDoc.data();
                const text = `Dear ${attendee.displayName},\n
                The session ALO session "${session.title}" you signed up for has been cancelled.\n
                Please use the ALO app to sign up for a new session during that time.\n
                \n
                The ALO Team.`;

                const html = `Dear ${attendee.displayName},<br/>
                The session ALO session "${session.title}" you signed up for has been cancelled.<br/>
                Please use the <a href="https://isdcoaching.firebaseapp.com">ALO app</a> to sign up for a new session during that time.<br/>
                <br/>
                The ALO Team.`;
                const msg = {
                  to: attendee.email,
                  from: "noreply@isdedu.de",
                  subject: `Session ${session.title} Cancelled`,
                  text: text,
                  html: html
                };
                console.log("Sending mail to attendee", attendee.email);
                sgMail.send(msg, res => {
                  console.log(res);
                  resolve();
                });
                return false;
              });
          })
        );
      });
      return Promise.all(notifyAttendeesPromises);
    })
    .then(() => {
      db.collection("sessions")
        .doc(data.id)
        .delete();
      return false;
    })
    .catch(err => {
      console.error("Error while cancelling session", err);
    });
});

exports.addUserRole = functions.https.onCall((data, context) => {
  return new Promise((resolve, reject) => {
    if (context.auth.token.admin) {
      try {
        let object = { admin: true };
        object[data.role] = true;
        admin
          .auth()
          .setCustomUserClaims(data.uid, object)
          .then(() => {
            console.log("User ", data.uid, "has been set to", data.role);
            resolve("User " + data.uid + " has been set to " + data.role);
            return;
          })
          .catch(error => {
            reject(new functions.https.HttpsError("aborted", "error"));
          });
      } catch (error) {
        reject(new functions.https.HttpsError("aborted", "error"));
      }
    } else {
      reject(new functions.https.HttpsError("aborted", "Unauthorised User"));
    }
  });
});

exports.userAuthOnCreate = functions.auth.user().onCreate(user => {
  return new Promise((resolve, reject) => {
    var promises = [];
    console.log(user);
    if (user.email && user.uid) {
      const update_one = updateOne(user);
      promises.push(update_one);
    } else {
      console.log("update Many");
      // do the update with many users
      // loop through users... add promises to the array
      const update_many = updateMany();
      promises.push(update_many);
    }
    //console.log(promises);
    return Promise.all(promises);
  }).then(() => {
    return resolve();
  });
});

function updateMany(delay) {
  return new Promise((resolve, reject) => {
    db.collection("users")
      .get()
      .then(querySnapshot => {
        var promises = [];
        var delay = 500;
        querySnapshot.forEach(doc => {
          // doc.data() is never undefined for query doc snapshots
          //console.log(doc.id, " => ", doc.data().displayName);
          var user = doc.data();
          user.uid = doc.id;
          const update_user = updateOne(user, (delay += 500));
          promises.push(update_user);
        });
        return Promise.all(promises);
      })
      .then(() => {
        return resolve();
      })
      .catch(error => console.log(error));
  });
}

function updateOne(user, delay = 0) {
  var userType = {};
  console.log(delay);
  const sleep = d => {
    return new Promise((resolve, reject) => {
      setTimeout(resolve, d);
    });
  };
  sleep(delay)
    .then(() => {
      return new Promise((resolve, reject) => {
        util
          .wcbs22_get_token()
          .then(auth => {
            queryParams = {
              headers: {
                Authorization: "Bearer " + auth.access_token,
                "User-Agent": "isd-sync-services"
              },
              method: "GET"
            };

            studentQueryUrl = util.wcbs22_prepare_query({
              endpoint: "Pupils",
              expand:
                "Form($select = Code), Form($expand=FormYear($select=YearNumber))",
              filter:
                "Name/EmailAddress eq '" +
                user.email +
                "' and Form/AcademicYear eq 2019",
              select: "NameId"
            }); // prepare query

            staffQueryUrl = util.wcbs22_prepare_query({
              endpoint: "Staff",
              expand: "Name($select = Id)",
              filter: "InternalEmailAddress  eq '" + user.email + "'",
              select: "Code"
            }); // prepare query

            const student = util.queryAPI(
              studentQueryUrl,
              queryParams,
              "pupil-Query"
            );

            const staff = util.queryAPI(
              staffQueryUrl,
              queryParams,
              "staff-Query"
            );

            return Promise.all([student, staff]);
          })
          .then(results => {
            if (results[0].value.length >= 1) {
              userType = {
                type: "student",
                id: results[0].value[0].NameId,
                form: results[0].value[0].Form.Code,
                yearNumber: results[0].value[0].Form.FormYear.YearNumber
              };
            } else if (results[1].value.length >= 1) {
              userType = { type: "staff", id: results[1].value[0].Name.Id };
            }

            return userType;
          })
          .then(() => {
            // process userType
            console.log("update one: " + user.displayName);
            //console.log("Existing Roles for "+ user.uid);
            return getClaim(user.uid);
          })
          .then(res => {
            console.log(userType);
            const customClaims = { [userType.type]: true };
            setClaim(user, customClaims); // Set custom user claims on this newly created user.
            return userType;
          })
          .then(userType => {
            var newPromises = [];

            const photo = insertUserPhoto(user.uid, userType.id);
            newPromises.push(photo);
            if (userType.type === "student") {
              const form = insertStudentForm(user.uid, userType);
              newPromises.push(form);
            }

            return Promise.all(newPromises);
          })
          .then(() => {
            return resolve();
          })
          .catch(error => console.log(error));
      });
    })
    .catch(error => console.log(error));
}

function insertStudentForm(uid, userData) {
  return new Promise((resolve, reject) => {
    var docRef = db.collection("users").doc(uid);

    return resolve(
      docRef.set(
        {
          form: userData.form,
          yearNumber: userData.yearNumber
        },
        { merge: true }
      )
    );
  }).catch(error => {
    console.log("Error getting document:", error);
  });
}

function insertUserPhoto(uid, id) {
  var image = "";
  return new Promise((resolve, reject) => {
    getUserPhotoFromPass(id)
      .then(res => {
        if (res) {
          img = res;
          image = String("data:image/jpeg;base64," + img);
          var docRef = db.collection("users").doc(uid);
          docRef.set({ namePhoto: image }, { merge: true });
        }

        return;
      })
      .then(() => {
        console.log("INSERT PHOTO DONE for: " + uid);
        return resolve;
      })
      .catch(error => {
        console.log("Error getting document:", error);
        return reject;
      });
  });
}

function getUserPhotoFromPass(id) {
  //https://3sys.isdedu.de/Wcbs.API.2.2/api/names(1900523146)/photo

  return new Promise((resolve, reject) => {
    util
      .wcbs22_get_token()
      .then(auth => {
        //console.log("Get the Photo for "+id);

        photoQueryUrl =
          util.wcbs22_prepare_photo_query() + "names(" + id + ")/photo"; // prepare query
        //console.log(photoQueryUrl);
        queryParams = {
          headers: {
            Authorization: "Bearer " + auth.access_token,
            "User-Agent": "isd-sync-services"
          },
          method: "GET"
        };

        return util.queryAPI(photoQueryUrl, queryParams, "get_user_photo");
        // return the query data
      })
      .then(queryData => {
        console.log("Setting Photo, querydata:", queryData);
        let buff = new Buffer(queryData);
        let base64data = buff.toString("base64"); // convert to Base 64
        //console.log("END OF get_user_photo ");
        return resolve(base64data);
      })
      .catch(error => {
        console.log("PHOTO ERROR: " + error);
        return reject;
      });
  });
}

function getClaim(uid) {
  return new Promise((resolve, reject) => {
    admin
      .auth()
      .getUser(uid)
      .then(userRecord => {
        // The claims can be accessed on the user record.
        console.log(userRecord);
        if (typeof userRecord.customClaims !== "undefined") {
          staff =
            typeof userRecord.customClaims.staff !== "undefined" ? true : false;
          student =
            typeof userRecord.customClaims.student !== "undefined"
              ? true
              : false;

          console.log("Staff :" + staff);
          console.log("Student :" + student);
        } else {
          console.log("No custom Claims");
        }

        return resolve();
      })
      .catch(error => {
        console.log(error);
      });
  });
}

function setClaim(user, customClaims) {
  return new Promise((resolve, reject) => {
    return admin
      .auth()
      .setCustomUserClaims(user.uid, customClaims)
      .then(() => {
        // Update real-time database to notify client to force refresh.
        const metadataRef = admin.database().ref("metadata/" + user.uid);
        // Set the refresh time to the current UTC timestamp.
        // This will be captured on the client to force a token refresh.
        return resolve(metadataRef.set({ refreshTime: new Date().getTime() }));
      })
      .catch(error => {
        console.log(error);
      });
  });
}
