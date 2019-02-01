import {PolymerElement, html} from '@polymer/polymer/polymer-element.js';
import '@polymer/paper-checkbox/paper-checkbox.js';
import '@polymer/paper-button/paper-button.js';
import '@polymer/paper-icon-button/paper-icon-button.js';
import '@polymer/iron-icons/iron-icons.js';
import '@polymer/paper-spinner/paper-spinner-lite.js';
import '@polymer/paper-progress/paper-progress.js';
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
                computed: '_computeAttending(session)',
                notify: true
            },
            attendingLoading: {
                type: Boolean,
                value: false
            },
            presenters: Array,
            sessionFull: {
                type: Boolean,
                computed: '_computeFull(session)'
            }
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
                html {
                    --card-background-color: #fff;
                    --card-title-color: var(--app-primary-color);
                    --card-text-color: var(--google-grey-700);
                }

                #sessionCard {
                    border-radius: 5px;
                    padding: 10px;
                    color: var(--card-text-color);
                    margin-right: 10px;
                    margin-bottom: 10px;
                    background-color: var(--card-background-color);
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

                a, a:visited{
                    color: var(--card-title-color);
                    text-decoration: none;
                }

                p {
                    margin: 0px;
                }

                paper-spinner-lite {
                    --paper-spinner-color: #000;
                }

                paper-progress {
                    margin-top: 10px;
                    width: 100%;
                    --paper-progress-active-color: var(--google-grey-700);
                    --paper-progress-container-color: var(--google-grey-300);
                }

            </style>
            <div id="sessionCard">
                <div id="attending">
                    <template is="dom-if" if="{{attendingLoading}}">
                        <paper-spinner-lite active></paper-spinner-lite>
                    </template>
                    <template is="dom-if" if="{{!attendingLoading}}">
                        <template is="dom-if" if="{{!attending}}">
                            <template is="dom-if" if="{{sessionFull}}">
                                Full!
                            </template>
                            <template is="dom-if" if="{{!sessionFull}}">
                                <paper-icon-button icon="check-box-outline-blank" on-tap="_handleAttendSessionTapped"></paper-icon-button>
                            </template>
                        </template>
                        <template is="dom-if" if="{{attending}}">
                            <paper-icon-button icon="check-box" on-tap="_handleUnattendSessionTapped"></paper-icon-button>
                        </template>                    
                    </template>
                </div>
                <div id="info">
                    <a href="/sessions/[[session.__id__]]">
                        <h3>[[workshop.title]]: [[session.title]] ([[displayTime]])</h3>
                    </a>
                    <p>
                        <template is="dom-repeat" items="{{presenters}}" as="presenter">
                            [[presenter.displayName]]
                        </template>
                    </p>
                    <paper-progress max="[[session.capacity]]" value="[[session.attendees.length]]"></paper-progress>
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
            //this.dispatchEvent(new CustomEvent('attended'));
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
            //this.dispatchEvent(new CustomEvent('attended'));
        })
    }

    _computeAttending(session) {
        const uid = firebase.auth().getUid()
        if (session.attendees) {
            if (session.attendees.includes(uid)){
                this._applyAttendingStyle();
                return true;
            } else {
                this._applyNotAttendingStyle();
                return false;
            }
        } else {
            this._applyNotAttendingStyle();
            return false;
        }
    }

    _applyAttendingStyle() {
        this.updateStyles({
            '--card-background-color': 'var(--app-primary-color)',
            '--card-title-color': '#fff',
            '--card-text-color': '#fff'
        })
    }

    _applyNotAttendingStyle() {
        this.updateStyles({
            '--card-background-color': '#fff',
            '--card-title-color': 'var(--app-primary-color)',
            '--card-text-color' : 'var(--google-grey-700)'
        })
    }

    _fetchPresenters(session) {
        session.presenters.forEach(presenter => {
            const db = firebase.firestore();
            db.collection('users').doc(presenter).get().then(doc => {
                this.set('presenters', []);
                let user = doc.data();
                this.push('presenters', user);
            })
        });
    }

    _computeFull(session) {
        if (!session.hasOwnProperty('attendees')) {
            return false;
        } else {
            return session.attendees.length >= session.capacity
        }
    }
}

customElements.define('coaching-sessions-session-card', CoachingSessionsSessionCard);