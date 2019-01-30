import {
    PolymerElement,
    html
} from '@polymer/polymer/polymer-element.js';
import '@polymer/paper-dropdown-menu/paper-dropdown-menu.js';
import '@polymer/paper-item/paper-item.js';
import '@polymer/paper-listbox/paper-listbox.js';
import '@polymer/polymer/lib/elements/dom-repeat.js';
import '@polymer/paper-button/paper-button.js';
import './coaching-sessions';
import '@polymer/polymer/lib/elements/dom-if.js'

class CoachingCoacheesStudentView extends PolymerElement {
    static get properties() {
        return {

            user: Object,
            coaches: {
                type: Array,
                value: []
            },
            route: {
                type: Object,
                observer: '_routeChanged'
            },
            routeData: {
                type: Object,
                observer: '_routeDataChanged'
            },
            formData: {
                type: Object,
                value: {
                    coach: null
                }
            },
            makeCoachSelectionVisible: {
                type: Boolean,
                computed: '_computeMakeCoachSelectionVisible(formData.coach)'
            },
            makeSessionsVisible: {
                type: Boolean,
                computed: '_computeMakeSessionsVisible(makeSessionsVisible)'
            }

        }
    }

    showSelected(e) {
        if (e.detail.value != undefined || e.detail.value != null) {
            this.set('formData.coach', e.detail.value.coach1)
            this._updateCoachForUser()
            this._lookupCoachName()
        }
    }

    _routeDataChanged(routeData) {
        this.set('routeData', routeData)
    }

    _routeChanged(e) {
        if (!this.route.path) {
            this.set('routeData', {});
        }
    }

    static get template() {
        return html `
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
                
            <app-route route="{{route}}" pattern="/:coacheeId" data="{{routeData}}">
            </app-route>
            <template is="dom-if" if="{{makeCoachSelectionVisible}}">
                <paper-dropdown-menu label="Please select a coach" on-selected-item-changed="showSelected">
                    <paper-listbox slot="dropdown-content" selected="{{formData.coach}}" attr-for-selected="coach1">
                        <template is="dom-repeat" items="{{coaches}}" as="coach">
                            <paper-item coach1="[[coach.__id__]]">[[coach.displayName]]</paper-item>
                        </template>
                    </paper-listbox>
                </paper-dropdown-menu>
            </template>
            <template is="dom-if" if="{{!makeCoachSelectionVisible}}">
                <label>[[formData.coachName]]</label>
                <coaching-sessions name="sessions" user="[[user]]"></coaching-sessions>
            </template>
        `;
    }


    async _updateCoachForUser() {
        var ref = firebase.firestore()
        var uid = this.user.uid
        var coach = this.formData.coach
        var usersRef = await ref.collection('users')
            .doc(uid)
            .get()
            .then(async function (doc) {
                if (doc.exists) {
                    await ref.collection("users").doc(uid).update({
                        coach: coach
                    });
                } else {
                    console.log("No such document!");
                }
            }).catch(function (error) {
                console.log("Error getting document:", error);
            });

    }

    loadUserCoaches() {
        const db = firebase.firestore();
        this.snapshotListener = db.collection('users')
            .where('assignedForm', '==', this.user.form)
            .orderBy('displayName')
            .onSnapshot(querySnapshot => {
                this.set('coaches', []);
                querySnapshot.forEach(doc => {
                    let coach = doc.data();
                    coach.__id__ = doc.id;
                    this.push('coaches', coach)
                })
            })
    }


    _computeMakeCoachSelectionVisible(coach) {
        return !coach;
    }

    ready() {
        super.ready();
        this.loadUserCoaches()
        this.set('formData.coach', this.user.coach)
        this._lookupCoachName()
    }

    async _lookupCoachName() {
        if (this.user.coach) {
            const db = firebase.firestore();
            this.snapshotListener = await db.collection('users').doc(this.user.coach).get()
                .then(u => {
                    this.set('formData.coachName', '');
                    this.set('formData.coachName', u.data().displayName)
                })
        }
    }


}

customElements.define('coaching-coachees-student-view', CoachingCoacheesStudentView);