const functions = require('firebase-functions');
const admin = require('firebase-admin');

/* DEV SETUP 
var serviceAccount = require("../../serviceAccountKeyDev.json");
try { admin.initializeApp(
        {
        credential: admin.credential.cert(serviceAccount),
        databaseURL: "https://isdcoaching-dev.firebaseio.com"
        }) 
    }
 catch (e) { console.log(e)}


 /* PRODUCTION SETUP */
 
var serviceAccount = require("../../serviceAccountKeyProduction.json");

try { admin.initializeApp(
    {
        credential: admin.credential.cert(serviceAccount),
        databaseURL: "https://isdcoaching.firebaseio.com"
    }) 
}
catch (e) { console.log(e)}




 /* PRODUCTION SETUP 
var serviceAccount = require("../../serviceAccountKeyProduction.json");

try { admin.initializeApp(
    {
        credential: admin.credential.cert(serviceAccount),
        databaseURL: "https://isdcoaching.firebaseio.com"
    }) 
}
catch (e) { console.log(e)}
*/


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
userAuthOnCreate({ displayName: 'Ellie De Borde', email: 'el53de17@isdedu.de', uid: '6A3paLCmHnOs3VUPTEQSrlE780t1'})

dev
    userAuthOnCreate({ displayName: 'Michael De Borde', email: 'debordem@isdedu.de', uid: 'bDAGyLUFy7bfRTGslROfJll64FW2'})
*/

/* set up for api call*/
//const cors = require('cors')({origin: true});
//const fetch = require("node-fetch");

const util = require('../../utility/pass.js');

        


exports = module.exports = functions.auth.user().onCreate((user) => {
   
    return new Promise(
        (resolve, reject) => {
           
                var promises = [];
                console.log(user);
                if (user.email && user.uid){
                    const update_one = updateOne(user);
                    promises.push (update_one);
                    
                }
                else {console.log("update Many")
                    // do the update with many users
                    // loop through users... add promises to the array
                    const update_many = updateMany();
                    promises.push (update_many);
                    }
                //console.log(promises);
                return Promise.all(promises);})
                .then(()=>{
                    return resolve();
                })
        
                
            })
   
                


function updateMany(delay){
    return new Promise(
        (resolve, reject) => {
                db.collection("users").get()
                    .then((querySnapshot) => {
                        var promises = [];
                        var delay = 500;
                        querySnapshot.forEach((doc) => {
                            // doc.data() is never undefined for query doc snapshots
                            //console.log(doc.id, " => ", doc.data().displayName);
                            var user = doc.data();
                            user.uid = doc.id;
                            const update_user = updateOne(user,delay += 500);
                            promises.push (update_user);

                        })
                        return Promise.all(promises);
                    })
                    .then(()=>{
                        return resolve();
                    })
                .catch(error=>console.log(error));
            }
    )}





function updateOne(user,delay = 0){
    var userType = {};
    console.log(delay);
    const sleep = d => {
        return new Promise((resolve, reject) => {
            setTimeout(resolve, d)
        })
    }
    sleep(delay).then(() => {
        
        return new Promise(
        (resolve, reject) => {
                util.wcbs22_get_token()
                .then((auth) => {
                
                queryParams={ headers:{'Authorization':'Bearer ' +auth.access_token, 
                            'User-Agent':'isd-sync-services'},
                            method:"GET"};
    
                studentQueryUrl = util.wcbs22_prepare_query({
                    endpoint: "Pupils",
                    expand: "Form($select = Code), Form($expand=FormYear($select=YearNumber))",
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
                                  form: results[0].value[0].Form.Code,
                                  yearNumber: results[0].value[0].Form.FormYear.YearNumber}}
            
                else if (results[1].value.length >=1)
                    { userType = {type : 'staff', 
                                  id: results[1].value[0].Name.Id} }
                
                return userType
            })
            .then(() =>{
                // process userType
                console.log("update one: "+user.displayName);
                //console.log("Existing Roles for "+ user.uid);
                return getClaim(user.uid)
            })
            .then((res) =>{
                console.log(userType);
                const customClaims = { [userType.type]: true };
                setClaim(user, customClaims); // Set custom user claims on this newly created user.
                return userType;
            })
            .then((userType)=>{
                var newPromises = [];
    
                const photo = insertUserPhoto(user.uid,userType.id);
                newPromises.push(photo);
                if (userType.type === "student")
                {
                    const form = insertStudentForm(user.uid,userType);
                    newPromises.push(form); 
                }
    
                return Promise.all(newPromises);
            })
            .then(()=>{
                return resolve();
            })
            .catch(error=>console.log(error));
        }) 
    })
    .catch(error=>console.log(error));
}



function insertStudentForm(uid,userData){
    return new Promise(
        (resolve, reject) => {
            var docRef = db.collection("users").doc(uid);
           
            return resolve (docRef.set({
                form:userData.form,
                yearNumber:userData.yearNumber}
                ,{ merge: true }));
            })
            .catch((error) => {
                console.log("Error getting document:", error);

            });
        
}


function insertUserPhoto(uid,id){
    var image = "";
    return new Promise(
        (resolve, reject) => {
            getUserPhotoFromPass(id)
            .then((res) => { 
                if (res){
                    img = res;
                    image = String("data:image/jpeg;base64,"+img);
                    var docRef = db.collection("users").doc(uid);
                    docRef.set({namePhoto:image},{ merge: true })}
                
                return
            })
            .then(()=>{
                console.log("INSERT PHOTO DONE for: " +uid);
                return resolve;
            })
            .catch((error) => {
                console.log("Error getting document:", error);
                return reject;
            });
        })

}

function getUserPhotoFromPass(id){
  
    //https://3sys.isdedu.de/Wcbs.API.2.2/api/names(1900523146)/photo
    
    
    return new Promise(
        (resolve, reject) => {
        
          util.wcbs22_get_token()
          .then((auth) => { 
            //console.log("Get the Photo for "+id);

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
            //console.log("END OF get_user_photo ");
            return resolve (base64data);
            
          })
          
        .catch(error=>{
            console.log("PHOTO ERROR: "+error);
            return reject });
  
  })
}





/* get teh claim */
function getClaim(uid){
    return new Promise(
        (resolve, reject) => {
        
        admin.auth().getUser(uid).then((userRecord) => {
        // The claims can be accessed on the user record.
        console.log(userRecord);
        if (typeof userRecord.customClaims !== 'undefined'){

            staff = (typeof userRecord.customClaims.staff !== 'undefined') ? true : false;
            student = (typeof userRecord.customClaims.student !== 'undefined') ? true : false;

            console.log("Staff :"+staff);
            console.log("Student :"+student);
        }
        else{
            console.log("No custom Claims");
        }

        return resolve()
       

      })
      .catch(error => {console.log(error);});
    })
}

function setClaim(user, customClaims){
    return new Promise(
        (resolve, reject) => {

            return admin.auth().setCustomUserClaims(user.uid, customClaims)
            .then(() => {
            // Update real-time database to notify client to force refresh.
            const metadataRef = admin.database().ref("metadata/" + user.uid);
            // Set the refresh time to the current UTC timestamp.
            // This will be captured on the client to force a token refresh.
            return resolve (metadataRef.set({refreshTime: new Date().getTime()}));
            
            })
            .catch(error => {
            console.log(error);
    });
})  
}