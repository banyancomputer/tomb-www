import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import * as db from '@/lib/server/db/pubkey';
import * as utils from '@/lib/utils/server';
import { Session } from 'next-auth';

/** pub key schema
 * <pubkey_fingerprint>: {
 *   ecdsa_spki: string,
 *   ecdh_spki: string, 
 *   owner: string,
 * }
 */

async function validate_post(
	session: Session,
	id: string,
	data: any,
	res: NextApiResponse
): Promise<boolean> {
	// Check if the public key already exists -- don't wanna overwrite it
	const pubkey = await db.read(id);
	if (pubkey.data) {
		res.status(409); // Conflict
		return false;
	}
	if (
		!(
			data &&
			data.ecdh_spki &&
			data.ecdsa_spki &&
			data.owner &&
			// Require that the fingerprint is valid
			utils.pubkey_fingerprint_is_valid(id) &&
			// Require that the owner of the public key is the user
			data.owner === session.id &&
			// Require that the spki is valid
			utils.spki_is_valid(data.ecdh_spki) &&
			utils.spki_is_valid(data.ecdsa_spki)
		)
	) {
		res.status(400); // Bad Request
		return false;
	}

	return true;
}

/**
 * Handler for the /api/keys/pub endpoint
 * POST: Create a new public key
 * GET: Get a public key(s)
 */
export default async (req: NextApiRequest, res: NextApiResponse) => {
	// TODO: Fix this ts-ignore s.t. we can type check session
	// @ts-ignore
	const session: Session = await getServerSession(req, res, authOptions);
	if (!session) {
		res.status(401).send({}); // Unauthorized
	}
	// Handle POST request
	if (req.method === 'POST') {
		const id = req.query.id as string;
		const data = req.body;
		// await validate_post(session, id, data, res);
		const valid = await validate_post(session, id, data, res);
		if (!valid) {
			res.send({}); // Bad Request
		}
		const new_pubkey = await db.create(id, data);
		res.status(201).send(new_pubkey);
	}

	// Handle GET request
	if (req.method === 'GET') {
		// Check if the user is requesting a specific public key
		const id = req.query.id as string;
		if (id) {
			const pubkey = await db.read(id);
			if (pubkey) {
				res.status(200).send(pubkey);
			} else {
				res.status(404).send({}); // Not Found
			}
		}
		// Otherwise, return all of the user's public keys
		else {
			const pubkeys = await db.readAll(session.id);
			res.status(200).send(pubkeys);
		}
	}
};
