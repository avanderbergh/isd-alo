const functions = require('firebase-functions');
const admin = require('firebase-admin');

var serviceAccount = require("../../serviceAccountKey.json");


try { admin.initializeApp(
        {credential: admin.credential.cert(serviceAccount),
        databaseURL: "https://isdcoaching-dev.firebaseio.com"}) }
 catch (e) { console.log(e) }

// Get a database reference
var db = admin.firestore();
try { db.settings({timestampsInSnapshots:true}) } catch (e) { console.log(e) }


// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

/* test locally with 
firebase functions:shell
userAuthOnCreate({ displayName: 'Michael De Borde', email: 'debordem@isdedu.de'})
userAuthOnCreate({ displayName: 'Ellie De Borde', email: 'el53de17@isdedu.de'})

dev
 userAuthOnCreate({ displayName: 'Michael De Borde', email: 'debordem@isdedu.de', uid: 'YKMJqP0cJbPSOdZzR67w3iIZAbq2'})

0eMZQoJNsedZVhbPxBKoeGBzLL12
*/

/* set up for api call*/
//const cors = require('cors')({origin: true});
//const fetch = require("node-fetch");

const util = require('../../utility/pass.js');

        


exports = module.exports = functions.auth.user().onCreate((user) => {
    return new Promise(
        (resolve, reject) => {
        
            queryUrl = util.wcbs22_prepare_token_query();

            const params = new URLSearchParams();
                    //var params = new URLSearchParams();
            params.append('grant_type','client_credentials');
            params.append('client_id',functions.config().wcbs22.id);
            params.append('client_secret',functions.config().wcbs22.secret);

            queryParams={
                headers:{'User-Agent':'isd-sync-services'},
                body:params,
                method:"POST"
                };

            util.queryAPI(queryUrl,queryParams,"token")

            .then((auth)=>{
                
                queryParams={ headers:{'Authorization':'Bearer ' +auth.access_token, 
                            'User-Agent':'isd-sync-services'},
                            method:"GET"};

                studentQueryUrl = util.wcbs22_prepare_query({
                    endpoint: "Pupils",
                    filter: "Name/EmailAddress eq '"+user.email+"' and Form/AcademicYear eq 2018",
                    select: "NameId"}); // prepare query

                staffQueryUrl = util.wcbs22_prepare_query({
                    endpoint: "Staff",
                    expand: "Name($select = Id)",
                    filter: "InternalEmailAddress  eq '"+user.email+"'",
                    select: "Code"}); // prepare query

                        
                const student = util.queryAPI(studentQueryUrl,queryParams,"pupil-Query");
                
                const staff = util.queryAPI(staffQueryUrl,queryParams,"staff-Query");
        
                return Promise.all([student,staff])

            })
            .then((results) => {

                if (results[0].value.length >=1)
                    { userType = {type : 'student', id: results[0].value[0].NameId} }
            
                else if (results[1].value.length >=1)
                    { userType = {type : 'staff', id: results[1].value[0].Name.Id} }
                
                return userType
            })
            .then((userType) =>{
                // process userType
                console.log("Existing Roles");
                return getClaim(user.uid)
            })
            .then((res) =>{
                console.log(userType);

                //console.log(user.uid);
            
                const customClaims = { [userType.type]: true };
                // Set custom user claims on this newly created user.
                setClaim(user, customClaims)
                resolve(userType);
                return
            })

            .catch(error=>console.log(error));

      
        
    })

})
/* get teh claim */
function getClaim(uid){
    return new Promise(
        (resolve, reject) => {
        
    admin.auth().getUser(uid).then((userRecord) => {
        // The claims can be accessed on the user record.

        staff = (typeof userRecord.customClaims.staff !== 'undefined') ? true : false;
        student = (typeof userRecord.customClaims.student !== 'undefined') ? true : false;

        console.log("Staff :"+staff);
        console.log("Student :"+student);

        resolve()
        return

      })
      .catch(error => {console.log(error);});
    })
}

function setClaim(user, customClaims){

    return admin.auth().setCustomUserClaims(user.uid, customClaims)
    .then(() => {
    // Update real-time database to notify client to force refresh.
    const metadataRef = admin.database().ref("metadata/" + user.uid);
    // Set the refresh time to the current UTC timestamp.
    // This will be captured on the client to force a token refresh.
    return metadataRef.set({refreshTime: new Date().getTime()});
    })
    .catch(error => {
    console.log(error);
    });
}