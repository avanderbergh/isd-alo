
const functions = require('firebase-functions');
const admin = require('firebase-admin');
try { admin.initializeApp(functions.config().firebase) } catch (e) { console.log(e) }
// Get a database reference
var db = admin.firestore();
try { db.settings({timestampsInSnapshots:true}) } catch (e) { console.log(e) }

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

exports = module.exports = functions.https.onCall((data, context) => {
    return new Promise((resolve, reject) => {
        const uid = context.auth.uid;
        const db = admin.firestore();
        db.collection('sessions').doc(data.session).update({
            attendees: admin.firestore.FieldValue.arrayRemove(uid)
        }).then(result => {
            resolve(result);
            return
        }).catch(error => {
            reject(error);
        })
    })
})



