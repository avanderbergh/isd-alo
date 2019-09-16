import { PolymerElement, html } from "@polymer/polymer/polymer-element.js";
import "@polymer/paper-button/paper-button.js";
import { format } from "date-fns";
import "./coaching-sessions-new-session.js";
import "./coaching-sessions.js";
import "./coaching-timeslot.js";

class CoachingDaysDay extends PolymerElement {
  static get properties() {
    return {
      dayId: {
        type: String,
        observer: "_dayIdChanged"
      },
      day: Object,
      displayDate: {
        type: String,
        computed: "_computeDisplayDate(day)"
      },
      user: Object,
      showNewSession: {
        type: Boolean,
        value: false
      },
      timeslots: {
        type: Array,
        value: []
      },
      presenterSessions: {
        type: Array,
        value: []
      }
    };
  }

  static get observers() {
    return ["_dayChanged(day)"];
  }

  static get template() {
    return html`
    <style>
      .presenter-session {
        background-color: #fff;
        padding: 10px;
        border-radius: 5px;
        margin-right: 12px;
        min-width: 100px;
      }

      .presenter-session a, a:visited {
        color: var(--app-primary-color);
        text-decoration: none;
      }
    </style>
      <template is="dom-if" if="{{message}}">
        <p>[[message]]</p>
      </template>
      <a href="/days">Back</a>
      <h1>[[displayDate]]</h1>
      <template is="dom-if" if="{{presenterSessions.length}}">
        <h2>Sessions you're presenting</h2>
        <div style="display: flex; margin-bottom: 12px;">
          <template
            is="dom-repeat"
            items="{{presenterSessions}}"
            as="presenterSession"
          >
            <div class="presenter-session">
              <a href="/sessions/[[presenterSession.__id__]]">[[presenterSession.title]]</a>
              ([[_displayTime(presenterSession.startTime)]] - [[_displayTime(presenterSession.endTime)]])
            </div>
          </template>
        </div>
      </template>
      <template is="dom-if" if="{{!showNewSession}}">
        <template is="dom-repeat" items="{{timeslots}}" as="timeslot">
          <coaching-timeslot
            user="[[user]]"
            timeslot="[[timeslot]]"
          ></coaching-timeslot>
        </template>
      </template>
      <template is="dom-if" if="{{user.claims.staff}}">
        <coaching-sessions-new-session
          show="{{showNewSession}}"
          day="[[day]]"
        ></coaching-sessions-new-session>
      </template>
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
    db.collection("days")
      .doc(dayId)
      .get()
      .then(doc => {
        if (doc.exists) {
          let day = doc.data();
          day.__id__ = doc.id;
          console.log("Setting Day", day);
          this.set("day", day);
          this.message = null;
        } else {
          this.message = "Day not Found";
        }
      });
  }

  _computeDisplayDate(day) {
    const start = day.startTime.toDate();
    const displayDate = format(start, "MMMM d");
    return displayDate;
  }

  _dayChanged(day) {
    console.log("Day Changed", day);
    const startTime = day.startTime.toMillis();
    const endTime = day.endTime.toMillis();
    let time = startTime;
    this.set("timeslots", []);
    while (time < endTime) {
      console.log("time", new Date(time));
      this.push("timeslots", {
        startTime: new Date(time),
        endTime: new Date(time + 35 * 60000)
      });
      time += 35 * 60000;
    }
    this._loadPresenterSessions();
  }

  async _loadPresenterSessions() {
    const db = firebase.firestore();
    db.collection("sessions")
      .where("presenters", "array-contains", this.user.uid)
      .where("startTime", ">=", this.day.startTime)
      .where("startTime", "<=", this.day.endTime)
      .onSnapshot(querySnapshot => {
        this.set("presenterSessions", []);
        querySnapshot.forEach(doc => {
          let session = doc.data();
          session.__id__ = doc.id;
          this.push("presenterSessions", session);
        });
      });
  }

  _displayTime(timestamp) {
    return format(timestamp.toDate(), "HH:mm");
  }
}

customElements.define("coaching-days-day", CoachingDaysDay);
