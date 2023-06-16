import { Firestore } from '@/config/firebase';
import {
    doc,
    getDoc,
    setDoc,
    collection,
} from 'firebase/firestore';
import PubKey, { PubKeyData } from '../entities/pubkey';

const pubkeys_collection = collection(Firestore, "pubkeys");

/* PubKey CRUD */

export const create = async (id: string, data: PubKeyData): Promise<PubKey> => {
    const docRef = doc(pubkeys_collection, id);
    await setDoc(docRef, data);
    return {
        id: docRef.id,
        data
    } as PubKey;
}

export const read = async (id: string): Promise<PubKey> => {
    const docRef = doc(pubkeys_collection, id);
    const snapshot = await getDoc(docRef);
    return {
        id: snapshot.id,
        data: snapshot.data() as PubKeyData
    } as PubKey;
}
