import { Firestore } from '@/config/firebase';
import Bucket, { BucketData } from '@/lib/entities/bucket';
import {
	doc,
	getDoc,
	getDocs,
	query,
	where,
	setDoc,
	collection,
	deleteDoc,
} from 'firebase/firestore';

const buckets_collection = collection(Firestore, 'buckets');

/* Bucket CRUD */

export const create = async (id: string, data: BucketData): Promise<Bucket> => {
	const docRef = doc(buckets_collection, id);
	await setDoc(docRef, data);
	return {
		id: docRef.id,
		data,
	} as Bucket;
};

export const read = async (id: string): Promise<Bucket> => {
	const docRef = doc(buckets_collection, id);
	const snapshot = await getDoc(docRef);
	return {
		id: snapshot.id,
		data: snapshot.data() as BucketData,
	} as Bucket;
};

export const readAll = async (owner: string): Promise<Bucket[]> => {
	let buckets: Bucket[] = [];
	const BucketQuery = query(buckets_collection, where('owner', '==', owner));
	const querySnapshot = await getDocs(BucketQuery);
	querySnapshot.forEach((doc) => {
		buckets.push({
			id: doc.id,
			data: doc.data() as BucketData,
		});
	});
	return buckets;
};
