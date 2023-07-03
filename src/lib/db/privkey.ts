import { Firestore } from '@/config/firebase-web';
import PrivKey, { PrivKeyData } from '@/interfaces/privkey';
import { doc, getDoc, setDoc, collection } from 'firebase/firestore';

const privkeys_collection = collection(Firestore, 'privkeys');

/* User CRUD */

export const create = async (
	// The user's email 
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

export const read = async (id: string): Promise<PrivKey> => {
	const docRef = doc(privkeys_collection, id);
	const snapshot = await getDoc(docRef);
	return {
		id,
		data: snapshot.data() as PrivKeyData,
	} as PrivKey;
};
