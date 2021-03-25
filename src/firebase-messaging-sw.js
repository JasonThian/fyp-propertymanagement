importScripts("https://www.gstatic.com/firebasejs/8.3.1/firebase-app.js");
importScripts(
    "https://www.gstatic.com/firebasejs/8.3.1/firebase-messaging.js",
);
// For an optimal experience using Cloud Messaging, also add the Firebase SDK for Analytics.
importScripts(
    "https://www.gstatic.com/firebasejs/8.3.1/firebase-analytics.js",
);

// Initialize the Firebase app in the service worker by passing in the
// messagingSenderId.
firebase.initializeApp({
    apiKey: "AIzaSyA57cBRSvRm3U-9mi5aHRts3Z15LslfkPo",
	authDomain: "propertymanagement-88d03.firebaseapp.com",
	databaseURL: "https://propertymanagement-  88d03.firebaseio.com",
	projectId: "propertymanagement-88d03",
	storageBucket: "propertymanagement-88d03.appspot.com",
	messagingSenderId: "429741658289",
	appId: "1:429741658289:web:4d2f4f490fac045e8e5290",
	measurementId: "G-6PBDHNV9RS"
});

// Retrieve an instance of Firebase Messaging so that it can handle background
// messages.
const messaging = firebase.messaging();

messaging.setBackgroundMessageHandler(function(payload) {
    console.log(
        "[firebase-messaging-sw.js] Received background message ",
        payload,
    );
    // Customize notification here
    const notificationTitle = "Background Message Title";
    const notificationOptions = {
        body: "Background Message body.",
        icon: "/itwonders-web-logo.png",
    };

    return self.registration.showNotification(
        notificationTitle,
        notificationOptions,
    );
});