import { Firestore } from '@/config/firebase-admin';
import PubKey, { PubKeyData } from '@/interfaces/pubkey';

// Admin API for managing public keys

const pubkeys_collection = Firestore.collection('pubkeys');

/* PubKey CRUD */

export const create = async (id: string, data: PubKeyData): Promise<PubKey> => {
	const docRef = pubkeys_collection.doc(id);
	await docRef.set(data);
	return {
		id: docRef.id,
		data,
	} as PubKey;
};

export const read = async (id: string): Promise<PubKey> => {
	const docRef = pubkeys_collection.doc(id);
	const snapshot = await docRef.get();
	return {
		id,
		data: snapshot.data() as PubKeyData,
	} as PubKey;
};
