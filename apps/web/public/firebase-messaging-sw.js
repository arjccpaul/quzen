importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: 'AIzaSyBbuZj1-B_HStVrpCVmwU-ej3rYBhj-pzI',
  authDomain: 'qzen-292aa.firebaseapp.com',
  projectId: 'qzen-292aa',
  messagingSenderId: '693842403682',
  appId: '1:693842403682:web:ae67d9c359fafdc3180c3b',
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const { title, body } = payload.notification;
  self.registration.showNotification(title, {
    body,
    icon: '/icon-192x192.png',
  });
});
