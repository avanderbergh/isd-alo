import {
    PolymerElement,
    html
} from '@polymer/polymer/polymer-element.js';
import('./shared-styles.js');


class CoachingSpaces extends PolymerElement {
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

            <h1>Spaces</h1>
        `;
    }

    constructor() {
        super();
    }

    ready() {
        super.ready();
    }
}

customElements.define('coaching-spaces', CoachingSpaces);