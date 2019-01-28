/**
 * @license
 * Copyright (c) 2016 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 */

import {
  PolymerElement,
  html
} from '@polymer/polymer/polymer-element.js';
import {
  setPassiveTouchGestures,
  setRootPath
} from '@polymer/polymer/lib/utils/settings.js';
import '@polymer/app-layout/app-drawer/app-drawer.js';
import '@polymer/app-layout/app-drawer-layout/app-drawer-layout.js';
import '@polymer/app-layout/app-header/app-header.js';
import '@polymer/app-layout/app-header-layout/app-header-layout.js';
import '@polymer/app-layout/app-scroll-effects/app-scroll-effects.js';
import '@polymer/app-layout/app-toolbar/app-toolbar.js';
import '@polymer/app-route/app-location.js';
import '@polymer/app-route/app-route.js';
import '@polymer/iron-pages/iron-pages.js';
import '@polymer/iron-selector/iron-selector.js';
import '@polymer/paper-icon-button/paper-icon-button.js';
import './coaching-icons.js';
import './coaching-auth.js';
import './coaching-landing-page.js';
import './coaching-user-menu.js';
import './coaching-session-detail.js';

// Gesture events like tap and track generated from touch will not be
// preventable, allowing for better scrolling performance.
setPassiveTouchGestures(true);

// Set Polymer's root path to the same value we passed to our service worker
// in `index.html`.
setRootPath(CoachingAppGlobals.rootPath);

class CoachingApp extends PolymerElement {
  static get template() {
    return html `
      <style>
        :host {
          --app-primary-color: #ff1446;
          --primary-color: #ff1446;

          --app-secondary-color: #328ce6;
          --secondary-color: #328ce6;
          --accent-color: #328ce6;

          display: block;
        }

        app-drawer-layout:not([narrow]) [drawer-toggle] {
          display: none;
        }

        app-header {
          color: #fff;
          background-color: var(--app-primary-color);
        }

        app-header paper-icon-button {
          --paper-icon-button-ink-color: white;
        }

        .drawer-list {
          margin: 0 20px;
        }

        .drawer-list a {
          display: block;
          padding: 0 16px;
          text-decoration: none;
          color: var(--app-secondary-color);
          line-height: 40px;
        }

        .drawer-list a.iron-selected {
          color: black;
          font-weight: bold;
        }
      </style>

      <app-location route="{{route}}" url-space-regex="^[[rootPath]]">
      </app-location>

      <app-route route="{{route}}" pattern="[[rootPath]]:page" data="{{routeData}}" tail="{{subroute}}">
      </app-route>

      <coaching-auth id="auth" loading="{{loading}}" signed-in="{{signedIn}}" user="{{user}}"></coaching-auth>
      <template is="dom-if" if="{{loading}}">
        <h1>Loading...</h1>
      </template>
      <template is="dom-if" if="{{!loading}}">
        <template is="dom-if" if="{{!signedIn}}">
          <coaching-landing-page on-sign-in="_handleSignInTapped"></coaching-landing-page>
        </template>
        <template is="dom-if" if="{{signedIn}}">
          <app-drawer-layout fullbleed="" narrow="{{narrow}}">
            <!-- Drawer content -->
            <app-drawer id="drawer" slot="drawer" swipe-open="[[narrow]]">
              <app-toolbar>Menu</app-toolbar>
              <iron-selector selected="[[page]]" attr-for-selected="name" class="drawer-list" role="navigation">
                <a name="dashboard" href="[[rootPath]]dashboard">Home</a>
                <template is="dom-if" if="{{user.claims.staff}}">
                  <a name="workshops" href="[[rootPath]]workshops">Workshops</a>
                </template>
                <a name="days" href="[[rootPath]]days">Days</a>                
                <template is="dom-if" if="{{user.claims.admin}}">
                  <a name="spaces" href="[[rootPath]]spaces">Spaces</a>
                </template>
              </iron-selector>
            </app-drawer>

            <!-- Main content -->
            <app-header-layout has-scrolling-region="">

              <app-header slot="header" condenses="" reveals="" effects="waterfall">
                <app-toolbar>
                  <paper-icon-button icon="my-icons:menu" drawer-toggle=""></paper-icon-button>
                  <div main-title="">ISD Coaching</div>
                  <coaching-user-menu user="[[user]]" on-sign-out="_handleSignOut"></coaching-user-menu>
                </app-toolbar>
              </app-header>

              <iron-pages selected="[[page]]" attr-for-selected="name" role="main">
                <coaching-dashboard name="dashboard"></coaching-dashboard>
                <coaching-workshops name="workshops" user="[[user]]"></coaching-workshops>
                <coaching-spaces name="spaces"></coaching-spaces>
                <coaching-days name="days" route="[[subroute]]" user="[[user]]"></coaching-days>
                <coaching-session-detail name="sessions" route="[[subroute]]" user="[[user]]"></coaching-session-detail>
                <coaching-users name="users" user="[[user]]"><coaching-users>
                <coaching-view404 name="view404"></coaching-view404>
              </iron-pages>
            </app-header-layout>
          </app-drawer-layout>
        </template>
      </template>
    `;
  }

  static get properties() {
    return {
      loading: {
        type: Boolean,
        value: true
      },
      page: {
        type: String,
        reflectToAttribute: true,
        observer: '_pageChanged'
      },
      routeData: Object,
      signedIn: {
        type: Boolean,
        value: false
      },
      subroute: Object,
      user: Object
    };
  }

  static get observers() {
    return [
      '_routePageChanged(routeData.page)'
    ];
  }

  ready() {
    super.ready();
    this._initFirestore();
    this._handleDevEnvironment();
  }

  _routePageChanged(page) {
    // Show the corresponding page according to the route.
    //
    // If no page was found in the route data, page will be an empty string.
    // Show 'dashboard' in that case. And if the page doesn't exist, show 'view404'.
    if (!page) {
      this.page = 'dashboard';
    } else if (['dashboard', 'workshops', 'spaces','days', 'sessions', 'users'].indexOf(page) !== -1) {
      this.page = page;
    } else {
      this.page = 'view404';
    }

    // Close a non-persistent drawer when the page & route are changed.
    if (this.signedIn) {
      const drawer = this.shadowRoot.querySelector('#drawer');
      if (!drawer.persistent) {
        drawer.close();
      }
    }
  }

  _pageChanged(page) {
    // Import the page component on demand.
    //
    // Note: `polymer build` doesn't like string concatenation in the import
    // statement, so break it up.
    switch (page) {
      case 'dashboard':
        import('./coaching-dashboard.js');
        break;
      case 'workshops':
        import('./coaching-workshops.js');
        break;
      case 'spaces':
        import('./coaching-spaces.js');
        break;
      case 'days':
        import('./coaching-days.js');
        break;
      case 'sessions':
        import('./coaching-sessions');
        break;
      case 'users':
        import('./coaching-users.js');
      case 'view404':
        import('./coaching-view404.js');
        break;
    }
  }

  _handleSignInTapped() {
    this.$.auth.signIn();
  }

  _handleSignOut() {
    this.$.auth.signOut();
    // todo: revoke
  }

  _initFirestore() {
    const firestore = firebase.firestore();
    const settings = {
      timestampsInSnapshots: true
    };
    firestore.settings(settings);
  }

  _handleDevEnvironment() {
    // Set the firebase functions URL if the project is running locally
    if (window.location.hostname == 'localhost') {
      firebase.functions()._url = name => {
        return `http://localhost:5000/isdcoaching-dev/us-central1/${name}`
      }
    }
  }
}

window.customElements.define('coaching-app', CoachingApp);