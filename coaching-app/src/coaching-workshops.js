import {
    PolymerElement,
    html
} from '@polymer/polymer/polymer-element.js';
import('./shared-styles.js');
import('./coaching-new-workshop.js');

class CoachingWorkshops extends PolymerElement {
    static get properties() {
        return {
            user: {
                type: Object,
                observer: '_onUserChanged'
            },
            workshops: Array
        }
    }

    static get template() {
        return html `
            <style include="shared-styles">
                :host {
                display: block;

                padding: 10px;
                }
            </style>
            <h1>Workshops</h1>
            <template is="dom-repeat" items="{{workshops}}" as="workshop">
                <p>[[workshop.title]]</p>
            </template>
            <coaching-new-workshop></coaching-new-workshop>
        `;
    }

    constructor() {
        super();
    }

    ready() {
        super.ready();
    }

    _onUserChanged(user) {
        if (user) {
            if (user.hasOwnProperty('uid')) {
                const db = firebase.firestore();
                db.collection('workshops').where('owner', '==', this.user.uid)
                .onSnapshot(querySnapshot => {
                    this.set('workshops', []);
                    querySnapshot.forEach(doc => {
                        let workshop = doc.data();
                        workshop.__id__ = doc.id;
                        this.push('workshops', workshop)
                    })
                })
            }
        }
    }
}

customElements.define('coaching-workshops', CoachingWorkshops);