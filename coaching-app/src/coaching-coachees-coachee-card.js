import { PolymerElement, html } from "@polymer/polymer/polymer-element.js";
import "./coaching-sessions";
import "./coaching-coachees-sessions.js";
import "@polymer/paper-button/paper-button.js";
import "@polymer/paper-tabs/paper-tabs.js";
import "@polymer/iron-pages/iron-pages.js";

class CoachingCoacheesCoacheeCard extends PolymerElement {
  static get properties() {
    return {
      coachee: {
        type: Object,
        value: { name: "placeholder" }
      },
      days: Array,
      showDetails: {
        type: Boolean,
        value: false
      },
      user: {
        type: Object,
        value: {}
      },
      surrogateUser: {
        type: Object,
        computed: "_surrogateUser(coachee)"
      },
      selectedDay: {
        type: Number,
        value: 0
      }
    };
  }

  _surrogateUser(coachee) {
    let s = { uid: `${coachee.__id__}` };
    return s;
  }

  static get template() {
    return html`
      <style include="shared-styles">
        :host {
          display: block;
          padding: 10px;
        }

        #coacheeCard {
          display: flex;
          border-radius: 5px;
          padding: 10px;
          color: #000;
          background-color: #fff;
          cursor: pointer;
        }

        #coacheePhoto {
          width: 145px;
          text-align: center;
        }

        #coacheeSessions {
          width: 100%;
          display: flex;
          flex-direction: row;
        }

        h1 {
          color: inherit;
          font-size: 5rem;
          line-height: 1;
        }

        h2 {
          line-height: 0;
        }

        paper-tabs {
          --paper-tabs-selection-bar-color: var(--app-primary-color);
          width: 100%;
        }

        #tabs {
          display: block;
          width: 100%;
        }
      </style>
      <div id="coacheeCard" on-tap="_handleCardTapped">
        <div id="coacheePhoto">
          <img src="[[coachee.namePhoto]]" alt="image" style="width:100%;"/>
          <p>[[coachee.displayName]]</p>
        </div>
        <div id="tabs">
          <paper-tabs selected="{{selectedDay}}">
            <template is="dom-repeat" items="{{days}}" as="day">
              <paper-tab>[[day.displayDate]]</paper-tab>
            </template>
          </paper-tabs>
          <div id="coacheeSessions">
            <iron-pages style="width: 100%" selected="{{selectedDay}}">
              <template is="dom-repeat" items="{{days}}" as="day">
                <coaching-coachees-sessions
                  user-id="[[coachee.__id__]]"
                  day="[[day]]"
                ></coaching-coachees-sessions>
              </template>
            </iron-pages>
          </div>
        </div>
      </div>
    `;
  }

  _handleCardTapped(e) {
    this.set("showDetails", !this.showDetails);
  }
}

customElements.define(
  "coaching-coachees-coachee-card",
  CoachingCoacheesCoacheeCard
);
