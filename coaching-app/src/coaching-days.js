import {
    PolymerElement,
    html
} from '@polymer/polymer/polymer-element.js';
import '@polymer/app-route/app-route.js';


import('./shared-styles.js');

import('./coaching-days-new-day.js')
import('./coaching-days-day-card.js');
import('./coaching-days-day.js');

class CoachingDays extends PolymerElement {

    static get properties() {
        return {
            snapshotListener: Object,
            days: {
                type: Array,
                value: []
            },
            route: {
                type: Object,
                observer: '_routeChanged'
            },
            routeData: {
                type: Object,
                observer: '_routeDateChanged'
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

                #day-container {
                    display: flex;
                    flex-wrap: wrap;
                    flex-direction: row;
                    padding: 10px;
                }

            </style>
            <app-route route="{{route}}" pattern="/:dayId" data="{{routeData}}">
            </app-route>

            <template is="dom-if" if="{{!routeData.dayId}}">
                <h1>Days</h1>
                <div id="day-container">
                    <dom-repeat items="{{days}}" as="day">
                        <template>
                            <coaching-days-day-card day="[[day]]"></coaching-days-day-card>
                        </template>           
                    </dom-repeat>
                </div>
                <coaching-days-new-day></coaching-days-new-day>
            </template>
            <template is="dom-if" if="{{routeData.dayId}}">
                <coaching-days-day day-id="[[routeData.dayId]]"></coaching-days-day>
            </template>
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

    _routeChanged(route) {
        console.log('route', route);
    }

    _routeDateChanged(routeData) {
        console.log('routeData', routeData);
    }

}

customElements.define('coaching-days', CoachingDays);