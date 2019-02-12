import {PolymerElement, html} from '@polymer/polymer/polymer-element.js';
import '@polymer/app-route/app-route.js';
import '@polymer/paper-input/paper-input.js';
import '@polymer/paper-input/paper-textarea.js';
import '@polymer/paper-button/paper-button.js';
import '@polymer/paper-spinner/paper-spinner-lite.js';
import './coaching-session-attendance.js';
import './shared-styles.js';

class CoachingSessionDetail extends PolymerElement {
    static get properties() {
        return {
            attendees: Array,
            route: Object,
            routeData: {
                type: Object,
                observer: '_routeDataChanged'
            },
            session: {
                type: Object,
                observer: '_sessionChanged'
            },
            user: Object,
            workshop: Object,
            sessionPresenter: {
                type: Boolean,
                computed: '_computeSessionPresenter(session)'
            },
            sessionAttendee: {
                type: Boolean,
                computed: '_computeSessionAttendee(session)'
            },
            showEditSessionTitle: {
                type: Boolean,
                value: false
            },
            showEditSessionDescription: {
                type: Boolean,
                value: false
            },
            attendingLoading: {
                type: Boolean,
                value: false
            },
            sessionFull: {
                type: Boolean,
                computed: '_computeSessionFull(session)'
            }
        }
    }

    static get template() {
        return html`
            <style include="shared-styles">
                #session-container {
                    margin: 12px;
                }

                .attendees-list {
                    display: flex;
                    flex-direction: row;
                    flex-wrap: wrap;
                }

                .attendee {
                    padding: 10px;
                    align-content: center;
                }

                paper-button {
                    color: #fff;
                    background-color: var(--app-secondary-color);
                }
            </style>

            <app-route route="{{route}}" pattern="/:sessionId" data="{{routeData}}">
            </app-route>

            <div id="session-container" class="card">
                <h1>[[workshop.title]]: <span on-tap="_handleSessionTitleTapped">[[session.title]]</span></h1>
                <template is="dom-if" if="{{sessionPresenter}}">
                    <template is="dom-if" if="{{showEditSessionTitle}}">
                        <paper-input value="{{session.title}}" on-keydown="_checkForEnterOnSessionTitle"></paper-input>
                    </template>
                </template>
                <p><b>Location:</b> [[space.name]]</p>
                <template is="dom-if" if="{{!showEditSessionDescription}}">
                    <p on-tap="_handleSessionDescriptionTapped">[[session.description]]</p>
                </template>
                <template is="dom-if" if="{{showEditSessionDescription}}">
                    <paper-textarea value="{{session.description}}" on-keydown="_checkForEnterOnSessionDescription"></paper-textarea>
                </template>
                <template is="dom-if" if="{{attendingLoading}}">
                    <paper-spinner-lite active></paper-spinner-lite>
                </template>
                <template is="dom-if" if="{{!attendingLoading}}">
                    <template is="dom-if" if="{{!sessionAttendee}}">
                        <template is="dom-if" if="{{!sessionFull}}">
                            <paper-button on-tap="_handleAttendSessionTapped">Attend</paper-button>
                        </template>
                        <template is="dom-if" if="{{sessionFull}}">
                            <div>
                                <p><b>This session is full!</b></p>
                            </div>
                        </template>
                    </template>
                    <template is="dom-if" if="{{sessionAttendee}}">
                        <paper-button on-tap="_handleUnattendSessionTapped">Leave</paper-button>
                    </template>
                </template>
                <h3>[[session.attendees.length]] Attendees</h3>
                <template is="dom-if" if="{{sessionPresenter}}">
                    <coaching-session-attendance session="[[session]]"></coaching-session-attendance>
                </template>
            </div>
        `;
    }

    constructor() {
        super();
    }

    ready() {
        super.ready();
    }

    _routeDataChanged(routeData) {
        const sessionId = routeData.sessionId;
        if (sessionId) {
            const db = firebase.firestore();
            db.collection('sessions').doc(sessionId).onSnapshot(doc => {
                if (doc.exists) {
                    let session = doc.data();
                    session.__id__ = doc.id;
                    this.set('session', session);
                } else {
                    this.set('session', null);
                }
            })
        }
    }

    _sessionChanged(session) {
        this.showEditSessionDescription = false;
        this.showEditSessionTitle = false;
        if (session) {
            const db = firebase.firestore();
            db.collection('workshops').doc(session.workshop).get().then(doc => {
                const workshop = doc.data();
                this.set('workshop', workshop);
            });
            db.collection('spaces').doc(session.space).get().then(doc => {
                const space = doc.data();
                this.set('space', space);
            })
        }
    }

    _computeSessionPresenter(session){
        if (session) {
            if (session.presenters) {
                const uid = firebase.auth().getUid();
                console.log('Uid', uid);
                return session.presenters.includes(uid);
            } else {
                return false;
            }
        } else {
            return false;
        }
    }

    _computeSessionAttendee(session) {
        if (session) {
            if (session.attendees) {
                const uid = firebase.auth().getUid();
                console.log('Uid', uid);
                return session.attendees.includes(uid);
            } else {
                return false;
            }
        } else {
            return false;
        }
    }

    _handleSessionTitleTapped() {
        if (this.sessionPresenter) this.showEditSessionTitle = true;
    }

    _handleSessionDescriptionTapped() {
        if (this.sessionPresenter) this.showEditSessionDescription = true;
    }

    _checkForEnterOnSessionTitle(e){
        if (this.sessionPresenter) {
            if (e.keyCode == 13) {
                const db = firebase.firestore();
                db.collection('sessions').doc(this.session.__id__).update({
                    title: this.session.title
                }).then(() => {
                    this.showEditSessionTitle = false;
                })
            }
        }
    }

    _checkForEnterOnSessionDescription(e) {
        if (this.sessionPresenter) {
            if (e.keyCode == 13) {
                const db = firebase.firestore();
                db.collection('sessions').doc(this.session.__id__).update({
                    description: this.session.description
                }).then(() => {
                    this.showEditSessionDescription = false;
                })
            }
        }
    }

    _handleAttendSessionTapped() {
        this.attendingLoading = true;
        firebase.functions().httpsCallable('attendSession')({
            session: this.session.__id__
        }).then(result => {
            this.sessionAttendee = true;
            this.attendingLoading = false;
            //this.dispatchEvent(new CustomEvent('attended'));
        })
    }

    _handleUnattendSessionTapped() {
        this.attendingLoading = true;
        firebase.functions().httpsCallable('unattendSession')({
            session: this.session.__id__
        }).then(result => {
            console.log(result);
            this.sessionAttendee = false;
            this.attendingLoading = false;
            //this.dispatchEvent(new CustomEvent('attended'));
        })
    }

    _computeSessionFull(session) {
        if (session.attendees) {
            return session.attendees.length >= parseInt(session.capacity)
        } else {
            return false;
        }
    }
}

customElements.define('coaching-session-detail', CoachingSessionDetail);