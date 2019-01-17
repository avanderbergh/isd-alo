import {PolymerElement, html} from '@polymer/polymer/polymer-element.js';
import '@polymer/paper-checkbox/paper-checkbox.js';
import '@polymer/paper-button/paper-button.js';
import '@polymer/paper-icon-button/paper-icon-button.js';
import '@polymer/iron-icons/iron-icons.js';
import '@polymer/paper-spinner/paper-spinner-lite.js';
import {format} from 'date-fns';

import './shared-styles.js';

class CoachingSessionsSessionCard extends PolymerElement {
    static get properties() {
        return {
            session: {
                type: Object
            },
            displayTime: {
                type: String,
                computed: '_computeDisplayTime(session)'
            },
            workshop: Object,
            attending: {
                type: Boolean,
                computed: '_computeAttending(session)'
            },
            attendingLoading: {
                type: Boolean,
                value: false
            },
            presenters: Array
        }
    }

    static get observers() {
        return [
            '_sessionChanged(session)'
        ]
    }

    static get template() {
        return html`
            <style include="shared-styles">
                #sessionCard {
                    border-radius: 5px;
                    padding: 10px;
                    color: #fff;
                    margin-right: 10px;
                    margin-bottom: 10px;
                    background-color: var(--app-primary-color);
                    display: flex;
                    flex-direction: row;
                }

                #attending {
                    border-right: 1px solid var(--google-grey-500);
                    width: 40px;
                }

                #info {
                    padding-left: 10px;
                }

                h3 {
                    margin: 0px;
                }

                p {
                    margin: 0px;
                }

                paper-spinner-lite {
                    --paper-spinner-color: #fff;
                }

            </style>
            <div id="sessionCard">
                <div id="attending">
                    <template is="dom-if" if="{{attendingLoading}}">
                        <paper-spinner-lite active></paper-spinner-lite>
                    </template>
                    <template is="dom-if" if="{{!attendingLoading}}">
                        <template is="dom-if" if="{{!attending}}">
                            <paper-icon-button icon="check-box-outline-blank" on-tap="_handleAttendSessionTapped"></paper-icon-button>
                        </template>
                        <template is="dom-if" if="{{attending}}">
                            <paper-icon-button icon="check-box" on-tap="_handleUnattendSessionTapped"></paper-icon-button>
                        </template>                    
                    </template>
                </div>
                <div id="info">
                    <h3>[[workshop.title]]: [[session.title]] ([[displayTime]])</h3>
                    <p>
                        <template is="dom-repeat" items="{{presenters}}" as="presenter">
                            [[presenter.displayName]]
                        </template>
                    </p>
                </div>
            </div>
        `;
    }

    constructor() {
        super();
    }

    ready() {
        super.ready();
    }

    _fetchWorkshop(session) {
        const db = firebase.firestore();
        if (session) {
            if (session.hasOwnProperty('workshop')) {
                db.collection('workshops').doc(session.workshop).onSnapshot(doc => {
                    this.workshop = doc.data();
                })
            }
        }
    }

    _computeDisplayTime(session) {
        const start = session.startTime.toDate();
        const end = session.endTime.toDate();
        const displayTime = format(start, "H:mm") + ' - ' + format(end, "H:mm");
        return displayTime;
    }

    _sessionChanged(session) {
        console.log('Session Changed', session);
        this._fetchWorkshop(session);
        this._fetchPresenters(session);
    }

    _handleAttendSessionTapped() {
        this.attendingLoading = true;
        firebase.functions().httpsCallable('attendSession')({
            session: this.session.__id__
        }).then(result => {
            console.log(result);
            this.attending = true;
            this.attendingLoading = false;
        })
    }

    _handleUnattendSessionTapped() {
        this.attendingLoading = true;
        firebase.functions().httpsCallable('unattendSession')({
            session: this.session.__id__
        }).then(result => {
            console.log(result);
            this.attending = false;
            this.attendingLoading = false;
        })
    }

    _computeAttending(session) {
        const uid = firebase.auth().getUid()
        if (session.attendees) {
            return session.attendees.includes(uid);
        } else {
            return false;
        }
    }

    _fetchPresenters(session) {
        this.set('presenters', []);
        session.presenters.forEach(presenter => {
            const db = firebase.firestore();
            db.collection('users').doc(presenter).get().then(doc => {
                let user = doc.data();
                this.push('presenters', user);
            })
        });
    }
}

customElements.define('coaching-sessions-session-card', CoachingSessionsSessionCard);