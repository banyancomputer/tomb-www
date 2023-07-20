// User data that exists in firestore
export interface PubKeyData {
	// The SPKI of the user's ecdsa public key, base64 string
	ecdsa_spki: string;
	// The SPKI of the user's ecdh public key, base64 string
	ecdh_spki: string;
	// The id of the user
	owner: string;
}

export default interface PubKey {
	// The sha1 fingerprint of the user's ecdsa public key, hex string
	id: string;
	// The user's public key data
	data: PubKeyData;
}
