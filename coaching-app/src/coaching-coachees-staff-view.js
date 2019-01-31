import {PolymerElement, html} from '@polymer/polymer/polymer-element.js';
import './coaching-coachees-coachee-card'

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
            <template is="dom-repeat" items="{{coachees}}" as="coachee">
                <coaching-coachees-coachee-card coachee="[[coachee]]" user="[[user]]"></coaching-days-day-card>
            </template>
        `;
    }

    ready() {
        super.ready();
        this.loadUserCoachees()
    }

    loadUserCoachees(){
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
            })
    }
}

customElements.define('coaching-coachees-staff-view', CoachingCoacheesStaffView);