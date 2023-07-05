// Note: This is a janky replacement for Firestore rules

export function pubkey_fingerprint_is_valid(fingerprint: string): boolean {
	// Return whehther the fingerprint is valid
	// Needs to be a sha256 hash in hex
	return fingerprint.match(/^[a-f0-9]{64}$/) !== null;
}

export function passkey_salt_is_valid(salt: string): boolean {
	// Return whether the salt is valid
	// TODO: Implement this
	return true;
}

export function enc_privkey_pkcs8_is_valid(enc_privkey: string): boolean {
	// Return whether the encrypted private key is valid
	// TODO: Implement this
	return true;
}

export function spki_is_valid(spki: string): boolean {
	// Return whether the spki is valid
	// TODO: Implement this
	return true;
}
