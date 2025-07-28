// firebaseConfig.ts

import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBJEfAojl5qbxGrShkR4aEcWnRxiaCCPT8",
  authDomain: "healthscope-2fe5e.firebaseapp.com",
  projectId: "healthscope-2fe5e",
  storageBucket: "healthscope-2fe5e.appspot.com",
  messagingSenderId: "761964177684",
  appId: "1:761964177684:web:239ea506b52fc4ebef3a01",
  measurementId: "G-KQ84TTTKNZ",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const db = getFirestore(app);
const auth = getAuth(app);

// Optional: Initialize analytics safely
let analytics: ReturnType<typeof getAnalytics> | undefined;
isSupported()
  .then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  })
  .catch(() => {
    console.warn("Firebase Analytics not supported in this environment.");
  });

// Export instances to use across your frontend
export { app, db, auth, analytics };
