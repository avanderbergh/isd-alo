import {
    PolymerElement,
    html
} from '@polymer/polymer/polymer-element.js';
import('./shared-styles.js');

class CoachingWorkshops extends PolymerElement {
    static get properties() {
        return {

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
        `;
    }

    constructor() {
        super();
    }

    ready() {
        super.ready();
    }
}

customElements.define('coaching-workshops', CoachingWorkshops);