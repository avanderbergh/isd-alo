import {PolymerElement, html} from '@polymer/polymer/polymer-element.js';
import '@polymer/paper-button/paper-button.js';
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
                    width: 240px;
                    border-radius: 5px;
                    padding: 10px;
                    margin: 12px;
                    text-align: center;
                    color: #fff;
                    background-color: var(--app-primary-color);
                    cursor: pointer;
                }

            </style>
            <div id="sessionCard">
                <h1>[[workshop.title]]</h1>
                <h2>[[session.title]]</h1>
                <h3>[[displayTime]]</h2>
                <template is="dom-repeat" items="{{presenters}}" as="presenter">
                    <p>[[presenter.displayName]]</p>
                </template>
                <template is="dom-if" if="{{attending}}">
                    <p>You're attending</p>
                </template>
                <template is="dom-if" if="{{!attending}}">
                    <paper-button on-tap="_handleAttendSessionTapped">Attend</paper-button>
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
        firebase.functions().httpsCallable('attendSession')({
            session: this.session.__id__
        }).then(result => {
            console.log(result);
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