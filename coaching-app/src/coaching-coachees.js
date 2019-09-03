import { PolymerElement, html } from "@polymer/polymer/polymer-element.js";
import "@polymer/paper-dropdown-menu/paper-dropdown-menu.js";
import "@polymer/paper-item/paper-item.js";
import "@polymer/paper-listbox/paper-listbox.js";
import "@polymer/polymer/lib/elements/dom-repeat.js";
import "@polymer/paper-button/paper-button.js";
import { format } from "date-fns";
import "./coaching-coachees-student-view.js";
import "./coaching-coachees-staff-view.js";
import "./shared-styles.js";

class CoachingCoachees extends PolymerElement {
  static get properties() {
    return {
      days: Array,
      user: {
        type: Object,
        observer: "_userChanged"
      }
    };
  }

  static get template() {
    return html`
      <style include="shared-styles">
        :host {
          display: block;
          padding: 10px;
        }

        #coachee-container {
          display: flex;
          flex-wrap: wrap;
          flex-direction: row;
          padding: 10px;
          width: 100%;
        }
      </style>

      <h1>Coaching</h1>

      <template is="dom-if" if="{{user.claims.student}}">
        <coaching-coachees-student-view
          user="[[user]]"
          days="[[days]]"
        ></coaching-coachees-student-view>
      </template>
      <template is="dom-if" if="{{user.claims.staff}}">
        <coaching-coachees-staff-view
          user="[[user]]"
          days="[[days]]"
        ></coaching-coachees-staff-view>
      </template>
    `;
  }

  ready() {
    super.ready();
    const db = firebase.firestore();
    db.collection("days")
      .where("show", "==", true)
      .orderBy("startTime", "desc")
      .onSnapshot(querySnapshot => {
        this.set("days", []);
        querySnapshot.forEach(doc => {
          let day = doc.data();
          day.__id__ = doc.id;
          day.displayDate = format(day.startTime.toDate(), "d MMM");
          this.push("days", day);
        });
      });
  }

  _userChanged(user) {
    console.log("user", user);
  }
}

customElements.define("coaching-coachees", CoachingCoachees);
