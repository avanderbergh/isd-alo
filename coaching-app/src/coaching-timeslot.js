import {PolymerElement, html} from '@polymer/polymer/polymer-element.js';
import {format} from 'date-fns';
import './shared-styles.js';
import './coaching-sessions.js';

class CoachingTimeslot extends PolymerElement {
    static get properties() {
        return {
            timeslot: {
                type: Object
            },
            displayStartTime: {
                type: String,
                computed: '_computeDisplayStartTime(timeslot)'
            },
            user: Object
        }
    }

    static get template() {
        return html`
            <style include="shared-styles">
                #timeslot-container {
                    display: flex;
                    flex-direction: row;
                }

                #display-time {
                    width: 50px;
                    border-right: 1px solid;
                }

                #sessions {
                    display: flex;
                    flex-direction: row;
                    flex-wrap: wrap;
                }
            </style>
            <div id="timeslot-container">
                <div id="display-time">
                    <p>[[displayStartTime]]</p>
                </div>
                <div id="sessions">
                    <coaching-sessions user=[[user]] timeslot="[[timeslot]]"></coaching-sessions>
                </div>
            </div>
        `;
    }

    constructor() {
        super();
    }

    ready() {
        super.ready();
    }

    _computeDisplayStartTime(timeslot) {
        return format(timeslot.startTime, 'HH:mm');
    }
}

customElements.define('coaching-timeslot', CoachingTimeslot);