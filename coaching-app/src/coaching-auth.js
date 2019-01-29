import {
    PolymerElement,
    html
} from '@polymer/polymer/polymer-element.js';

import {gapiConfig} from './env-config.js';

class coachingAuth extends PolymerElement {
    static get properties() {
        return {
            loading: {
                type: Boolean,
                notify: true
            },
            signedIn: {
                type: Boolean,
                notify: true
            },
            user: {
                type: Object,
                notify: true
            }
        }
    }

    ready() {
        super.ready();
        new Promise((resolve, reject) => gapi.load('client:auth2', () => resolve()))
            .then(() => {
                return gapi.client.init(gapiConfig())
            })
            .then(() => {
                gapi.auth2.getAuthInstance().isSignedIn.listen(this._updateSigninStatus.bind(this));
                this._updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
                this.loading = false;
            });

        firebase.auth().onAuthStateChanged(firebaseUser => {
            this._firebaseAuthStateChanged(firebaseUser);
        });
    }

    _updateSigninStatus(isSignedIn) {
        if (isSignedIn) {
            const auth2 = gapi.auth2.getAuthInstance()
            const currentUser = auth2.currentUser.get()
            const authResponse = currentUser.getAuthResponse(true)
            const credential = firebase.auth.GoogleAuthProvider.credential(
                authResponse.id_token,
                authResponse.access_token
            )
            firebase.auth().signInAndRetrieveDataWithCredential(credential);
        } else {
            console.log('gapi signed out, signing out firebase')
            firebase.auth().signOut()
            
        }
    }

    _firebaseAuthStateChanged(firebaseUser) {
        if (firebaseUser) {
            this.loading = true;
            firebase.auth().currentUser.getIdTokenResult()
            .then((idTokenResult) => {
                console.log('User Claims', idTokenResult.claims);
                if (idTokenResult.claims.staff || idTokenResult.claims.student) {
                    this.signedIn = true;
                    const db = firebase.firestore();
                    db.collection('users').doc(firebaseUser.uid).get().then(doc => {
                        if (doc.exists) {
                            let user = doc.data();
                            user.uid = doc.id;
                            user.claims = idTokenResult.claims;
                            db.collection('users').doc(firebaseUser.uid).update({
                                displayName: firebaseUser.displayName,
                                email: firebaseUser.email,
                                photoURL: firebaseUser.photoURL
                            }).then(() =>{
                                console.log('User Updated');
                                this.user = user; /* todo: update usertypes */
                                this.loading = false;
                            })
                        } else {
                            const user = {
                                displayName: firebaseUser.displayName,
                                email: firebaseUser.email,
                                photoURL: firebaseUser.photoURL
                            };
                            db.collection('users').doc(firebaseUser.uid).set(user)
                                .then(() => {
                                    console.log('Added the user');
                                    user.claims = idTokenResult.claims;
                                    this.user = user;
                                    this.loading = false;
                                });
                        }
                    })
                } else {
                    console.log('User has no claims, try again');
                    const sleep = milliseconds => {
                        return new Promise(resolve => setTimeout(resolve, milliseconds))
                    }
                    sleep(3000).then(() => {
                        this._firebaseAuthStateChanged(firebaseUser);
                    })
                }
            })
        } else {
            this.signedIn = false;
            this.user = null;
        }
    }

    signIn() {
        const auth2 = gapi.auth2.getAuthInstance()
        if (auth2.isSignedIn.get()) {
            console.log('Already Signed In');
            return
        }
        auth2.signIn()
            .catch(error => {
                console.error(`sign in error: ${error}`)
            })
    }

    signOut() {
        gapi.auth2.getAuthInstance().signOut()
    }
}

customElements.define('coaching-auth', coachingAuth);