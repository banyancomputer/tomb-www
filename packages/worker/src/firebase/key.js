import * as firestore from "./firestore.js";
import { FirestoreNotFoundError, AccessKeyNotFoundError } from "./../errors";

const keysCollection = 'accessKeys';

/**
 * Get the Access Key for a user from the persistent store (Firestore)
 * @param {import('../../middleware/env.js').Env} env - The environment
 * @param {*} userId - The user ID
d * @returns Promise<Object> - The bucket object OR  null if it doesn't exist
 */
export async function Get(client, keyId) {
    return await firestore.getDocument(client, keyId, keysCollection, keyId, null).then(doc => {
        return {
            value: doc.fields.value.stringValue,
            owner: doc.fields.owner.stringValue
        }
    }).catch((err) => {
        // If the document doesn't exist, throw an error
        if (err instanceof FirestoreNotFoundError) {
            throw new AccessKeyNotFoundError(err);
        }
        throw err;
    });
}

