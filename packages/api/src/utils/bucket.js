import { firestore } from "../firebase";
import { FirestoreNotFoundError } from "../errors";

const bucketsCollection = 'buckets';

/**
 * Get the owner of a bucket
 * @param {import('../../middleware/env.js').Env} env - The environment
 * @param {string} userId - The user ID for who we're making the request for
 * @param {*} bucketId - The bucket ID we're looking for
 * @returns Promise<Object> - The bucket id Or null if the bucket doesn't exist
 */
export async function getBucketOwner(env, userId, bucketId) {
    // Get the Firestore client from the environment
    try {
        // Try and get the document from Firestore. Raise an error if it doesn't exist
        return await firestore.getDocument(env.firestore, userId, bucketsCollection, bucketId, 'owner').then(doc => doc.fields.owner.stringValue);
    } catch (e) {
        if (e instanceof FirestoreNotFoundError) {
            return null;
        }
        throw e;
    }
}