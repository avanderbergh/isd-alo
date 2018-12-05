import {PolymerElement, html} from '@polymer/polymer/polymer-element.js';
import '@polymer/paper-dialog/paper-dialog.js';
import '@polymer/paper-button/paper-button.js';

class CoachingUserMenu extends PolymerElement {
    static get properties() {
        return {
            user: Object
        }
    }

    static get template() {
        return html`
            <style include="shared-styles">
                :host {
                    display: block
                }

                .profile-image {
                    margin-right: 36px;
                    background-size: 32px 32px;
                    border-radius: 50%;
                    overflow: hidden;
                    height: 32px;
                    width: 32px;
                    cursor: pointer;
                }
                #userDialog {
                    position: fixed;
                    top: 45px;
                    right: 10px;
                }

                p {
                    margin: 0px;
                }

                .name {
                    color: #000;
                    font-weight: bold
                }

                .email {
                    color: #666;
                }
                .terms {
                    font-size: 1rem;
                    margin-top: 1em;
                }
            </style>
            <template is="dom-if" if="{{user}}">
                <div class="profile-image" on-tap="_handlePhotoTap">
                    <img src="[[user.photoURL]]" alt="Profile Image" width="32" height="32">
                </div>
                <paper-dialog id="userDialog">
                    <div>
                        <p class="name">[[user.displayName]]</p>
                        <p class="email">[[user.email]]</p>
                        <p class="terms"><a href="#" target="_blank">Terms</a> | <a href="#" target="_blank">Privacy</a></p>
                    </div>
                    <div class="buttons">
                        <paper-button on-tap="_handleSignOut">Sign Out</paper-button>
                    </div>
                </paper-dialog>
            </template>
        `;
    }

    _handlePhotoTap() {
        this.shadowRoot.querySelector('#userDialog').open();
    }

    _handleSignOut() {
        this.dispatchEvent(new CustomEvent('sign-out'));
    }
}

customElements.define('coaching-user-menu', CoachingUserMenu);