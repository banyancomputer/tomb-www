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
	console.log('FIREBASE_PROJECT_ID: ', process.env.FIREBASE_PROJECT_ID);
	console.log('FIREBASE_CLIENT_EMAIL: ', process.env.FIREBASE_CLIENT_EMAIL);
	console.log(
		'Using local emulator for Firestore: ',
		process.env.FIRESTORE_EMULATOR_HOST || 'localhost:8080'
	);

	admin.initializeApp(adminConfig);
}

const Firestore = getFirestore();

export { Firestore };
