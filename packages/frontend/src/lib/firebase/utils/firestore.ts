import client from '../client';
import AccessKey, { AccessKeyData } from '../../entities/accessKey'
import Bucket, { BucketData } from '@/lib/entities/bucket';
import User, { UserData } from '@/lib/entities/user';
import {
  doc,
  getDoc,
  getDocs,
  query,
  where,
  setDoc,
  collection,
  updateDoc,
  deleteDoc
} from 'firebase/firestore';

// TODO: It would be awesome if this was just exposed from a context or memo
// TODO: Use types
// TODO: Error handling on Firestore operations

// Our collections
const users_collection = "users"
const keys_collection = "accessKeys"
const buckets_collection = "buckets"

/* User Utilities */ 

/*
 * Initialize a user in firestore
 */
export async function createUser(uid: string): Promise<UserData> {
  const key = await createKey(uid);
  const key_id = key.id
  const docRef = doc(client.firestore, users_collection, uid);
  const data = { key_id } as UserData
  await setDoc(docRef, data);
  return data;
}

export async function getUser(uid: string): Promise<UserData> {
  const docRef = doc(client.firestore, users_collection, uid)
  const snapshot = await getDoc(docRef)
  return snapshot.data() as UserData
}

/* Key Utilities */

/*
 * Creates a key for a user -- generates a key and stores it in the database
 * @param owner - the uid of the user who owns the key
 */
export async function createKey(owner: string): Promise<AccessKey> {
  // Create a new document with unique id
  const accessKeysCollection = collection(client.firestore, keys_collection);
  const docRef = doc(accessKeysCollection);
  // Generte a random key
  const value = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  const data = { owner, value } as AccessKeyData;
  await setDoc(docRef, data);
  return {
    id: docRef.id,
    data
  } as AccessKey;
}

export async function getKey(keyId: string): Promise<AccessKey> {
  const docRef = doc(client.firestore, keys_collection, keyId);
  const snapshot = await getDoc(docRef);
  return {
    id: snapshot.id,
    data: snapshot.data() as AccessKeyData
  } as AccessKey;
}

/*
 * Get all keys for a user
 * @param owner - the uid of the user who owns the key
 */
export async function getKeys(owner: string): Promise<AccessKey[]> {
  let keys: AccessKey[] = []
  const keyQuery = query(
    collection(client.firestore, keys_collection),
    where("owner", "==", owner)
  );
  const querySnapshot = await getDocs(keyQuery);
  querySnapshot.forEach((doc) => {
    keys.push({
      id: doc.id,
      data: doc.data() as AccessKeyData
    })
  });
  return keys;
}

/*
 * Remove a key from the database by id
 * @param keyId - the id of the key to remove
 */
export async function removeKey(keyId: string): Promise<void> {
  const docRef = doc(client.firestore, keys_collection, keyId);
  await deleteDoc(docRef);
}

/* Bucket Utilities */ 

/*
 * Create a new bucket for a user
 * @param owner - the uid of the user who owns the bucket
 * @param bucketId - the id to associate with the bucket
 */
export async function createBucket(owner: string, bucketId: string): Promise<Bucket> {
  // Create a new document with Known Id
  const docRef = doc(client.firestore, buckets_collection, bucketId);
  const data = { owner } as BucketData;
  await setDoc(docRef, data);
  return {
    id: bucketId,
    data
  } as Bucket;
}

/*
 * Get a bucket by id
 * @param bucketId - the id of the bucket to get
 */
export async function getBucket(bucketId: string): Promise<Bucket> {
  const docRef = doc(client.firestore, buckets_collection, bucketId);
  const snapshot = await getDoc(docRef);
  return {
    id: snapshot.id,
    data: snapshot.data() as BucketData
  } as Bucket;
}

/*
 * Get all buckets that belong to a user
 * @param owner - the uid of the user we want to get buckets for
 */
export async function getBuckets(owner: string) {
  let buckets: Bucket[] = []
  const BucketQuery = query(
    collection(client.firestore, buckets_collection),
    where("owner", "==", owner)
  );
  const querySnapshot = await getDocs(BucketQuery);
  querySnapshot.forEach((doc) => {
    buckets.push({
      id: doc.id,
      data: doc.data() as BucketData
    })
  });
  return buckets; 
}

/*
 * Remove a bucket from the database by id
 * @param bucketId - the id of the bucket to remove
 */
export async function removeBucket(bucketId: string): Promise<void> {
  const docRef = doc(client.firestore, buckets_collection, bucketId);
  await deleteDoc(docRef);
}