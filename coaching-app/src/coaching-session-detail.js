import {PolymerElement, html} from '@polymer/polymer/polymer-element.js';
import '@polymer/app-route/app-route.js';

class CoachingSessionDetail extends PolymerElement {
    static get properties() {
        return {
            route: Object,
            routeData: {
                type: Object,
                observer: '_routeDataChanged'
            },
            session: Object,
            user: Object
        }
    }

    static get template() {
        return html`
            <style>
                #session-container {
                    margin: 12px;
                }
            </style>

            <app-route route="{{route}}" pattern="/:sessionId" data="{{routeData}}">
            </app-route>

            <div id="session-container">
                <h1>[[session.title]]</h1>
                <p>[[session.description]]</p>
            </div>

        `;
    }

    constructor() {
        super();
    }

    ready() {
        super.ready();
    }

    _routeDataChanged(routeData) {
        const sessionId = routeData.sessionId;
        if (sessionId) {
            const db = firebase.firestore();
            db.collection('sessions').doc(sessionId).get().then(doc => {
                console.log('doc', doc);
                let session = doc.data();
                session.__id__ = doc.id;
                this.set('session', session);
            })
        }
    }
}

customElements.define('coaching-session-detail', CoachingSessionDetail);