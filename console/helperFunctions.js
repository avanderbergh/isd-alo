const admin = require("firebase-admin");

exports.init = env => {
    let serviceAccount, databaseURL;
    if (env == "prod") {
        serviceAccount = require("./keys/isdcoaching-firebase-adminsdk-sr31i-73c1c90637.json");
        databaseURL = "https://isdcoaching.firebaseio.com"
    }
    if (env = "dev") {
        serviceAccount = require("./keys/isdcoaching-dev-firebase-adminsdk-ylcvn-920f7d0063.json")
        databaseURL = "https://isdcoaching-dev.firebaseio.com"
    }
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: databaseURL
    })
}

exports.addUserRole = (uid, role) => {
    console.log(`Adding ${role} to ${uid}`);
    return
}

exports.showAllUsers = async () => {
    const db = admin.firestore();
    const users = await db.collection("users").get();
    users.forEach(user => {
        console.log(user.data().email)
    })
}

exports.addCustomClaim = async (email, claim) => {
    const db = admin.firestore();
    const users = await db.collection("users").where("email", "==", email).get();
    if (users.size == 0) {
        console.log("User not found")
        return;
    }
    users.forEach(async user => {
        const uid = user.id;
        const userRecord = await admin.auth().getUser(uid);
        if (!userRecord.customClaims) userRecord.customClaims = {};
        userRecord.customClaims[claim] = true;
        await admin.auth().setCustomUserClaims(uid, userRecord.customClaims)
        console.log(`${claim} has been set on ${email}`);
    })
}