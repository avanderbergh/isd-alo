import {
    PolymerElement,
    html
} from '@polymer/polymer/polymer-element.js';

import('./shared-styles.js');

import('./coaching-days-new-day.js')


class CoachingDays extends PolymerElement {

    static get properties() {
        return {
            snapshotListener: Object,
            days: {
                type: Array,
                value: []
            }
        };
    }

    static get template() {
        return html `
            <style include="shared-styles">
                :host {
                display: block;

                padding: 10px;
                }
            </style>

            <h1>Days</h1>
            <div> Day list: </div>
            <dom-repeat items="{{days}}" as="day">
                <template>
                    <div>startTime: <span>{{day.startTime}}</span></div>
                    <div>endTime: <span>{{day.endTime}}</span></div>
                </template> 
                                   
            </dom-repeat>

            <coaching-days-new-day></coaching-days-new-day>
            
        `;
    }

    ready() {
        super.ready();
        this._loadDays();
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        if (this.snapshotListener) this.snapshotListener();
    }

    _loadDays() {
        const db = firebase.firestore();
        this.snapshotListener = db.collection('days')
            .orderBy('startTime')
            .onSnapshot(querySnapshot => {
                this.set('days', []);
                querySnapshot.forEach(doc => {
                    let space = doc.data();
                    space.__id__ = doc.id;
                    this.push('days', space)
                })
            })

    }

}

customElements.define('coaching-days', CoachingDays);