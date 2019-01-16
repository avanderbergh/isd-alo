import {
    PolymerElement,
    html
} from '@polymer/polymer/polymer-element.js';

import('./shared-styles.js');
import('./coaching-sessions-session-card.js');


class CoachingSessions extends PolymerElement {

    static get properties() {
        return {
            day: Object,
            snapshotListener: Object,
            sessions: {
                type: Array,
                value: []
            },
            title: String,
            user: Object,
            timeslot: Object
        };
    }

    static get observers() {
        return [
            '_dayChanged(day)',
            '_timeslotChanged(timeslot)'
        ]
    }

    static get template() {
        return html `
            <style include="shared-styles">
                :host {
                display: block;

                padding: 10px;
                }
                
                #sessionsContainer {
                    display: flex;
                    flex-wrap: wrap;
                }
            </style>

            <h1>[[title]]</h1>
            <div id="sessionsContainer">
                <dom-repeat items="{{sessions}}" as="session">
                    <template>
                        <coaching-sessions-session-card session="[[session]]"></coaching-sessions-session-card>
                    </template>          
                </dom-repeat>
            </div>
        `;
    }

    ready() {
        super.ready();
        if (!this.day && !this.timeslot) {
            this._loadSessions();
        }
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        if (this.snapshotListener) this.snapshotListener();
    }

    _loadSessions(day=null, user=null, timeslot=null) {
        const db = firebase.firestore();

        let query = db.collection('sessions');
        if (day) {
            console.log('filtering by day')
            query = query.where('startTime', '>=', day.startTime)
                .where('startTime', '<=', day.endTime)
        }
        if (user) {
            console.log('filtering by user')
            query = query.where('presenters', 'array-contains', user.uid)
        }

        if (timeslot) {
            console.log('filtering by timeslot');
            query = query.where('startTime', '>=', timeslot.startTime)
                .where('startTime', '<', timeslot.endTime);
        }
        this.snapshotListener = query.orderBy('startTime')
            .onSnapshot(querySnapshot => {
                this.set('sessions', []);
                querySnapshot.forEach(doc => {
                    let session = doc.data();
                    session.__id__ = doc.id;
                    this.push('sessions', session)
                })
        })
    }

    _dayChanged(day) {
        console.log('Day Changed', day);
        this._loadSessions(day, this.user);        
    }

    _timeslotChanged(timeslot) {
        this._loadSessions(null, this.user, timeslot);
    }

}

customElements.define('coaching-sessions', CoachingSessions);