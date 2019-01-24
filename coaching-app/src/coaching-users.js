import {PolymerElement, html} from '@polymer/polymer/polymer-element.js';
import '@polymer/paper-button/paper-button';
import '@polymer/paper-input/paper-input';

class CoachingUsers extends PolymerElement {
    static get properties() {
        return {
            user: Object,
            userFormData: {
                type: Object,
                value: {}
            }
        }
    }

    static get template() {
        return html`
            <h1>Users</h1>
            <div>
                <h2>Add User Roles</h2>
                <paper-input label="UID" value="{{userFormData.uid}}"></paper-input>
                <paper-input label="Role" value="{{userFormData.role}}"></paper-input>
                <paper-button on-tap="_handleSubmitTapped">Submit</paper-button>
            </div>
        `;
    }

    constructor() {
        super();
    }

    ready() {
        super.ready();
    }

    _handleSubmitTapped(){
        console.log(this.userFormData);
        firebase.functions().httpsCallable('addUserRole')(this.userFormData)
        .then(result => {
            console.log(result);
        }).catch(error => {
            console.log('error');
        });
    }
}

customElements.define('coaching-users', CoachingUsers);