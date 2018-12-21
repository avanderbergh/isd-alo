import {
    PolymerElement,
    html
} from '@polymer/polymer/polymer-element.js';

import('./shared-styles.js');
import('./coaching-spaces-new-space');


class CoachingSpaces extends PolymerElement {

    static get properties() {
        return {
            snapshotListener: Object,
            spaces: {
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

            <h1>Spaces</h1>
            <template is="dom-repeat" items="{{spaces}}" as="space">
                <p>[[space.name]] ([[space.capacity]])</p>
            </template>
            <coaching-spaces-new-space></coaching-spaces-new-space>    

        `;
    }

    ready() {
        super.ready();
        this._loadSpaces();
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        if (this.snapshotListener) this.snapshotListener();
    }

    _loadSpaces() {
        const db = firebase.firestore();
        this.snapshotListener = db.collection('spaces')
            .orderBy('name')
            .onSnapshot(querySnapshot => {
                this.set('spaces', []);
                querySnapshot.forEach(doc => {
                    let space = doc.data();
                    space.__id__ = doc.id;
                    this.push('spaces', space)
                })
            })

    }

}

customElements.define('coaching-spaces', CoachingSpaces);