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
        console.log(context);
        console.log(data);
        const uid = context.auth.uid;
        const db = admin.firestore();
        db.collection('sessions').doc(data.session).update({
            attendees: admin.firestore.FieldValue.arrayUnion(uid)
        }).then(result => {
            resolve(result)
        }).catch(error => {
            reject(error)
        })
    })
})
