// User data that exists in firestore
export interface PrivKeyData {
	// The fingerprint of the user's exported  ecdsa public key
	ecdsa_pubkey_fingerprint: string;
	// The user's wrapped exported ecdsa private key
	wrapped_ecdsa_privkey_pkcs8: string;
	// The user's wrapped exported ecdh private key
	wrapped_ecdh_privkey_pkcs8: string;
	// The salt used to derive the user's pass key
	passkey_salt: string;
}

export default interface PrivKey {
	// The user's firebase uid
	id: string;
	data: PrivKeyData;
}
