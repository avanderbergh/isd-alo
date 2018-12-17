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

import '@vaadin/vaadin-date-picker/vaadin-date-picker.js';
import '@vaadin/vaadin-time-picker/vaadin-time-picker.js';

import './date-time-picker.js'




class CoachingDaysNewDay extends PolymerElement {
    static get properties() {
        return {
            formData: {
                type: Object,
                value: {}
            },
            fdtStart:{
                type:String,
                value:''
            },
            fdtEnd:{
                type:String,
                value:''
            },
            dateTimeFormData:{
                type:Object,
                value:{}
            }
        }
    }

    static get template() {
        return html `
            <style include="shared-styles">
                #new-day-dialog {
                    width: 500px;
                }
            </style>
                


            
            <paper-fab icon="add" on-tap="_handleAdddayTapped"></paper-fab>
            <paper-dialog id="new-day-dialog">
                <label>Start</label>
                <date-time-picker date-time-format={{fdtStart}} form-data={{dateTimeFormData}}></date-time-picker>
                <label>End</label>
                <date-time-picker date-time-format={{fdtEnd}} form-data=[[dateTimeFormData]]></date-time-picker>
                

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

    _handleAdddayTapped() {
        this.shadowRoot.querySelector('#new-day-dialog').open();
    }

    _handleSubmitTapped() {
        const db = firebase.firestore();

        const doc = Object.assign({}, this.formData, {
            startTime: new Date(this.fdtStart),
            endTime: new Date(this.fdtEnd)
        })
        db.collection('days').add(doc).then(() => {
            this.set('formData', {});
            this.shadowRoot.querySelector('#new-day-dialog').close();
        })

    }
}

customElements.define('coaching-days-new-day', CoachingDaysNewDay);