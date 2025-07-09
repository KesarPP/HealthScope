// src/firebaseConfig.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getMessaging, isSupported } from 'firebase/messaging';

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBJEfAojl5qbxGrShkR4aEcWnRxiaCCPT8",
  authDomain: "healthscope-2fe5e.firebaseapp.com",
  projectId: "healthscope-2fe5e",
  storageBucket: "healthscope-2fe5e.appspot.com",
  messagingSenderId: "761964177684",
  appId: "1:761964177684:web:239ea506b52fc4ebef3a01",
  measurementId: "G-KQ84TTTKNZ"
};

// ✅ Initialize Firebase
const app = initializeApp(firebaseConfig);

// ✅ Firebase Services
const auth = getAuth(app);
const db = getFirestore(app);

// ✅ Handle messaging safely (because it may not be supported in all browsers)
let messaging;

isSupported().then((supported) => {
  if (supported) {
    messaging = getMessaging(app);
  } else {
    console.warn("FCM is not supported on this browser.");
  }
});

export { auth, db, messaging };
