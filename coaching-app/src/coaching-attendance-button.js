import {PolymerElement, html} from '@polymer/polymer/polymer-element.js';
import '@polymer/iron-icon/iron-icon.js';

class CoachingAttendanceButton extends PolymerElement {
    static get properties() {
        return {
            attendance: {
                type: Boolean,
                value: false
            },
            sessionId: String,
            userId: {
                type: String,
                observer: '_userIdChanged'

            },
            user: {
                type: Object,
                observer: '_userChanged'
            }
        }
    }

    static get template() {
        return html`
            <style>
                :host {
                    --image-background: 'hello'
                }
                #attendance-button {
                    cursor: pointer;
                    background-image: var(--image-background);
                    background-position-y: center;
                    background-size: cover;
                    width: 120px;
                    height: 120px;
                    border-radius: 999px;
                    margin: auto;
                }

                #check-icon {
                    --iron-icon-height: 120px;
                    --iron-icon-width: 120px;
                    color: var(--google-green-500);
                }

                #button-container {
                    text-align: center;
                }
                
            </style>
            <div id="button-container">
                <div id="attendance-button" on-tap="_handleImageTapped">
                    <template is="dom-if" if="{{attendance}}">
                        <iron-icon id="check-icon" icon="check"></iron-icon>
                    </template>
                </div>
                <p>[[user.displayName]]</p>
            </div>
        `;
    }

    constructor() {
        super();
    }

    ready() {
        super.ready();
    }

    _userIdChanged(userId) {
        if (userId) {
            const db = firebase.firestore();
            db.collection('users').doc(userId).onSnapshot(doc => {
                let user = doc.data()
                this.set('user', user);
            })
            db.collection('sessions').doc(this.sessionId)
                .collection('attendance').doc(this.userId)
                .onSnapshot(doc => {
                    console.log('attendance doc', doc);
                    if (doc.exists) {
                        this.attendance = doc.data().value;
                    } else {
                        this.attendance = false;
                    }
                })
        }
    }

    _userChanged(user) {
        if (user) {
            if (user.namePhoto) {
                this.updateStyles({
                    '--image-background': 'url('+user.namePhoto+')'
                });
            }
        }
    }

    _handleImageTapped() {
        const db = firebase.firestore();
        db.collection('sessions').doc(this.sessionId)
            .collection('attendance').doc(this.userId).set({
                value: !this.attendance
            }, {merge: true});
        
    }
}

customElements.define('coaching-attendance-button', CoachingAttendanceButton);