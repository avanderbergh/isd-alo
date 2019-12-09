import { PolymerElement, html } from "@polymer/polymer/polymer-element.js";
import { format } from "date-fns";

class CoachingCoacheesSessionCard extends PolymerElement {
  static get properties() {
    return {
      attended: {
        type: Boolean,
        value: false
      },
      session: Object,
      displayTime: {
        type: String,
        computed: "_computeDisplayTime(session)"
      },
      space: String,
      preseners: Array,
      userId: String,
      index: Number
    };
  }

  static get template() {
    return html`
      <style>
        html {
          --card-background-color: #fff;
          --card-title-color: var(--app-primary-color);
          --card-text-color: var(--google-grey-700);
        }

        #sessionCard {
          padding: 10px;
          color: var(--card-text-color);
          margin: 0px;
          background-color: var(--card-background-color);
          display: flex;
          flex-direction: row;
          width: 100%;
        }
      </style>
      <div id="sessionCard">
        <div style="width: 8rem;">[[displayTime]]</div>
        <div style="width: 20rem;">
          <a href="/sessions/[[session.__id__]]"
            >[[workshop.title]]: [[session.title]]</a
          >
        </div>
        <div style="width: 12rem;">
          <template is="dom-repeat" items="{{presenters}}" as="presenter">
            [[presenter.displayName]]&nbsp;
          </template>
        </div>
        <div style="width: 6rem;">[[space]]</div>
        <div style="width: 5rem;">
          <template is="dom-if" if="{{attended}}">
            Present
          </template>
          <template is="dom-if" if="{{!attended}}">
            Absent
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
    this._fetchWorkshop();
    this._fetchSpace();
    this._fetchPresenters();
    this._fetchAttended();
    this._computeCardBackground();
  }

  _fetchWorkshop() {
    const db = firebase.firestore();
    if (this.session) {
      if (this.session.hasOwnProperty("workshop")) {
        db.collection("workshops")
          .doc(this.session.workshop)
          .onSnapshot(doc => {
            this.workshop = doc.data();
          });
      }
    }
  }

  _computeDisplayTime(session) {
    const start = session.startTime.toDate();
    const end = session.endTime.toDate();
    const displayTime = format(start, "H:mm") + " - " + format(end, "H:mm");
    return displayTime;
  }

  _fetchPresenters() {
    this.session.presenters.forEach(presenter => {
      const db = firebase.firestore();
      db.collection("users")
        .doc(presenter)
        .get()
        .then(doc => {
          this.set("presenters", []);
          let user = doc.data();
          this.push("presenters", user);
        });
    });
  }

  _fetchSpace() {
    const db = firebase.firestore();
    db.collection("spaces")
      .doc(this.session.space)
      .get()
      .then(doc => {
        const space = doc.data();
        this.space = space.name;
      });
  }

  _fetchAttended() {
    console.log("fetch attended", this.session.__id__, "user", this.userId);
    const db = firebase.firestore();
    db.collection("sessions")
      .doc(this.session.__id__)
      .collection("attendance")
      .doc(this.userId)
      .onSnapshot(doc => {
        console.log("attended doc", doc);
        if (doc.exists) {
          this.attended = doc.data().value;
        } else {
          this.attended = false;
        }
      });
  }

  _computeCardBackground() {
    if (this.index % 2) {
      this.updateStyles({
        "--card-background-color": "var(--google-grey-300)"
      });
    } else {
      this.updateStyles({
        "--card-background-color": "var(--google-grey-100)"
      });
    }
  }
}

customElements.define(
  "coaching-coachees-session-card",
  CoachingCoacheesSessionCard
);
