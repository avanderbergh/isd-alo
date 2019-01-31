import {PolymerElement, html} from '@polymer/polymer/polymer-element.js';
import '@polymer/app-route/app-route.js';
import '@polymer/paper-input/paper-input.js';
import '@polymer/paper-input/paper-textarea.js';

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
            showEditSessionTitle: {
                type: Boolean,
                value: false
            },
            showEditSessionDescription: {
                type: Boolean,
                value: false
            }
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
                <template is="dom-if" if="{{sessionPresenter}}">
                    <p>You're presenting this session</p>
                </template>
                <h1>[[workshop.title]]</h1>
                <template is="dom-if" if="{{!showEditSessionTitle}}">
                    <h2 on-tap="_handleSessionTitleTapped">[[session.title]]</h2>
                </template>
                <template is="dom-if" if="{{sessionPresenter}}">
                    <template is="dom-if" if="{{showEditSessionTitle}}">
                        <paper-input value="{{session.title}}" on-keydown="_checkForEnterOnSessionTitle"></paper-input>
                    </template>
                </template>
                <p>Location: [[space.name]]</p>
                <template is="dom-if" if="{{!showEditSessionDescription}}">
                    <p on-tap="_handleSessionDescriptionTapped">[[session.description]]</p>
                </template>
                <template is="dom-if" if="{{showEditSessionDescription}}">
                    <paper-textarea value="{{session.description}}" on-keydown="_checkForEnterOnSessionDescription"></paper-textarea>
                </template>
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

    _computeSessionPresenter(session){
        if (session) {
            const uid = firebase.auth().getUid();
            console.log('Uid', uid);
            return session.presenters.includes(uid);
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
}

customElements.define('coaching-session-detail', CoachingSessionDetail);