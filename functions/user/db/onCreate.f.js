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
*/

/* set up for api call*/
const cors = require('cors')({origin: true});
//const fetch = require("node-fetch");
var fetch = require("fetch-retry");

const endPointUrl = 'https://3sys.isdedu.de/Wcbs.API.2.2/api/';

require('url-search-params-polyfill');
const params = new URLSearchParams();

//var params = new URLSearchParams();
params.append('grant_type','client_credentials');
params.append('client_id',functions.config().wcbs22.id);
params.append('client_secret',functions.config().wcbs22.secret);

var otherParams={
  headers:{'User-Agent':'isd-sync-services'},
  body:params,
  method:"POST"
};

/* end of setup */

/* ***********************************
Function to query an API
************************************/
var queryAPI = function(url,params,desc){ 

    return new Promise((resolve) => fetch(url,params,{
      retries: 3,
      retryDelay: 1000
    })
    .then((res) => {
      console.log(desc+": HEADERS "+ res.headers.get("content-type")); 
      // eslint-disable-next-line promise/always-return
      if (res.headers.get("content-type") !== null){
          if (res.headers.get("content-type").includes("application/json")){
            output = res.json();
          }
          else if (res.headers.get("content-type") === "image/jpeg") {
            output = res.buffer(); // binary data in full
          }
      else {
        console.log (res);
      }
      //console.log(output);
      return output;
    }})
    .then((result) => resolve(result)));
  }

  /********************************
 * Prepare the query
 *******************************/
function prepare_query(top){
    var endpoint = "Pupils";
    var queryParts = [];
        queryParts.push("$expand=Name($select=Id,FirstNames,Surname,EmailAddress),Form($expand=FormYear($select=YearNumber))");
        queryParts.push("$filter=Form/FormYear/YearNumber eq 7");
        queryParts.push("$select=Id,Code");
        queryParts.push("$top="+top);
    var query = queryParts.join('&');
  
    return endPointUrl+'schools(1)/'+endpoint+'?'+query;
  }
  

exports = module.exports = functions.auth.user().onCreate((user) => {
    console.log("update from pass");
    
	var userObject = {
		displayName : user.displayName,
		email : user.email,
		photoUrl : user.photoURL,
		createdOn : user.metadata.createdAt
    };
    console.log(userObject);

    //cors(request, response, () => {

        Promise.resolve()
            .then(()=>{
                return queryAPI(endPointUrl+'token',otherParams,"token"); // return the auth with token
            })
            .then((auth) => { 
                queryUrl = prepare_query(10); // prepare query with request.body.data
                queryParams={ headers:{'Authorization':'Bearer ' +auth.access_token, 'User-Agent':'isd-sync-services'},
                      method:"GET"};
        
                return queryAPI(queryUrl,queryParams,"pupil-Query");

                // return the query data
            })
            .then( (queryData) => {

                /* create a reference to the students db
                GEt the ID then validate that it exists or not
                Then update or create the document for the student
                */
                var obj = queryData.value;
                return console.log(obj);
            })
            .catch(error=>console.log(error))
    //})
       
    return userObject;
  })

 

