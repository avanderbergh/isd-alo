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
            timeslot: Object,
            formYear: {
                type: Number,
                observer: '_formYearChanged'
            }
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
                <template is="dom-repeat" items="{{sessions}}" as="session">
                    <coaching-sessions-session-card session="[[session]]" on-attended="_handleSessionAttended"></coaching-sessions-session-card>
                </template>
            </div>
        `;
    }

    ready() {
        super.ready();
        if (!this.day && !this.timeslot) {
            this._loadSessions(null,this.user,null);
        }
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        if (this.snapshotListener) this.snapshotListener();
    }

    _loadSessions(day=null, user=null, timeslot=null, formYear=null) {
        const db = firebase.firestore();

        let query = db.collection('sessions');
        if (day) {
            console.log('filtering by day')
            query = query.where('startTime', '>=', day.startTime)
                .where('startTime', '<=', day.endTime)
        }
        
        if (user) {
            console.log('filtering by user',user);
            query = query.where('attendees', 'array-contains', user.uid)
        }

        if (formYear) {
            console.log('filering by form year')
            query = query.where('grades', 'array-contains', formYear)
        }

        if (timeslot) {
            console.log('filtering by timeslot');
            query = query.where('startTime', '>=', timeslot.startTime)
                .where('startTime', '<', timeslot.endTime);
        }
        if (this.snapshotListener) {
            this.snapshotListener();
        }

        this.snapshotListener = query.orderBy('startTime')
            .onSnapshot(querySnapshot => {
                const uid = firebase.auth().getUid();
                this.set('sessions', []);
                querySnapshot.forEach(doc => {
                    let session = doc.data();
                    session.__id__ = doc.id;
                    this.push('sessions', session)
                })
        })
    }

    _dayChanged(day) {
        this._loadSessions(day, this.user);        
    }

    _timeslotChanged(timeslot) {
        this._loadSessions(null, null, timeslot, this.formYear);
    }

    _formYearChanged(formYear) {
        if (this.timeslot) {
            this._loadSessions(null, null, this.timeslot, formYear);
        }
    }

    _handleSessionAttended() {
        this.dispatchEvent(new CustomEvent('attended'))
    }

}

customElements.define('coaching-sessions', CoachingSessions);