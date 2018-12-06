import {PolymerElement, html} from '@polymer/polymer/polymer-element.js';
import '@polymer/paper-button/paper-button.js';

class CoachingSigninButton extends PolymerElement {
    static get template() {
        return html`
            <style>
                paper-button {
                    /*--mdc-theme-primary: #fff;
                    --mdc-theme-on-primary: #000;*/
                    background-color:#42a5f5;
                    color:#fff;
                }
            </style>

            <paper-button on-tap="_handleSignInTapped">
                <img src="../../images/g-logo.png" width="18" style="padding-left: 8px;">
                <span style="padding-left: 24px; padding-right: 8px;">Sign in with Google</span>
            </paper-button>
        `;
    }

    _handleSignInTapped() {
        console.log('Signin Tapped');
        this.dispatchEvent(new CustomEvent('sign-in'));
    }
}

customElements.define('coaching-signin-button', CoachingSigninButton);