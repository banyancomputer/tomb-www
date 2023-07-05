import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import * as db from '@/lib/server/db/privkey';
import * as utils from '@/lib/utils/server';
import { Session } from 'next-auth';

/** priv key schema
 * <user_id>: {
 *   pubkey_fingerprint: string,
 *   passkey_salt: string,
 *   enc_privkey_pkcs8: string,
 * }
 */

/**
 * Handler for the /api/keys/priv endpoint
 * POST: Create a new private key, if the user doesn't already have one
 * GET: Get a private key that can be reconstructed with the user's passkey
 */
async function validate_post(
	_session: Session,
	id: string,
	data: any,
	res: NextApiResponse
): Promise<boolean> {
	// Check if the user already has a private key
	const privkey = await db.read(id);
	if (privkey.data) {
		// Deny request
		res.status(409); // Conflict
		return false;
	}

	// Check if the data is valid
	if (
		!(
			data &&
			data.pubkey_fingerprint &&
			data.passkey_salt &&
			data.enc_privkey_pkcs8 &&
			// Require that the fingerprint is valid
			utils.pubkey_fingerprint_is_valid(data.pubkey_fingerprint) &&
			// Require that the salt is valid
			utils.passkey_salt_is_valid(data.passkey_salt) &&
			// Require that the encrypted private key is valid
			utils.enc_privkey_pkcs8_is_valid(data.enc_privkey_pkcs8)
		)
	) {
		// Deny request
		res.status(400);
		return false;
	}
	return true;
}

export default async (req: NextApiRequest, res: NextApiResponse) => {
	// Get the user's session
	// TODO: Fix this ts-ignore s.t. we can type check session
	// @ts-ignore
	const session: Session = await getServerSession(req, res, authOptions);
	if (!session) {
		res.status(401).send({}); // Unauthorized
	}

	// Handle POST request
	if (req.method === 'POST') {
		const id = session.id;
		const data = req.body;
		// Validate the request
		const valid = await validate_post(session, id, data, res);
		if (!valid) {
			res.send({});
		}
		// Create the private key if validi
		const new_privkey = await db.create(id, data);
		res.status(201).send(new_privkey);
	}

	// Handle GET request
	if (req.method === 'GET') {
		const id = session.id;
		const privkey = await db.read(id);
		if (!privkey.data) {
			res.status(404).send({}); // Not Found
		}
		res.status(200).send(privkey);
	}
};
