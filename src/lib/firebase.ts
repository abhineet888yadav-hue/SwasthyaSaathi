import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getAnalytics, isSupported } from "firebase/analytics";

// User provided configuration
const firebaseConfig = {
  apiKey: "AIzaSyD1cmNKDIzzGZ2eqVdfIzb0P7bLFPmzAKk",
  authDomain: "swasthyasaathi-ccb41.firebaseapp.com",
  projectId: "swasthyasaathi-ccb41",
  storageBucket: "swasthyasaathi-ccb41.firebasestorage.app",
  messagingSenderId: "992099353482",
  appId: "1:992099353482:web:608dc33277b63225fcfe73",
  measurementId: "G-RJQW4WGF2N"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Initialize Analytics safely
let analytics = null;
isSupported().then(yes => {
  if (yes) analytics = getAnalytics(app);
});

export { app, auth, googleProvider, analytics };
