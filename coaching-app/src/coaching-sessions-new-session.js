import {
    PolymerElement,
    html
} from '@polymer/polymer/polymer-element.js';
import '@polymer/iron-icons/iron-icons.js';
import '@polymer/paper-button/paper-button.js';
import '@polymer/paper-dialog/paper-dialog.js';
import '@polymer/paper-fab/paper-fab.js';
import '@polymer/paper-input/paper-input.js';
import '@polymer/paper-input/paper-textarea.js';
import '@polymer/paper-dropdown-menu/paper-dropdown-menu.js';
import '@polymer/paper-item/paper-item.js';
import '@polymer/paper-listbox/paper-listbox.js';
import '@polymer/paper-checkbox/paper-checkbox.js';
import {format, addMinutes} from 'date-fns';

import './shared-styles.js';
import './date-time-picker.js'


class CoachingSessionsNewSession extends PolymerElement {
    static get properties() {
        return {
            day: Object,
            formData: {
                type: Object,
                value: {
                    grades: []
                }
            },
            startTimes: {
                type: Array,
                value: []
            },
            endTimes: {
                type: Array,
                value: []
            },
            show: {
                type: Boolean,
                value: false,
                notify: true
            },
            workshops: {
                type: Array,
                value: []
            },

            spaces: {
                type: Array,
                value: []
            },

            filteredSpaces: {
                type: Array,
                computed: '_computeFilteredSpaces(formData.capacity)'
            },
            formValid: {
                type: Boolean,
                computed: '_computeFormValid(formData.*)'
            },
            grades: {
                type: Array,
                value: [6, 7, 8, 9, 10, 11, 12]
            }
        }
    }

    static get observers() {
        return [
            '_dayChanged(day)',
            '_startTimeChanged(formData.startTime)',
            '_endTimeChanged(formData.endTime)'
        ]
    }

    static get template() {
        return html `
            <style include="shared-styles">
                #newSession {
                    background-color: #fff;
                    border-radius: 5px;
                    padding: 24px;
                }
                paper-item {
                    cursor: pointer;
                }

                .buttons {
                    position: relative;
                    padding: 8px 8px 8px 24px;
                    margin: 0;
                    color: var(--paper-dialog-button-color, var(--primary-color));
                    @apply --layout-horizontal;
                    @apply --layout-end-justified;
                }

                paper-checkbox {
                    margin-right: 10px;
                }

                .form-label {
                    color: var(--google-grey-700);
                    font-weight: 300;
                }
            </style>
            
            <template is="dom-if" if="{{!show}}">
                <paper-fab icon="add" on-tap="_handleAddSessionTapped"></paper-fab>
            </template>
            <template is="dom-if" if="{{show}}">
                <div id="newSession">
                    <h2>New session</h2>
                    <paper-dropdown-menu label="Workshop">
                        <paper-listbox slot="dropdown-content" selected="{{formData.workshop}}" attr-for-selected="workshop">
                            <template is="dom-repeat" items="{{workshops}}" as="workshop">
                                <paper-item workshop="[[workshop.__id__]]">[[workshop.title]]</paper-item>
                            </template>
                            <paper-item on-tap="_handleNewWorkshopTapped"> Create a new Workshop</paper-item>
                        </paper-listbox>
                    </paper-dropdown-menu>
                    <paper-input label="Title" value="{{formData.title}}"></paper-input>
                    <paper-textarea label="Description" value="{{formData.description}}"></paper-textarea>
                    <div>
                        <p><span class="form-label">Which grade levels can attend this session?</span></p>
                        <template is="dom-repeat" items="{{grades}}" as="grade">
                            <paper-checkbox class="grade-checkbox" data-grade$="[[grade]]" on-checked-changed="_gradeChecked">Grade [[grade]]</paper-checkbox>
                        </template>
                    </div>
                    <div>
                        <paper-dropdown-menu label="Start Time">
                            <paper-listbox slot="dropdown-content" selected="{{formData.startTime}}" attr-for-selected="date">
                                <template is="dom-repeat" items="{{startTimes}}" as="startTime">
                                    <paper-item date="[[startTime.date]]">[[startTime.display]]</paper-item>
                                </template>
                            </paper-listbox>
                        </paper-dropdown-menu>
                        <paper-dropdown-menu label="End Time">
                            <paper-listbox slot="dropdown-content" selected="{{formData.endTime}}" attr-for-selected="date">
                                <template is="dom-repeat" items="{{endTimes}}" as="endTime">
                                    <paper-item date="[[endTime.date]]">[[endTime.display]]</paper-item>
                                </template>
                            </paper-listbox>
                        </paper-dropdown-menu>
                    </div>
                    <div style="display: flex;">
                        <paper-input label="Capacity" type="number" min="5" max="100" value="{{formData.capacity}}" style="width: 5rem; margin-right: 2rem;"></paper-input>
                        <paper-dropdown-menu label="Select a Space">
                            <paper-listbox slot="dropdown-content" selected="{{formData.space}}" attr-for-selected="space">
                                <template is="dom-repeat" items="{{filteredSpaces}}" as="space">
                                    <paper-item space="[[space.__id__]]">[[space.name]] ([[space.capacity]])</paper-item>
                                </template>
                            </paper-listbox>
                        </paper-dropdown-menu>
                    </div>
                    <div class="buttons">
                        <paper-button on-tap="_handleCancelTapped">Cancel</paper-button>
                        <template is="dom-if" if="{{formValid}}">
                            <paper-button autofocus on-tap="_handleSubmitTapped">Submit</paper-button>
                        </template>
                    </div>
                </div>
            </template>
        `;
    }

