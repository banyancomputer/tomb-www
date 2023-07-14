import { Firestore } from '@/config/firebase-server';

// Admin API for managing allowed users

const allowed_collection = Firestore.collection('allowed');

/* Allowed User CRUD */

export const read = async (email: string): Promise<boolean> => {
	const docRef = allowed_collection.doc(email);
	const snapshot = await docRef.get();
	console.log(snapshot);
	// log the data in the snapshot
	if (snapshot.exists) {
		console.log(snapshot.data());
	} else {
		console.log('No such document!');
	}
	return snapshot.exists;
};
