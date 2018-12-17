import {PolymerElement, html} from '@polymer/polymer/polymer-element.js';
import {format} from 'date-fns';

class CoachingDaysDayCard extends PolymerElement {
    static get properties() {
        return {
            day: Object,
            displayDate: {
                type: String,
                computed: '_computeDisplayDate(day.startTime)'
            },
            displayMonth: {
                type: String,
                computed: '_computeDisplayMonth(day.startTime)'
            }
        }
    }

    static get template() {
        return html`
            <style include="shared-styles">
                :host {
                display: block;
                padding: 10px;
                }

                #dayCard {
                    width: 120px;
                    border-radius: 5px;
                    padding: 10px;
                    text-align: center;
                    color: #fff;
                    background-color: var(--app-primary-color);
                    cursor: pointer;
                }

                h1 {
                    color: inherit;
                    font-size: 5rem;
                    line-height: 1;
                }

                h2 {
                    line-height: 0;
                }
            </style>
            
            <div id="dayCard" on-tap="_handleCardTapped">
                <h2>[[displayMonth]]</h2>
                <h1>[[displayDate]]</h1>
                <h3>[[_formatTime(day.startTime)]] - [[_formatTime(day.endTime)]]</h3>
            </div>
        `;
    }

    _computeDisplayDate(startTime) {
        const date = startTime.toDate();
        console.log('startTime', date);
        return format(date, 'd');
    }

    _computeDisplayMonth(startTime) {
        const date = startTime.toDate();
        return format(date, 'MMM');
    }

    _formatTime(timestamp) {
        const date = timestamp.toDate();
        return format(date, 'H:mm');
    }

    _handleCardTapped() {
        window.location.href = "days/" + this.day.__id__;
    }
}

customElements.define('coaching-days-day-card', CoachingDaysDayCard);