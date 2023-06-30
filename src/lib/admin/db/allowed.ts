import { Firestore } from '@/config/firebase-admin';

const allowed_collection = Firestore.collection('allowed');

/* Allowed User CRUD */

export const create = async (
    // The user's email 
    email: string,
): Promise<void> => {
    const docRef = allowed_collection.doc(email);
    await docRef.set({});
}

export const read = async (email: string): Promise<boolean> => {
    const docRef = allowed_collection.doc(email);
    const snapshot = await docRef.get();
    return snapshot.exists;
}
