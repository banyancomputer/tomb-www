import PrivKey, { PrivKeyData } from '@/interfaces/privkey';

// Client API for managing private keys

/* Privkey CRUD */

/*
 * Create a new PrivKey document via the API
 * @param data The private keys data
 */
export const create = async (data: PrivKeyData): Promise<PrivKey> => {
	const res = await fetch('/api/keys/private', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(data),
	});
	return res.json();
};

/*
 * Read a PrivKey document
 * @param id The user's id -- must be a unique id across all users and auth providers
 * @returns The PrivKey document
 */
export const read = async (): Promise<PrivKey> => {
	const res = await fetch(`/api/keys/private`, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
		},
	});
	return res.json();
};
