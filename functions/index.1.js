
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

exports.sendUpdateUserFromPass = functions.auth.user().onCreate((user) => {
    console.log("update from pass");
    
	var userObject = {
		displayName : user.displayName,
		email : user.email,
		photoUrl : user.photoURL,
		createdOn : user.metadata.createdAt
    };
    console.log(userObject);

  })


/*
exports.attendSession = functions.https.onCall((data, context) => {
    return new Promise((resolve, reject) => {
        const uid = context.auth.uid;
        const db = admin.firestore();
        db.collection('sessions').doc(data.session).get()
        .then(doc => {
            const sessionToAttend = doc.data();
        })
        
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
                        }
                    })
                    if (!overlap) {
                        db.collection('sessions').doc(data.session).update({
                            attendees: admin.firestore.FieldValue.arrayUnion(uid)
                        }).then(() => {
                            resolve(true)
                        }).catch(error => {
                            reject(error)
                        })
                    } else {
                        resolve(false);
                    }
                })
        })
    })
})
*/
/*
exports.unattendSession = functions.https.onCall((data, context) => {
    return new Promise((resolve, reject) => {
        const uid = context.auth.uid;
        const db = admin.firestore();
        db.collection('sessions').doc(data.session).update({
            attendees: admin.firestore.FieldValue.arrayRemove(uid)
        }).then(result => {
            resolve(result)
        }).catch(error => {
            reject(error);
        })
    })
})
*/

