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
            </style>
            <div id="coacheeCard" on-tap="_handleCardTapped">
                <div id="coacheePhoto">
                    <img src="[[coachee.namePhoto]]" alt="image">
                    <p>[[coachee.displayName]]</p>
                </div>
                <div id="coachingSessions">
                    <coaching-sessions name="sessions" user="[[surrogateUser]]"></coaching-sessions>
                </div>
            </div>
        `;
    }

    _handleCardTapped(e) {
        this.set('showDetails',!this.showDetails)
    }

}

customElements.define('coaching-coachees-coachee-card', CoachingCoacheesCoacheeCard);