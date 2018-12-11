import {PolymerElement, html} from '@polymer/polymer/polymer-element.js';
import './shared-styles.js';
import '@polymer/paper-dialog/paper-dialog.js';
import '@polymer/paper-fab/paper-fab.js';
import '@polymer/paper-button/paper-button.js';
import '@polymer/paper-input/paper-input.js';
import '@polymer/paper-input/paper-textarea.js';
import '@polymer/iron-icons/iron-icons.js';

class CoachingNewWorkshop extends PolymerElement {
    static get properties() {
        return {
            formData: {
                type: Object,
                value: {}
            }
        }
    }

    static get template() {
        return html`
            <style include="shared-styles">
                #new-workshop-dialog {
                    width: 500px;
                }
            </style>

            <paper-fab icon="add" on-tap="_handleAddWorkshopTapped"></paper-fab>
            <paper-dialog id="new-workshop-dialog">
                <h2>New Workshop</h2>
                <paper-input label="Title" value="{{formData.title}}"></paper-input>
                <paper-textarea label="Description" value="{{formData.description}}"></paper-textarea>
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

    _handleAddWorkshopTapped() {
        this.shadowRoot.querySelector('#new-workshop-dialog').open();
    }

    _handleSubmitTapped() {
        this.formData.owner = firebase.auth().getUid();
        const db = firebase.firestore();
        db.collection('workshops').add(this.formData).then(() => {
            this.set('formData', {});
            this.shadowRoot.querySelector('#new-workshop-dialog').close();
        })
    }
}

customElements.define('coaching-new-workshop', CoachingNewWorkshop);