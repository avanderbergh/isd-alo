import {PolymerElement, html} from '@polymer/polymer/polymer-element.js';
import {format} from 'date-fns';

class CoachingAnalyticsUser extends PolymerElement {
    static get properties() {
        return {
            user: Object,
            sessions: {
                type: Array,
                value: [],
                observer: '_sessionsChanged'
            },
            totalSessions: {
                type: Number
            },
            totalSessionLength: {
                type: Number
            },
            totalCapacity: Number,
            totalAttendees: Number,
            percentAttendance: Number
        }
    }

    static get observers() {

    }

    static get template() {
        return html`
            <td>[[user.displayName]]</td>
            <td>[[totalSessions]]</td>
            <td>[[totalSessionLength]]</td>
            <td>[[totalCapacity]]</td>
            <td>[[totalAttendees]]</td>
            <td>[[percentAttendance]]%</td>
        `;
    }

    ready() {
        super.ready();
        const db = firebase.firestore();
        db.collection('sessions')
            .where('presenters', 'array-contains', this.user.__id__)
            .get().then(querySnapshot => {
                let sessions = [];
                this.set('sessions', []);
                querySnapshot.forEach(doc => {
                    let session = doc.data();
                    sessions.push(session);
                    console.log(sessions.length, ' / ', querySnapshot.size);
                    if (sessions.length == querySnapshot.size) {
                        this.set('sessions', sessions);
                    }
                })
            })
    }

    _sessionsChanged(sessions) {
        this.totalSessions = sessions.length;
        console.log('set sessions', this.totalSessions)
        let totalTime = 0;
        let totalCapacity = 0;
        let totalAttendees = 0;
        sessions.forEach(session => {
            console.log(session.startTime.toMillis());
            let sessionLength = session.endTime.toMillis() - session.startTime.toMillis();
            totalTime += sessionLength;
            totalCapacity += parseInt(session.capacity);
            if (session.attendees) {
                totalAttendees += session.attendees.length;
            }
        });
        this.totalSessionLength = this._msToTime(totalTime);
        console.log('totalLength', this.totalSessionLength);

        this.totalCapacity = totalCapacity;
        this.totalAttendees = totalAttendees;
        this.percentAttendance = Math.round(totalAttendees / totalCapacity * 100, 2);


    }

    _msToTime(s) {
        var ms = s % 1000;
        s = (s - ms) / 1000;
        var secs = s % 60;
        s = (s - secs) / 60;
        var mins = s % 60;
        if (mins < 10) mins = mins + "0";
        var hrs = (s - mins) / 60;
      
        return hrs + ':' + mins;
      }
      
}

customElements.define('coaching-analytics-user', CoachingAnalyticsUser);