const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

const settings = {
    timestampsInSnapshots: true
};
admin.firestore().settings(settings);

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

exports.attendSession = functions.https.onCall((data, context) => {
    return new Promise((resolve, reject) => {
        const uid = context.auth.uid;
        const db = admin.firestore();
        db.collection('sessions').doc(data.session).get().then(doc => {
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
                db.collection('sessions')
                    .where('attendees', 'array-contains', uid)
                    .get().then(querySnapshot => {
                        let overlap = false;
                        querySnapshot.forEach(doc => {
                            existingSession = doc.data();
                            // Session starts during another session
                            if (sessionToAttend.startTime.toMillis() >= existingSession.startTime.toMillis() && sessionToAttend.startTime.toMillis() < existingSession.endTime.toMillis()) {
                                overlap = true;
                                return;
                            }
                            // Session ends during another session
                            if (sessionToAttend.endTime.toMillis() > existingSession.startTime.toMillis() && sessionToAttend.endTime.toMillis() <= existingSession.endTime.toMillis()) {
                                overlap = true;
                                return;
                            }
                            // Session falls inside existing session
                            if (sessionToAttend.startTime.toMillis() > existingSession.startTime.toMillis() && sessionToAttend.endTime.toMillis() < existingSession.endTime.toMillis()) {
                                overlap = true;
                                return;
                            }
                            // Existing Session falls inside the session
                            if (existingSession.startTime.toMillis() >= sessionToAttend.startTime.toMillis() && existingSession.endTime.toMillis() <= sessionToAttend.endTime.toMillis()) {
                                overlap = true;
                                return;
                            }
                        });
                        if (!overlap) {
                            db.collection('sessions').doc(data.session).update({
                                attendees: admin.firestore.FieldValue.arrayUnion(uid)
                            }).then(result => {
                                resolve(true)
                                return
                            }).catch(error => {
                                reject(error)
                            })
                        } else {
                            resolve(false);
                        }
                        return;
                    }).catch(err => {
                        console.error(err);
                    })
                    return;
            }
        }).catch(err => {
            console.error(err);
        })
    })
})

exports.unattendSession = functions.https.onCall((data, context) => {
    return new Promise((resolve, reject) => {
        const uid = context.auth.uid;
        const db = admin.firestore();
        db.collection('sessions').doc(data.session).get().then(doc => {
            const session = doc.data();
            if (Date.now() > session.startTime.toDate() - 300000) {
                resolve(false);
                return;
            } else {
                console.log('The session has not started');
                db.collection('sessions').doc(data.session).update({
                    attendees: admin.firestore.FieldValue.arrayRemove(uid)
                }).then(result => {
                    resolve(result);
                    return
                }).catch(error => {
                    reject(error);
                    return;
                })
                return;
            }
        }).catch(error => {
            reject(error);
            return;
        })
    })
})

exports.addUserRole = functions.https.onCall((data, context) => {
    return new Promise((resolve, reject) => {
        if (context.auth.token.email === 'vanderbergha@isdedu.de') {
            try {
                let object = {admin: true};
                object[data.role] = true;
                admin.auth().setCustomUserClaims(data.uid, object).then(() => {
                    console.log('User ', data.uid, 'has been set to', data.role);
                    resolve("User "+data.uid+" has been set to "+data.role);
                    return;
                }).catch(error => {
                    reject(new functions.https.HttpsError('aborted', 'error'));
                })
            } catch(error) {
                reject(new functions.https.HttpsError('aborted', 'error'));
            }
        } else {
            reject(new functions.https.HttpsError('aborted', "Unauthorised User"));
        }
    })
})
