import {PolymerElement, html} from '@polymer/polymer/polymer-element.js';
import '@polymer/paper-dropdown-menu/paper-dropdown-menu.js';
import '@polymer/paper-item/paper-item.js';
import '@polymer/paper-listbox/paper-listbox.js';
import '@polymer/polymer/lib/elements/dom-repeat.js';
import '@polymer/paper-button/paper-button.js';
import './coaching-coachees-student-view.js';
import './coaching-coachees-staff-view.js';
import '@polymer/polymer/lib/elements/dom-if.js'

class CoachingCoachees extends PolymerElement {
    
    static get properties() {
        return {
            user: Object
        }
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
                }
            </style>

            <template is="dom-if" if="{{user.claims.student}}">
                <coaching-coachees-student-view user="[[user]]"></coaching-coachees-student-view>    
            </template>
            <template is="dom-if" if="{{user.claims.staff}}">
                <coaching-coachees-staff-view user="[[user]]"></coaching-coachees-staff-view>    
            </template>
        `;
    }
}

customElements.define('coaching-coachees', CoachingCoachees);