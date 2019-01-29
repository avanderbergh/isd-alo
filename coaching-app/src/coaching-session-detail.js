import {PolymerElement, html} from '@polymer/polymer/polymer-element.js';
import '@polymer/app-route/app-route.js';

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
            workshop: Object
        }
    }

    static get template() {
        return html`
            <style>
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
            </style>

            <app-route route="{{route}}" pattern="/:sessionId" data="{{routeData}}">
            </app-route>

            <div id="session-container">
                <h1>[[workshop.title]]</h1>
                <h2>[[session.title]]</h2>
                <p>Location: [[space.name]]</p>
                <p>[[session.description]]</p>
                <h3>Attendees ([[attendees.length]])</h3>
                <div class="attendees-list">
                    <template is="dom-repeat" items="{{attendees}}" as="attendee">
                        <div class="attendee">
                            <img src="[[attendee.namePhoto]]" alt="Photo"/>
                            <p>[[attendee.displayName]]</p>
                        </div>
                    </template>
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

    _routeDataChanged(routeData) {
        const sessionId = routeData.sessionId;
        if (sessionId) {
            const db = firebase.firestore();
            db.collection('sessions').doc(sessionId).get().then(doc => {
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
            if (session.hasOwnProperty('attendees')) {
                this.set('attendees', []);
                session.attendees.forEach(attendeeId => {
                    db.collection('users').doc(attendeeId).get().then(doc => {
                        let user = doc.data();
                        console.log('Attendee', user);
                        this.push('attendees', user);
                    })
                })
            }
        }
    }
}

customElements.define('coaching-session-detail', CoachingSessionDetail);