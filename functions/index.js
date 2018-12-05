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
