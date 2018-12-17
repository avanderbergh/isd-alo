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

import './date-time-picker.js'


class CoachingSessionsNewSession extends PolymerElement {
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
                #new-session-dialog {
                    width: 500px;
                }
            </style>
                
            <paper-fab icon="add" on-tap="_handleAddsessionTapped"></paper-fab>
            <paper-dialog id="new-session-dialog">
                <h2>New session</h2>
                <paper-input label="title" value="{{formData.title}}"></paper-input>
                
                <!--<paper-input label="startTime" value="{{formData.startTime}}"></paper-input>
                
                <paper-textarea label="endTime" value="{{formData.endTime}}"></paper-textarea>
                -->
                <label>Start</label>
                <date-time-picker date-time-format={{fdtStart}} form-data={{dateTimeFormData}}></date-time-picker>
                <label>End</label>
                <date-time-picker date-time-format={{fdtEnd}} form-data=[[dateTimeFormData]]></date-time-picker>
                
                <paper-textarea label="description" value="{{formData.description}}"></paper-textarea>
                
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

    _handleAddsessionTapped() {
        this.shadowRoot.querySelector('#new-session-dialog').open();
    }

    _handleSubmitTapped() {
        this.formData.owner = firebase.auth().getUid();
        const db = firebase.firestore();
        
        const doc = Object.assign({}, this.formData, {
            startTime: new Date(this.fdtStart),endTime:new Date(this.fdtEnd)
          })

          console.log(doc);
        
        db.collection('sessions').add(doc).then(() => {
            this.set('formData', {});
            this.shadowRoot.querySelector('#new-session-dialog').close();
        })

    }
}

customElements.define('coaching-sessions-new-session', CoachingSessionsNewSession);