    constructor() {
        super();
    }

    ready() {
        super.ready();
        this._fetchWorkshops();
    }

    _fetchWorkshops() {
        const db = firebase.firestore();
        const uid = firebase.auth().getUid();
        db.collection('workshops').where('owner', '==', uid)
            .onSnapshot(querySnapshot => {
                this.set('workshops', []);
                querySnapshot.forEach(doc => {
                    let workshop = doc.data();
                    workshop.__id__ = doc.id;
                    this.push('workshops', workshop);
                })
            })
    }

    _fetchSpaces(startTime, endTime) {
        const db = firebase.firestore();
        db.collection('sessions')
            .where('endTime', '>', startTime)
            .get().then(querySnapshot => {
                let usedSpaces = [];
                querySnapshot.forEach(doc => {
                    const session = doc.data();
                    if (session.startTime.toDate() < endTime) usedSpaces.push(session.space);
                });
                console.log('Used Spaces', usedSpaces);
                db.collection('spaces')
                .orderBy('name')
                .get()
                .then(querySnapshot => {
                    this.set('spaces', []);
                    querySnapshot.forEach(doc => {
                        let space = doc.data();
                        space.__id__ = doc.id;
                        if (!usedSpaces.includes(space.__id__)) {
                            console.log('Unsed space', space.name)
                            this.push('spaces', space);
                        }
                    })
                })
            })
    }

    _handleAddSessionTapped() {
        this.show = true;
    }

    _handleSubmitTapped() {
        this.formData.presenters = [firebase.auth().getUid()];
        const db = firebase.firestore();
        db.collection('sessions').add(this.formData).then(() => {
            this._resetForm();
            this.show = false;
        })
    }

    _handleCancelTapped() {
        this._resetForm();
        this.show = false;
    }

    _resetForm() {
        this.set('formData', {
            grades: []
        });
        const checkboxes = this.shadowRoot.querySelectorAll('paper-checkbox');
        checkboxes.forEach(checkbox => {
            checkbox.checked = false;
        });
    }

    _dayChanged(day) {
        console.log('Day Changed', day);
        if (day) {
            if (day.hasOwnProperty('startTime') && day.hasOwnProperty('endTime')) {
                const startTime = day.startTime.toDate();
                const endTime = day.endTime.toDate();
                let time = startTime;
                this.set('startTimes', []);
                while (time.getTime() < endTime.getTime()) {
                    this.push('startTimes', {date: time, display: format(time, 'H:mm')})
                    time = addMinutes(time, 30);
                }
            }
        }
    }

    _startTimeChanged(startTime) {
        if (startTime) {
            let time = startTime;
            this.set('endTimes', []);
            while (time.getTime() < this.day.endTime.toDate().getTime()) {
                time = addMinutes(time, 30);
                this.push('endTimes', {date: time, display: format(time, 'H:mm')})
            }
        }
    }

    _endTimeChanged(endTime) {
        if (endTime) {
            this._fetchSpaces(this.formData.startTime, endTime);
            this.set('formData.capacity', null);
        }
    }

    _computeFilteredSpaces(capacity) {
        this.set('formData.space', null);
        if (capacity) {
            return this.spaces.filter(el => {
                return el.capacity >= capacity
            })
        } else return [];
    }

    _handleNewWorkshopTapped(){
        window.history.pushState({}, 'ISD Coaching', "workshops/");
        window.dispatchEvent(new CustomEvent('location-changed'));
    }

    _computeFormValid(formData) {
        console.log('computing form valid', formData);
        return this.formData.workshop && this.formData.title && this.formData.description && this.formData.startTime && this.formData.endTime && this.formData.capacity && this.formData.space && this.formData.grades.length
    }
    
    _gradeChecked(e) {
        const grade = e.target.dataset.grade;
        const value = e.detail.value;
        if (value) {
            this.push('formData.grades', parseInt(grade));
        } else {
            const index = this.formData.grades.indexOf(grade);
            this.splice('formData.grades', index, 1);
        }
    }
}

customElements.define('coaching-sessions-new-session', CoachingSessionsNewSession);