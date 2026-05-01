import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Config can be provided via environment variables for production
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyD1cmNKDIzzGZ2eqVdfIzb0P7bLFPmzAKk",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "swasthyasaathi-ccb41.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "swasthyasaathi-ccb41",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "swasthyasaathi-ccb41.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "992099353482",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:992099353482:web:608dc33277b63225fcfe73",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-RJQW4WGF2N"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

export { app, auth, db, googleProvider };
