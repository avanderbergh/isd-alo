import {PolymerElement, html} from '@polymer/polymer/polymer-element.js';
import './coaching-coachees-session-card.js';

class CoachingCoacheesSessions extends PolymerElement {
    static get properties() {
        return {
            day: Object,
            sessions: Array,
            userId: String
        }
    }

    static get template() {
        return html`
            <style>
            </style>
            <template is="dom-repeat" items="{{sessions}}" as="session" index="index">
                <coaching-coachees-session-card session="[[session]]" user-id="[[userId]]" index="[[index]]"></coaching-coachees-session-card>
            </template>
        `;
    }

    constructor() {
        super();
    }

    ready() {
        super.ready();
        console.log('User ID', this.userId);
        const db = firebase.firestore();
        db.collection('sessions')
            .where('startTime', '>=', this.day.startTime)
            .where('startTime', '<=', this.day.endTime)
            .where('attendees', 'array-contains', this.userId)
            .onSnapshot(querySnapshot => {
                console.log('QS', querySnapshot);
                this.set('sessions', []);
                querySnapshot.forEach(doc => {
                    let session = doc.data();
                    session.__id__ = doc.id;
                    console.log('Session', session);
                    this.push('sessions', session);
                })
            })
    }

    _userIdChanged(userId) {
        console.log('UserID Changed', userId);

    }
}

customElements.define('coaching-coachees-sessions', CoachingCoacheesSessions);