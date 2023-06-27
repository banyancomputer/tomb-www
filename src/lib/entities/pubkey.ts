// User data that exists in firestore
export interface PubKeyData {
	// The SPKI of the user's exported public key, base64 encoded
	spki: string;
	// The uid of the user who owns the key
	owner: string;
}

export default interface PubKey {
	// The sha1 fingerprint of the user's exported public key, hex string
	id: string;
	data: PubKeyData;
}
