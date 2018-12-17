import {
    PolymerElement,
    html
} from '@polymer/polymer/polymer-element.js';
import {format} from 'date-fns';

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
            }
        }
    }

    static get template() {
        return html `
            <template is="dom-if" if="{{message}}">
                <p>[[message]]</p>
            </template>
            <h1>[[displayDate]]</h1>
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