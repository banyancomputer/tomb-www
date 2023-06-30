import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore';
import * as config from '../../web.config.json';

const firebaseConfig = config;

const app = initializeApp(firebaseConfig);
const Firestore = getFirestore(app);
let _analytics;
if (typeof window !== 'undefined') {
	_analytics = getAnalytics(app);
}
if (process.env.NODE_ENV === 'development') {
	connectFirestoreEmulator(Firestore, 'localhost', 8080);
}

export { Firestore };
