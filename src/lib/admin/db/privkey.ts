import { Firestore } from '@/config/firebase-admin';
import PrivKey, { PrivKeyData } from '@/interfaces/privkey';

// Admin API for managing private keys

const privkeys_collection = Firestore.collection('privkeys');

/* User CRUD */

export const create = async (
	// The user's firebase uid
	id: string,
	data: PrivKeyData
): Promise<PrivKey> => {
	const docRef = privkeys_collection.doc(id);
	await docRef.set(data);
	return {
		id,
		data,
	} as PrivKey;
};

export const read = async (id: string): Promise<PrivKey> => {
	const docRef = privkeys_collection.doc(id);
	const snapshot = await docRef.get();
	return {
		id,
		data: snapshot.data() as PrivKeyData,
	} as PrivKey;
};
