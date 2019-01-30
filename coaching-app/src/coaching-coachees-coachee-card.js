import {PolymerElement, html} from '@polymer/polymer/polymer-element.js';
import './coaching-sessions'
import '@polymer/paper-button/paper-button.js'

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

    _handleCardTapped(e) {
        this.set('showDetails',!this.showDetails)
    }

}

customElements.define('coaching-coachees-coachee-card', CoachingCoacheesCoacheeCard);