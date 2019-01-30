import {PolymerElement, html} from '@polymer/polymer/polymer-element.js';
import './coaching-coachees-coachee-card'
/**
 * `LowerCaseDashedName` Description
 *
 * @customElement
 * @polymer
 * @demo
 * 
 */
class CoachingCoacheesStaffView extends PolymerElement {
    static get properties() {
        return {

            coachees:{
                type:Object,
                value:[]
            },
            user:{
                type:Object,
                value:{}
            }

        }
    }

    static get template() {
        return html`
                    <dom-repeat items="{{coachees}}" as="coachee">
                        <template>
                            <coaching-coachees-coachee-card coachee="[[coachee]]" user="[[user]]"></coaching-days-day-card>
                        </template>           
                    </dom-repeat>

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
        //this.set('coachees',this.loadUserCoachees())
        this.loadUserCoachees()
        console.log(this.coachees)

    }

    loadUserCoachees(){
        //console.log('loadUserCoachees')
        const db = firebase.firestore();
        this.snapshotListener = db.collection('users')
            .where('coach','==',this.user.uid)
            .orderBy('displayName')
            .onSnapshot(querySnapshot => {
                this.set('coachees', []);
                querySnapshot.forEach(doc => {
                    let coachee = doc.data();
                    console.log(coachee)
                    coachee.__id__ = doc.id;
                    this.push('coachees', coachee)
                })
                //console.log('coachees======',this.coachees)
            })
        

    }
}

customElements.define('coaching-coachees-staff-view', CoachingCoacheesStaffView);