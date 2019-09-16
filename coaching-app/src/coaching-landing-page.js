import {PolymerElement, html} from '@polymer/polymer/polymer-element.js';
import './coaching-signin-button.js';

class CoachingLandingPage extends PolymerElement {
    static get properties() {
        return {

        }
    }

    static get template() {
        return html`
            <style>
                h1 {
                    font-family: 'Roboto', sans-serif;
                    font-size: 5rem;
                }

                h2 {
                    font-family: 'Roboto', sans-serif;
                    font-size: 3rem;
                    font-weight: 500;
                }

                #vwc_logo {
                    height: 30vh;
                }     
                }
            </style>
            <div style="text-align: center; margin-top: 5rem;">
                <h1>ALO</h1>
                <h2>Additional Learning Opportunities</h2>
                <coaching-signin-button class="blue" on-sign-in="_handleSignIn"></coaching-signin-button>
            </div>
        `;
    }

    /**
     * Instance of the element is created/upgraded. Use: initializing state,
     * set up event listeners, create shadow dom.
     * @constructor
     */
    constructor() {
        super();
    }

    /**
     * Use for one-time configuration of your component after local
     * DOM is initialized.
     */
    ready() {
        super.ready();
    }

    _handleSignIn() {
        this.dispatchEvent(new CustomEvent('sign-in'));
    }
}

customElements.define('coaching-landing-page', CoachingLandingPage);