import { Firestore } from '@/config/firebase-web';
import PrivKey, { PrivKeyData } from '@/interfaces/privkey';
import { doc, getDoc, setDoc, collection } from 'firebase/firestore';

// Client API for managing private keys

const privkeys_collection = collection(Firestore, 'privkeys');

/* User CRUD */

/*
 * Create a new PrivKey document
 * @param id The user's id -- must be a unique id across all users and auth providers
 * @param data The private keys data
 */
export const create = async (
	// The user's
	id: string,
	data: PrivKeyData
): Promise<PrivKey> => {
	const docRef = doc(privkeys_collection, id);
	await setDoc(docRef, data);
	return {
		id,
		data,
	} as PrivKey;
};

/*
 * Read a PrivKey document
 * @param id The user's id -- must be a unique id across all users and auth providers
 * @returns The PrivKey document
 */
export const read = async (id: string): Promise<PrivKey> => {
	const docRef = doc(privkeys_collection, id);
	const snapshot = await getDoc(docRef);
	return {
		id,
		data: snapshot.data() as PrivKeyData,
	} as PrivKey;
};
