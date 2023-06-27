// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { connectAuthEmulator, getAuth } from 'firebase/auth';
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore';
import * as dev_config from '../../web.config.dev.json';
import * as config from '../../web.config.json';

const firebaseConfig =
	process.env.NODE_ENV === 'development' ? dev_config : config;

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
