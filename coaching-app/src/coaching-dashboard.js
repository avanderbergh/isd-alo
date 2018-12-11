import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';
import './coaching-days.js';
import './shared-styles.js';

class CoachingDashboard extends PolymerElement {
  static get template() {
    return html`
      <style include="shared-styles">
        :host {
          display: block;

          padding: 10px;
        }
      </style>

      <div class="card">
        <coaching-days></coaching-days>
      </div>
    `;
  }
}

window.customElements.define('coaching-dashboard', CoachingDashboard);
