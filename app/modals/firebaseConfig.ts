//firebaseConfig.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBJEfAojl5qbxGrShkR4aEcWnRxiaCCPT8",
  authDomain: "healthscope-2fe5e.firebaseapp.com",
  projectId: "healthscope-2fe5e",
  storageBucket: "healthscope-2fe5e.firebasestorage.app",
  messagingSenderId: "761964177684",
  appId: "1:761964177684:web:239ea506b52fc4ebef3a01",
  measurementId: "G-KQ84TTTKNZ"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

