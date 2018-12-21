import {
    PolymerElement,
    html
} from '@polymer/polymer/polymer-element.js';
import '@polymer/paper-button/paper-button.js'
import {format} from 'date-fns';
import './coaching-sessions-new-session.js';
import './coaching-sessions.js';

class CoachingDaysDay extends PolymerElement {
    static get properties() {
        return {
            dayId: {
                type: String,
                observer: '_dayIdChanged'
            },
            day: Object,
            displayDate: {
                type: String,
                computed: '_computeDisplayDate(day)'
            },
            user: Object,
            showNewSession: {
                type: Boolean,
                value: false
            }
        }
    }

    static get template() {
        return html `
            <template is="dom-if" if="{{message}}">
                <p>[[message]]</p>
            </template>
            <a href="/days">Back</a>
            <h1>[[displayDate]]</h1>
            <template is="dom-if" if="{{!showNewSession}}">
                <coaching-sessions title="Sessions" day="[[day]]"></coaching-sessions>
            </template>
            <coaching-sessions-new-session show="{{showNewSession}}" day="[[day]]"></coaching-sessions-new-session>
        `;
    }

    constructor() {
        super();
    }

    ready() {
        super.ready();
    }

    _dayIdChanged(dayId) {
        const db = firebase.firestore();
        db.collection('days').doc(dayId).get()
            .then(doc => {
                if (doc.exists) {
                    let day = doc.data();
                    day.__id__ = doc.id;
                    console.log('Setting Day', day);
                    this.set('day', day);
                } else {
                    this.message = "Day not Found"
                }
            })
    }

    _computeDisplayDate(day) {
        const start = day.startTime.toDate();
        const end = day.endTime.toDate();
        const displayDate = format(start, 'dd MMM Y HH:mm') + ' - ' + format(end, 'HH:mm');
        return displayDate;
    }
}

customElements.define('coaching-days-day', CoachingDaysDay);