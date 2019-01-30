var assert = require('assert');
describe('Firestore', function() {
  describe('Query data', function() {
    var firebase = require('firebase').initializeApp({
        apiKey: "***REMOVED***",
        authDomain: "isdcoaching-dev.firebaseapp.com",
        databaseURL: "https://isdcoaching-dev.firebaseio.com",
        projectId: "isdcoaching-dev",
        storageBucket: "isdcoaching-dev.appspot.com",
        messagingSenderId: "***REMOVED***"
        
    });
    var ref = firebase.firestore();


    it('should return stage-days', function() {
        
        var daysRef = ref.collection('stage-days')
                            .onSnapshot(
                                querySnapshot =>{
                                    querySnapshot.forEach(doc => {
                        
                                        console.log('doc',doc.data())
                                    
                                })
                                }

                            );
    });

    it('should return user with id', function() {
        
        var usersDoc = ref.collection('users').doc('7b5jMHPOoXhipEr1ndAwuPrfQ4a2').get()
        .then(function(doc) {
            if (doc.exists) {
                console.log("Document data:", doc.data().displayName);
            } else {
                // doc.data() will be undefined in this case
                console.log("No such document!");
            }
        }).catch(function(error) {
            console.log("Error getting document:", error);
        });
        
   
    });

    it('should return coach with assigned form', function() {
        
        var usersDoc = ref.collection('users').where("assignedForm","==","AAAA").onSnapshot(
            querySnapshot =>{
                querySnapshot.forEach(doc => {
    
                    console.log('doc',doc.data().displayName)
                
            })
            }

        );
        
   
    });

    it('should return coachees with assigned coach', function() {
        
        var usersDoc = ref.collection('users').where("mentor","==","7b5jMHPOoXhipEr1ndAwuPrfQ4a2").onSnapshot(
            querySnapshot =>{
                querySnapshot.forEach(doc => {
    
                    console.log('doc',doc.data().displayName)
                
            })
            }

        );
        
   
    });

    



  });
});