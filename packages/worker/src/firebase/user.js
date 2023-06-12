import * as firestore from "./firestore.js";
import { FirestoreNotFoundError } from "./../errors";

const usersCollection = 'users';

/**
 * Get the Access Key for a user from the persistent store (Firestore)
 * @param {import('../../middleware/env.js').Env} env - The environment
 * @param {*} userId - The user ID
d * @returns Promise<Object> - The bucket object OR  null if it doesn't exist
 */
export async function GetKey(client, userId) {
    // Get the Firestore client from the environment
    try {
        // Try and get the document from Firestore. Raise an error if it doesn't exist
        return await firestore.getDocument(client, userId, usersCollection, userId, 'key').then(doc => doc.fields.key.stringValue);
    } catch (e) {
        if (e instanceof FirestoreNotFoundError) {
            return null;
        }
        throw e;
    }
}