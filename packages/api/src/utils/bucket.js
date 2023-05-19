import { firestore } from "../firebase";
import { 
    FirestoreNotFoundError, 
    FirestoreCreateError,  
    FirestoreDeleteError,
    BucketNotFoundError,
    BucketAlreadyExistsError
} from "../errors";

const bucketsCollection = 'buckets';

// Create

export async function createBucket(env, uid, bucketId) {
    // Get the Firestore client from the environment 
    let client = env.firestore;
    // Create a new document in Firestore
    return await firestore.createDocument(client, uid, bucketsCollection, bucketId, {
        owner: { stringValue: uid },
        rootCid: { stringValue: '' }
    }).catch((err) => {
        // If the document already exists, throw an error
        if (err instanceof FirestoreCreateError) {
            throw new BucketAlreadyExistsError(err);
        }
        throw err;
    });
}

// READ

/**
 * Get the root CID of a bucket
 * @param {import('../../middleware/env.js').Env} env - The environment
 * @param {string} userId - The user ID for who we're making the request for
 * @param {*} bucketId - The bucket ID we're looking for
 * @returns Promise<Object> - The root CID Or null if the bucket doesn't exist
 * @throws {BucketNotFoundError} - If the bucket doesn't exist
 * @throws {FirestoreError} - If there's an error with Firestore
 * @throws {Error} - If there's an error with the request
 */
export async function getBucketRootCid(env, userId, bucketId) {
    // Get the Firestore client from the environment
    let client = env.firestore;
    // Get the bucket root CID from Firestore
    return await firestore.getDocument(client, userId, bucketsCollection, bucketId, 'rootCid').then(doc => doc.fields.rootCid.stringValue).catch((err) => {
        // If the document doesn't exist, throw an error
        if (err instanceof FirestoreNotFoundError) {
            throw new BucketNotFoundError(err);
        }
        throw err;
    });
}

/**
 * Return whether a user is the owner of a bucket
 * @param {import('../../middleware/env.js').Env} env - The environment
 * @param {string} userId - The user ID for who we're making the request for
 * @param {*} bucketId - The bucket ID we're looking for
 * @returns Promise<boolean> - Whether the user is the owner of the bucket
 * @throws {BucketNotFoundError} - If the bucket doesn't exist
 */
export async function isBucketOwner(env, userId, bucketId) {
    // Get the Firestore client from the environment
    let client = env.firestore;
    // Get the bucket owner from Firestore
    return await firestore.getDocument(client, userId, bucketsCollection, bucketId, 'owner').then(doc => doc.fields.owner.stringValue === userId).catch((err) => {
        // If the document doesn't exist, throw an error
        if (err instanceof FirestoreNotFoundError) {
            throw new BucketNotFoundError(err);
        }
        throw err;
    });
}

// UPDATE

/**
 * Update the root CID of a bucket
 * @param {import('../../middleware/env.js').Env} env - The environment
 * @param {string} userId - The user ID for who we're making the request for
 * @param {*} bucketId - The bucket ID we're looking for
 * @param {*} rootCid - The root CID to update the bucket with
 * @returns Promise<void>
 * @throws {BucketNotFoundError} - If the bucket doesn't exist
 * @throws {FirestoreError} - If there's an error with Firestore
 * @throws {Error} - If there's an error with the request
 */
export async function updateBucketRootCid(env, userId, bucketId, rootCid) {
    // Get the Firestore client from the environment
    let client = env.firestore;
    // Update the bucket root CID in Firestore
    return await firestore.updateDocument(client, userId, bucketsCollection, bucketId, {
        rootCid: { stringValue: rootCid }
    }, 'rootCid', 'rootCid').catch((err) => {
        // If the document doesn't exist, throw an error
        if (err instanceof FirestoreNotFoundError) {
            throw new BucketNotFoundError(err);
        }
        throw err;
    });
}

/**
 * Delete a bucket from the persistent store (Firestore)
 * @param {import('../../middleware/env.js').Env} env - The environment
 * @param {*} bucketId - The bucket ID
 */
export async function deleteBucket(env, uid, bucketId) {
    // Get the Firestore client from the environment
    let client = env.firestore; 
    // Delete the document from Firestore
    return await firestore.deleteDocument(client, uid, bucketsCollection, bucketId).catch((err) => {
        // If the document doesn't exist, throw an error
        if (err instanceof FirestoreDeleteError) {
            throw new BucketNotFoundError(err);
        }
        throw err;
    });
}