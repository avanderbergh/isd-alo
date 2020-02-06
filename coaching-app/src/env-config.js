export function firebaseConfig() {
    if (window.location.hostname == 'localhost' || window.location.hostname == 'isdcoaching-dev.firebaseapp.com') {
        console.log('Using Dev Environment for Firebase');
        // Return Dev Config
        return {
            apiKey: "AIzaSyBjQYbudDsRnDPVSmdanvawQ1cVKn77HKA",
            authDomain: "isdcoaching-dev.firebaseapp.com",
            databaseURL: "https://isdcoaching-dev.firebaseio.com",
            projectId: "isdcoaching-dev",
            storageBucket: "isdcoaching-dev.appspot.com",
            messagingSenderId: "678411357948"
        }
    } else {
        // Returm Production Config
        return {
            apiKey: "AIzaSyAGTJ_unKXwqiAsDi9vIDXfiKTC4pJ9Mf8",
            authDomain: "isdcoaching.firebaseapp.com",
            databaseURL: "https://isdcoaching.firebaseio.com",
            projectId: "isdcoaching",
            storageBucket: "isdcoaching.appspot.com",
            messagingSenderId: "26969510290"
        }
    }
}

export function gapiConfig() {
    const scopes = [
        'https://www.googleapis.com/auth/userinfo.profile'
    ];
    const discoveryDocs = ["https://people.googleapis.com/$discovery/rest?version=v1"];

    if (window.location.hostname == 'localhost' || window.location.hostname == 'isdcoaching-dev.firebaseapp.com') {
        console.log('Using Dev Environment for GAPI config');
        // Return Dev Config
        return {
            apiKey: 'AIzaSyBjQYbudDsRnDPVSmdanvawQ1cVKn77HKA',
            discoveryDocs: discoveryDocs,
            clientId: '678411357948-rd0499lk0f639v055ts5vpdumgfcerl5.apps.googleusercontent.com',
            scope: scopes.join(' ')
        }
    } else {
        // Return Production Config
        return {
            apiKey: 'AIzaSyAGTJ_unKXwqiAsDi9vIDXfiKTC4pJ9Mf8',
            discoveryDocs: discoveryDocs,
            clientId: '26969510290-0h94m4e1a7gvrb0af95c2i3ir6710kq0.apps.googleusercontent.com',
            scope: scopes.join(' ')
        }
    }
}