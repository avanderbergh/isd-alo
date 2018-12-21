import {
    PolymerElement,
    html
} from '@polymer/polymer/polymer-element.js';
import './shared-styles.js';
import '@polymer/paper-dialog/paper-dialog.js';
import '@polymer/paper-fab/paper-fab.js';
import '@polymer/paper-button/paper-button.js';
import '@polymer/paper-input/paper-input.js';
import '@polymer/paper-input/paper-textarea.js';
import '@polymer/iron-icons/iron-icons.js';

import '@polymer/paper-dropdown-menu/paper-dropdown-menu.js';
import '@polymer/paper-item/paper-item.js';
import '@polymer/paper-listbox/paper-listbox.js';


class CoachingSpacesNewSpace extends PolymerElement {
    static get properties() {
        return {
            formData: {
                type: Object,
                value: {}
            }
        }
    }

    static get template() {
        return html `
            <style include="shared-styles">
                #new-space-dialog {
                    width: 500px;
                }
            </style>
                
            <paper-fab icon="add" on-tap="_handleAddspaceTapped"></paper-fab>
            <paper-dialog id="new-space-dialog">
                <h2>New space</h2>
                <paper-input label="Name" value="{{formData.name}}"></paper-input>
                <paper-input label="Description" value="{{formData.description}}"></paper-input>
                <paper-input label="Capacity" type="number" min="1" max="500" value="{{formData.capacity}}"></paper-input>
                <div class="buttons">
                    <paper-button dialog-dismiss>Cancel</paper-button>
                    <paper-button autofocus on-tap="_handleSubmitTapped">Submit</paper-button>
                </div>
            </paper-dialog>
        `;
    }

    constructor() {
        super();
    }

    ready() {
        super.ready();
    }

    _handleAddspaceTapped() {
        this.shadowRoot.querySelector('#new-space-dialog').open();
    }

    _handleSubmitTapped() {
        this.formData.owner = firebase.auth().getUid();
        const db = firebase.firestore();
        
        const doc = Object.assign({}, this.formData, {
            capacity: parseInt(this.formData.capacity)
          })
        
        db.collection('spaces').add(doc).then(() => {
            this.set('formData', {});
            this.shadowRoot.querySelector('#new-space-dialog').close();
        })

    }
}

customElements.define('coaching-spaces-new-space', CoachingSpacesNewSpace);