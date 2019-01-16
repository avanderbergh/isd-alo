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
            timeslots: {
                type: Array,
                value: []
            }
        };
    }

    static get observers() {
        return [
            '_dayChanged(day)'
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
            <div>
                <template is="dom-repeat" items="{{timeslots}}" as="timeslot">
                    <p>[[timeslot.startTime]] - [[timeslot.endTime]]</p>
                </template>
            </div>
        `;
    }

    ready() {
        super.ready();
        if (!this.day) {
            this._loadSessions();
        }
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        if (this.snapshotListener) this.snapshotListener();
    }

    _loadSessions(day=null, user=null) {
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
        const startTime = day.startTime.toMillis();
        const endTime = day.endTime.toMillis();
        let time = startTime;
        this.set('timeslots', []);
        while (time < endTime) {
            console.log('time', new Date(time));
            this.push('timeslots', {startTime: new Date(time), endTime: new Date(time + 900000)});
            time += 900000;
        }
        
    }

}

customElements.define('coaching-sessions', CoachingSessions);