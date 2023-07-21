import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { AllowedFactory } from '@/lib/db';
/**
 * Handler for the /api/keys/priv endpoint
 * POST: Create a new private key, if the user doesn't already have one
 * GET: Get a private key that can be reconstructed with the user's passkey
 */
async function validate_post(
	data: any,
	res: NextApiResponse
): Promise<boolean> {
	// Check if the data is valid
	if (
		!(
			data &&
			// TODO: Better validation
			data.email
		)
	) {
		// Deny request
		res.status(400);
		return false;
	}
	return true;
}

export default async (req: NextApiRequest, res: NextApiResponse) => {
	// Only allow if running in dev mode
	if (process.env.NODE_ENV !== 'development') {
		res.status(403).send('forbidden'); // Forbidden
		return;
	}

	// // Get the Auth Header from the request
	// const authHeader = req.headers.authorization;

	// console.log("Matching against admin secret: " + process.env.ADMIN_SECRET)

	// // Check the Auth Header is present
	// if (!authHeader) {
	//     res.status(401).send({
	//         error: 'unauthorized: missing auth header',
	//     }); // Unauthorized
	//     return;
	// }

	// // Check the bearer token is present
	// const bearerToken = authHeader.split(' ')[1];
	// if (!bearerToken) {
	//     res.status(401).send({
	//         error: 'unauthorized: missing token',
	//     }); // Unauthorized
	//     return;
	// }

	// // Check the bearer token is valid
	// // it should match process.env.ADMIN_SECRET
	// if (bearerToken !== process.env.ADMIN_SECRET) {
	//     res.status(401).send({
	//         error: 'unauthorized: invalid token',
	//     }); // Unauthorized
	//     return;
	// }

	// Handle GET request
	if (req.method === 'GET') {
		// Return all allowed users
		const allowed = await AllowedFactory.readAll();
		res.status(200).send(allowed);
		return;
	}

	// Handle POST request
	if (req.method === 'POST') {
		console.log('POST request: ', req.body);
		// Get the data from the request
		const data = req.body;
		// Validate the data
		const valid = await validate_post(data, res);
		console.log('Valid: ' + valid);
		if (!valid) {
			res.status(400).send('bad request'); // Bad Request
			return;
		}
		// Create the allowed user
		let allowed;
		try {
			allowed = await AllowedFactory.createWithEmail(data.email);
		} catch (e) {
			console.log('Error creating allowed user: ' + e);
			res.status(500).send('internal server error'); // Bad Request
			return;
		}
		console.log('Created allowed user: ' + JSON.stringify(allowed));
		// Send the allowed user
		res.status(200).send(allowed);
		return;
	}

	// Handle DELETE request
	if (req.method === 'DELETE') {
		// Get the data from the request
		const data = req.body;
		// Validate the data
		const valid = await validate_post(data, res);
		if (!valid) {
			res.status(400).send('bad request'); // Bad Request
			return;
		}
		// Delete the allowed user
		let allowed;
		try {
			allowed = await AllowedFactory.deleteByEmail(data.email);
		} catch (e) {
			console.log('Error deleting allowed user: ' + e);
			res.status(500).send('internal server error'); // Bad Request
			return;
		}
		console.log('Deleted allowed user: ' + JSON.stringify(allowed));
		// Send the allowed user
		res.status(200).send(allowed);
		return;
	}

	res.status(405).send('method not allowed'); // Method Not Allowed
	return;
};
