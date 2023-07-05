import PubKey, { PubKeyData } from '@/interfaces/pubkey';

// Client API for managing public keys

/* PubKey CRUD */

/*
 * Create a new PubKey document
 * @param id The fingerprint of the public key: base64 encoded sha256 hash of the public key
 * @param data The public key data
 */
export const create = async (id: string, data: PubKeyData): Promise<PubKey> => {
	const res = await fetch(`/api/keys/public?id=${id}`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(data),
	});
	return res.json();
};

/*
 * Read a PubKey document
 * @param id The fingerprint of the public key: base64 encoded sha256 hash of the public key
 * @returns The PubKey document
 */
export const read = async (id: string): Promise<PubKey> => {
	const res = await fetch(`/api/keys/public?id=${id}`, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
		},
	});
	return res.json();
};
