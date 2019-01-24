const functions = require('firebase-functions');
const admin = require('firebase-admin');
try { admin.initializeApp(functions.config().firebase) } catch (e) { console.log(e) }
// Get a database reference
var db = admin.firestore();
try { db.settings({timestampsInSnapshots:true}) } catch (e) { console.log(e) }



exports = module.exports = functions.https.onCall((data, context) => {
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