import {PolymerElement, html} from '@polymer/polymer/polymer-element.js';
import {format} from 'date-fns';

import './shared-styles.js';

class CoachingSessionsSessionCard extends PolymerElement {
    static get properties() {
        return {
            session: {
                type: Object
            },
            displayTime: {
                type: String,
                computed: '_computeDisplayTime(session)'
            }
        }
    }

    static get template() {
        return html`
            <style include="shared-styles">
                #sessionCard {
                    width: 120px;
                    border-radius: 5px;
                    padding: 10px;
                    margin: 12px;
                    text-align: center;
                    color: #fff;
                    background-color: var(--app-primary-color);
                    cursor: pointer;
                }
            </style>
            <div id="sessionCard">
                <h1>[[session.title]]</h1>
                <h2>[[displayTime]]</h2>
            </div>
        `;
    }

    constructor() {
        super();
    }

    ready() {
        super.ready();
    }

    _computeDisplayTime(session) {
        const start = session.startTime.toDate();
        const end = session.endTime.toDate();
        const displayTime = format(start, "H:mm") + ' - ' + format(end, "H:mm");
        return displayTime;
    }
}

customElements.define('coaching-sessions-session-card', CoachingSessionsSessionCard);