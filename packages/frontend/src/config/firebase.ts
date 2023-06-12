// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { connectAuthEmulator, getAuth } from 'firebase/auth';
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore';

const firebaseApiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
const firebaseAuthDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;
const firebaseRealtimeDatabaseURL =
  process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL;
const firebaseProjectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const firebaseStorageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
const firebaseMessagingSenderId =
  process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID;
const firebaseAppId = process.env.NEXT_PUBLIC_FIREBASE_APP_ID;
const firebaseMeasurementId = process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID;

const firebaseConfig = {
  apiKey: firebaseApiKey,
  authDomain: firebaseAuthDomain,
  projectId: firebaseProjectId,
  storageBucket: firebaseStorageBucket,
  messagingSenderId: firebaseMessagingSenderId,
  appId: firebaseAppId,
  databaseURL: firebaseRealtimeDatabaseURL,
  measurementId: firebaseMeasurementId,
};

const app = initializeApp(firebaseConfig);
const Auth = getAuth(app);
const Firestore = getFirestore(app);
let _analytics;
if (typeof window !== 'undefined') {
  _analytics = getAnalytics(app);
}
if (process.env.NODE_ENV === 'development') {
    connectAuthEmulator(Auth, 'http://localhost:9099');
    connectFirestoreEmulator(Firestore, 'localhost', 8080);
}

export { Auth, Firestore };