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

var ref = db.collection("users");

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
 userAuthOnCreate({ displayName: 'Ellie De Borde', email: 'el53de17@isdedu.de', uid: 'oRomhD1EiRcVoW6LRUdTZuec7Ey2'})
 userAuthOnCreate({ displayName: 'Michael De Borde', email: 'debordem@isdedu.de', uid: 'cxKq1XSEyZcXmedglJoHFE5LxD73'})
0eMZQoJNsedZVhbPxBKoeGBzLL12
*/

/* set up for api call*/
//const cors = require('cors')({origin: true});
//const fetch = require("node-fetch");

const util = require('../../utility/pass.js');

        


exports = module.exports = functions.auth.user().onCreate((user) => {
    return new Promise(
        (resolve, reject) => {
            util.wcbs22_get_token()
            .then((auth)=>{
                
                queryParams={ headers:{'Authorization':'Bearer ' +auth.access_token, 
                            'User-Agent':'isd-sync-services'},
                            method:"GET"};

                studentQueryUrl = util.wcbs22_prepare_query({
                    endpoint: "Pupils",
                    expand: "Form($select = Code)",
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
                    { userType = {type : 'student', 
                                  id: results[0].value[0].NameId,
                                  form: results[0].value[0].Form.Code}}
            
                else if (results[1].value.length >=1)
                    { userType = {type : 'staff', 
                                  id: results[1].value[0].Name.Id} }
                
                return userType
            })
            .then(() =>{
                // process userType

                console.log("Existing Roles");
                return getClaim(user.uid)
            })
            .then((res) =>{
                console.log(userType);
                const customClaims = { [userType.type]: true };
                setClaim(user, customClaims); // Set custom user claims on this newly created user.
                return userType;
            })
            .then((userType)=>{
                var promises = [];
                const photo = insertUserPhoto(user.uid,userType.id);
                promises.push(photo);
                if (userType.type === "student")
                {
                    const form = insertStudentForm(user.uid,userType);
                    promises.push(form); 
                }
                return Promise.all(promises);
            })
            .then(()=>{
                return resolve();
            })

            .catch(error=>console.log(error));

      
        
    })

})

function insertStudentForm(uid,userData){
    return new Promise(
        (resolve, reject) => {
            var docRef = db.collection("users").doc(uid);
            
            resolve (docRef.set({form:userData.form},{ merge: true }));
            return
            })
            .catch((error) => {
                console.log("Error getting document:", error);
            });
        

}


function insertUserPhoto(uid,id){
    return new Promise(
        (resolve, reject) => {
            var docRef = db.collection("users").doc(uid);
            getUserPhotoFromPass(id)
            .then((img) => {
                var image = String("data:image/jpeg;base64,"+img);
                resolve (docRef.set({namePhoto:image},{ merge: true }));
                return
            })
            .catch((error) => {
                console.log("Error getting document:", error);
            });
        })

}

function getUserPhotoFromPass(id){
  
    //https://3sys.isdedu.de/Wcbs.API.2.2/api/names(1900523146)/photo
    
    
    return new Promise(
        (resolve, reject) => {
        
          util.wcbs22_get_token()
          .then((auth) => { 
            console.log("Get the Photo for "+id);

            photoQueryUrl = util.wcbs22_prepare_photo_query() + "names("+id+")/photo"; // prepare query
            //console.log(photoQueryUrl);
            queryParams={ headers:{'Authorization':'Bearer ' +auth.access_token, 'User-Agent':'isd-sync-services'},
                          method:"GET"};
            
            return util.queryAPI(photoQueryUrl,queryParams,"get_user_photo");
            // return the query data
          })
          .then( (queryData) => {
            let buff = new Buffer(queryData);  
            let base64data = buff.toString('base64'); // convert to Base 64
            console.log("END OF get_user_photo ");
            resolve (base64data);
            return
          })
          
        .catch(error=>console.log("PHOTO: "+error))
  
  })
}





/* get teh claim */
function getClaim(uid){
    return new Promise(
        (resolve, reject) => {
        
    admin.auth().getUser(uid).then((userRecord) => {
        // The claims can be accessed on the user record.
        if (typeof userRecord.customClaims !== 'undefined'){

            staff = (typeof userRecord.customClaims.staff !== 'undefined') ? true : false;
            student = (typeof userRecord.customClaims.student !== 'undefined') ? true : false;

            console.log("Staff :"+staff);
            console.log("Student :"+student);
        }
        else{
            console.log("No custom Claims");
        }

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