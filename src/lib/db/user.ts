import { Firestore } from '@/config/firebase';
import User, { UserData } from '@/lib/entities/user'
import {
    doc,
    getDoc,
    setDoc,
    collection,
} from 'firebase/firestore';
import { User as FirebaseUser } from 'firebase/auth';


const users_collection = collection(Firestore, "users");

/* User CRUD */

export const create = async (firebaseUser: FirebaseUser, data: UserData): Promise<User> => {
    const docRef = doc(users_collection, firebaseUser.uid);
    await setDoc(docRef, data);
    return {
        firebaseUser,
        data
    } as User;
}

export const read = async (firebaseUser: FirebaseUser): Promise<User> => {
    const docRef = doc(users_collection, firebaseUser.uid);
    const snapshot = await getDoc(docRef);
    return {
        firebaseUser,
        data: snapshot.data() as UserData
    } as User;
}
