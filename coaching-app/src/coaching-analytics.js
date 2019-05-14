import {PolymerElement, html} from '@polymer/polymer/polymer-element.js';
import './coaching-analytics-user.js';

class CoachingAnalytics extends PolymerElement {
    static get properties() {
        return {
            grades: {
                type: Array,
                value: [6, 7, 8, 9, 10, 11, 12]
            },
            teachers: {
                type: Array,
                value: []
            },

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

                coaching-analytics-user {
                    display: table-row
                }
            </style>

            <template is="dom-if" if="{{user.claims.admin}}">            
                <h1>Analytics</h1>
    
                <table>
                    <thead>
                        <th>Name</th>
                        <th>Sessions Offered</th>
                        <th>Total Time offered</th>
                        <th>Total Capacity</th>
                        <th>Total Attendees</th>
                        <th>Percentage Signups</th>
                    </thead>
                    <tbody>
                        <template is="dom-repeat" items="{{teachers}}" as="teacher">
                            <coaching-analytics-user user="[[teacher]]"></coaching-analytics-user>
                        </template>
                    </tbody>
                </table>
            </template>



        `;
    }

    ready() {
        super.ready();
        const db = firebase.firestore();
        this.set('teachers', [])
        db.collection('users').get().then(querySnapshot => {
            console.log('QS', querySnapshot);
            querySnapshot.forEach(doc => {
                let user = doc.data();
                user.__id__ = doc.id;
                if (!user.hasOwnProperty('yearNumber')) {
                    this.push('teachers', user);
                }
            })
        })
    }
}

customElements.define('coaching-analytics', CoachingAnalytics);