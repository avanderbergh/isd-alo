import {PolymerElement, html} from '@polymer/polymer/polymer-element.js';
//import './coaching-coachees-coachee-card.js';
//import './coaching-coachees-coachee.js';
import '@polymer/paper-dropdown-menu/paper-dropdown-menu.js';
import '@polymer/paper-item/paper-item.js';
import '@polymer/paper-listbox/paper-listbox.js';
import '@polymer/polymer/lib/elements/dom-repeat.js';
import '@polymer/paper-button/paper-button.js';
import './coaching-coachees-student-view.js';
import './coaching-coachees-staff-view.js';
import '@polymer/polymer/lib/elements/dom-if.js'



/**
 * `LowerCaseDashedName` Description
 *
 * @customElement
 * @polymer
 * @demo
 * 
 */
class CoachingCoachees extends PolymerElement {
    static get properties() {
        return {
            
            user: Object,            
            

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
            <coaching-coachees-student-view user="[[user]]"></coaching-coachees-student-view>    
                
            <coaching-coachees-staff-view user="[[user]]"></coaching-coachees-staff-view>    
    

        `;
    }


    

    
    /**
     * Instance of the element is created/upgraded. Use: initializing state,
     * set up event listeners, create shadow dom.
     * @constructor
     */
    constructor() {
        super();
        
    }

    

    
   
    /**
     * Use for one-time configuration of your component after local
     * DOM is initialized.
     */
    ready() {
        super.ready();
    
    }

}

customElements.define('coaching-coachees', CoachingCoachees);