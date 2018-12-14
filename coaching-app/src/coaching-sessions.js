import {
    PolymerElement,
    html
} from '@polymer/polymer/polymer-element.js';

import('./shared-styles.js');

import('./coaching-sessions-new-session.js')


class CoachingSessions extends PolymerElement {

    static get properties() {
        return {
            snapshotListener: Object,
            sessions: {
                type: Array,
                value: []
            }
        };
    }

    static get template() {
        return html `
            <style include="shared-styles">
                :host {
                display: block;

                padding: 10px;
                }
            </style>

            <h1>sessions</h1>
            <div> session list: </div>
            <dom-repeat items="{{sessions}}" as="session">
                <template>
                    <div>title: <span>{{session.title}}</span></div>
                    <div>description: <span>{{session.description}}</span></div>
                    <div>startTime: <span>{{session.startTime}}</span></div>
                    <div>endTime: <span>{{session.endTime}}</span></div>
                </template> 
                                   
            </dom-repeat>

            <coaching-sessions-new-session></coaching-sessions-new-session>
            
        `;
    }

    ready() {
        super.ready();
        this._loadsessions();
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        if (this.snapshotListener) this.snapshotListener();
    }

    _loadsessions() {
        const db = firebase.firestore();
        this.snapshotListener = db.collection('sessions')
            .orderBy('startTime')
            .onSnapshot(querySnapshot => {
                this.set('sessions', []);
                querySnapshot.forEach(doc => {
                    let space = doc.data();
                    space.__id__ = doc.id;
                    this.push('sessions', space)
                })
            })

    }

}

customElements.define('coaching-sessions', CoachingSessions);