import { firestore } from "../firebase";
import { FirestoreNotFoundError } from "../errors";

const usersCollection = 'users';

/**
 * Get the Access Key for a user from the persistent store (Firestore)
 * @param {import('../../middleware/env.js').Env} env - The environment
 * @param {*} userId - The user ID
d * @returns Promise<Object> - The bucket object OR  null if it doesn't exist
 */
export async function getUserKey(env, userId) {
    // Get the Firestore client from the environment
    try {
        // Try and get the document from Firestore. Raise an error if it doesn't exist
        return await firestore.getDocument(env.firestore, userId, usersCollection, userId, 'key').then(doc => doc.fields.key.stringValue);
    } catch (e) {
        if (e instanceof FirestoreNotFoundError) {
            return null;
        }
        throw e;
    }
}