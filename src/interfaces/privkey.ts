// User data that exists in firestore
export interface PrivKeyData {
	// The fingerprint of the user's exported public key
	pubkey_fingerprint: string;
	// The user's encrypted exported private key
	enc_privkey_pkcs8: string;
	// The salt used to dervice the user's pass key
	passkey_salt: string;
}

export default interface PrivKey {
	// The user's firebase uid
	id: string;
	data: PrivKeyData;
}
