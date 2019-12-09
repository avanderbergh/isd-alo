import { PolymerElement, html } from "@polymer/polymer/polymer-element.js";
import "@polymer/app-route/app-route.js";

import("./shared-styles.js");

import("./coaching-days-new-day.js");
import("./coaching-days-day-card.js");
import("./coaching-days-day.js");

class CoachingDays extends PolymerElement {
  static get properties() {
    return {
      upcomingDaysSnapshotListener: Object,
      pastDaysSnapshotListener: Object,
      upcomingDays: {
        type: Array,
        value: []
      },
      pastDays: {
        type: Array,
        value: []
      },
      route: {
        type: Object,
        observer: "_routeChanged"
      },
      routeData: {
        type: Object,
        observer: "_routeDataChanged"
      },
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

        .day-container {
          display: flex;
          flex-wrap: wrap;
          flex-direction: row;
          padding: 10px;
        }
      </style>
      <app-route route="{{route}}" pattern="/:dayId" data="{{routeData}}">
      </app-route>

      <template is="dom-if" if="{{!routeData.dayId}}">
        <h1>Upcoming Days</h1>
        <div class="day-container">
          <dom-repeat items="{{upcomingDays}}" as="day">
            <template>
              <coaching-days-day-card day="[[day]]"></coaching-days-day-card>
            </template>
          </dom-repeat>
        </div>
        <h1>Past Days</h1>
        <div class="day-container">
          <dom-repeat items="{{pastDays}}" as="day">
            <template>
              <coaching-days-day-card day="[[day]]"></coaching-days-day-card>
            </template>
          </dom-repeat>
        </div>
        <template is="dom-if" if="{{user.claims.admin}}">
          <coaching-days-new-day></coaching-days-new-day>
        </template>
      </template>
      <template is="dom-if" if="{{routeData.dayId}}">
        <coaching-days-day
          day-id="[[routeData.dayId]]"
          user="[[user]]"
        ></coaching-days-day>
      </template>
    `;
  }

  ready() {
    super.ready();
    this._loadDays();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this.upcomingDaysSnapshotListener) this.upcomingDaysSnapshotListener();
    if (this.pastDaysSnapshotListener) this.pastDaysSnapshotListener();
  }

  _loadDays() {
    const timestamp = new Date();
    const db = firebase.firestore();
    this.upcomingDaysSnapshotListener = db
      .collection("days")
      .where("show", "==", true)
      .where("endTime", ">=", timestamp)
      .orderBy("endTime")
      .onSnapshot(querySnapshot => {
        this.set("upcomingDays", []);
        querySnapshot.forEach(doc => {
          let day = doc.data();
          day.__id__ = doc.id;
          this.push("upcomingDays", day);
        });
      });
    this.pastDaysSnapshotListener = db
      .collection("days")
      .where("show", "==", true)
      .where("endTime", "<=", timestamp)
      .orderBy("endTime", "desc")
      .onSnapshot(querySnapshot => {
        this.set("pastDays", []);
        querySnapshot.forEach(doc => {
          let day = doc.data();
          day.__id__ = doc.id;
          this.push("pastDays", day);
        });
      });
  }

  _routeChanged(route) {
    console.log("route", route);
    if (!route.path) {
      this.set("routeData", {});
    }
  }

  _routeDataChanged(routeData) {
    console.log("routeData", routeData);
  }

  _userChanged(user) {
    console.log("User Changed", user);
  }
}

customElements.define("coaching-days", CoachingDays);
