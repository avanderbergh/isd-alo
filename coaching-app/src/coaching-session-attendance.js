import { PolymerElement, html } from "@polymer/polymer/polymer-element.js";
import "@polymer/paper-button/paper-button";
import "@polymer/paper-icon-button/paper-icon-button";
import "./coaching-attendance-button.js";

class CoachingSessionAttendance extends PolymerElement {
  static get properties() {
    return {
      session: {
        type: Object,
        observer: "_sessionChanged"
      },
      attendees: Array
    };
  }

  static get template() {
    return html`
      <style>
        .attendees-list {
          display: flex;
          flex-wrap: wrap;
        }
        .attendee {
          padding: 10px;
          align-content: center;
        }
      </style>
      <h2>Take attendance</h2>
      <p>Click on each student to mark as present</p>
      <div class="attendees-list">
        <template is="dom-repeat" items="{{session.attendees}}" as="attendee">
          <div class="attendee">
            <coaching-attendance-button
              user-id="[[attendee]]"
              session-id="[[session.__id__]]"
            ></coaching-attendance-button>
          </div>
        </template>
      </div>
    `;
  }

  constructor() {
    super();
  }

  ready() {
    super.ready();
  }

  _sessionChanged(session) {
    if (session) {
      const db = firebase.firestore();
      if (this.session.hasOwnProperty("attendees")) {
        this.set("attendees", []);
        this.session.attendees.forEach(attendeeId => {
          db.collection("users")
            .doc(attendeeId)
            .get()
            .then(doc => {
              let user = doc.data();
              user.__id__ = doc.id;
              if (!this.session.attendance) {
                user.attendance = false;
              } else {
                user.attendance = this.session.attendance[attendeeId];
              }
              console.log("User Attendance", user.attendance);
              this.push("attendees", user);
            });
        });
      }
    }
  }

  _handleAttendedTapped(e) {
    const db = firebase.firestore();
    const uid = e.target.dataset.uid;
    console.log("aaaa", uid);

    let attendanceUpdate = {};
    if (this.session.hasOwnProperty("attendance")) {
      attendanceUpdate[`attendance.${uid}`] = !this.session.attendance[uid];
    }
    db.collection("sessions")
      .doc(this.session.__id__)
      .update(attendanceUpdate);
  }
}

customElements.define("coaching-session-attendance", CoachingSessionAttendance);
