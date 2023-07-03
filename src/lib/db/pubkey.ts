import { Firestore } from '@/config/firebase-web';
import { doc, getDoc, setDoc, collection } from 'firebase/firestore';
import PubKey, { PubKeyData } from '../../interfaces/pubkey';

// Client API for managing public keys

const pubkeys_collection = collection(Firestore, 'pubkeys');

/* PubKey CRUD */

/*
 * Create a new PubKey document
 * @param id The fingerprint of the public key: base64 encoded sha256 hash of the public key
 * @param data The public key data
 */
export const create = async (id: string, data: PubKeyData): Promise<PubKey> => {
	const docRef = doc(pubkeys_collection, id);
	await setDoc(docRef, data);
	return {
		id: docRef.id,
		data,
	} as PubKey;
};

/*
 * Read a PubKey document
 * @param id The fingerprint of the public key: base64 encoded sha256 hash of the public key
 * @returns The PubKey document
 */
export const read = async (id: string): Promise<PubKey> => {
	const docRef = doc(pubkeys_collection, id);
	const snapshot = await getDoc(docRef);
	return {
		id: snapshot.id,
		data: snapshot.data() as PubKeyData,
	} as PubKey;
};
