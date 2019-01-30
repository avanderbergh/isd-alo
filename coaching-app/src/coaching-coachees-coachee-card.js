import {PolymerElement, html} from '@polymer/polymer/polymer-element.js';
import './coaching-sessions'
import '@polymer/paper-button/paper-button.js'


/**
 * `LowerCaseDashedName` Description
 *
 * @customElement
 * @polymer
 * @demo
 * 
 */
class CoachingCoacheesCoacheeCard extends PolymerElement {
    static get properties() {
        return {
            coachee:{
                type:Object,
                value:{name:'placeholder'}
            },
            showDetails:{
                type:Boolean,
                value:false
            },
            user:{
                type:Object,
                value:{}
            },
            surrogateUser:{
                type:Object,
                computed:'_surrogateUser(coachee)'
            }

        }
    }

    _surrogateUser(coachee){
        let s =  {uid:`${coachee.__id__}`}
        console.log('s----------',s)
        return s
    }


    static get template() {
        return html`
        <style include="shared-styles">
                :host {
                display: block;
                padding: 10px;
                }

                #coacheeCard {
                    width: 120px;
                    border-radius: 5px;
                    padding: 10px;
                    text-align: center;
                    color: #fff;
                    background-color: var(--app-primary-color);
                    cursor: pointer;
                }

                h1 {
                    color: inherit;
                    font-size: 5rem;
                    line-height: 1;
                }

                h2 {
                    line-height: 0;
                }
            </style>

            <div id="coacheeCard" on-tap="_handleCardTapped">
                <p>Name: [[coachee.displayName]]</p>
                <p> Form: [[coachee.form]]</p>
                

            </div>
            <template is="dom-if" if="[[showDetails]]">
            <coaching-sessions name="sessions" user="[[surrogateUser]]"></coaching-sessions>
            </template>

        `;
    }

    _handleTapped(){
        console.log('surrogate========',this.surrogateUser)
    }

    _handleCardTapped(e) {
        //window.history.pushState({}, 'ISD Coaching', "coachees/" + this.coachee.__id__);
        //window.dispatchEvent(new CustomEvent('location-changed'));
        console.log('_handleCardTapped',e)
        this.set('showDetails',!this.showDetails)
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

customElements.define('coaching-coachees-coachee-card', CoachingCoacheesCoacheeCard);