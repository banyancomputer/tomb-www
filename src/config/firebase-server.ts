import admin, { ServiceAccount } from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';

let adminConfig = {
	credential: admin.credential.cert({
		projectId: process.env.FIREBASE_PROJECT_ID,
		clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
		privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
	} as ServiceAccount),
};

if (!admin.apps.length) {
	console.log('Initializing Firebase Admin...');
	if (process.env.NODE_ENV == 'development') {
		if (!process.env.FIRESTORE_EMULATOR_HOST) {
			console.log("Using local Emulator for Firestore...");
			console.log('FIRESTORE_EMULATOR_HOST not set, using default');
			process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';
		}
	}
	console.log('FIREBASE_PROJECT_ID: ', process.env.FIREBASE_PROJECT_ID);
	console.log('FIREBASE_CLIENT_EMAIL: ', process.env.FIREBASE_CLIENT_EMAIL);
	admin.initializeApp(adminConfig);
}

const Firestore = getFirestore();

export { Firestore };
