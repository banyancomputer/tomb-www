import { User as FirebaseUser } from 'firebase/auth';

// User data that exists in firestore
export interface UserData {
    // The fingerprint of the user's public key in pkcs8 format
    pubkey_fingerprint: string,
    // The user's encrypted private key in pkcs8 format
    enc_privkey: string,
}

export default interface User {
    firebaseUser: FirebaseUser,
    data: UserData
}