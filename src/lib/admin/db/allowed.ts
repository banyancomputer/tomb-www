import { Firestore } from '@/config/firebase-admin';

// Admin API for managing allowed users

const allowed_collection = Firestore.collection('allowed');

/* Allowed User CRUD */

export const read = async (email: string): Promise<boolean> => {
	const docRef = allowed_collection.doc(email);
	const snapshot = await docRef.get();
	return snapshot.exists;
};
