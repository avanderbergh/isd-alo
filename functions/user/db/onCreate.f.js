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

/* test locally with 
firebase functions:shell
userDbOnCreate({ displayName: 'Michael De Borde', email: 'debordem@isdedu.de'})
userDbOnCreate({ displayName: 'Ellie De Borde', email: 'el53de17@isdedu.de'})
*/

/* set up for api call*/
const cors = require('cors')({origin: true});
//const fetch = require("node-fetch");

const util = require('../../utility/pass.js');

exports = module.exports = functions.auth.user().onCreate((user) => {
    console.log("update from pass");
    
	var userObject = {
		displayName : user.displayName,
		email : user.email,
		photoUrl : user.photoURL,
		createdOn : user.metadata.createdAt
    };
    console.log(userObject);
    
        Promise.resolve()
            .then(()=>{
                return util.wcbs22_get_token(); // return the auth with token
            })
            .then((auth) => { 
                
                queryUrl = util.wcbs22_prepare_query({endpoint: "Pupils",
                                         filter: "Name/EmailAddress eq '"+user.email+"' and Form/AcademicYear eq 2018",
                                         select: "NameId"}); // prepare query

                queryParams={ headers:{'Authorization':'Bearer ' +auth.access_token, 'User-Agent':'isd-sync-services'},
                      method:"GET"};
        
               
                return util.queryAPI(queryUrl,queryParams,"pupil-Query");
              
            })
            .then((res) =>{
                pupilResult = res.value; // save result

                queryUrl = util.wcbs22_prepare_query({endpoint: "Staff",
                filter: "InternalEmailAddress  eq '"+user.email+"'",
                select: "Id"}); // prepare query

                return util.queryAPI(queryUrl,queryParams,"staff-Query");
               
                // return the query data
            })
            .then((res) => {
                staffResult = res.value;// save result
                userType = staffResult.length === 0 ? "student" : "staff";
                return console.log(userType); 
            })
            .catch(error=>console.log(error))
    //})
       
    return userObject;
  })

 

