import { generateJWT } from '../utils/jwt.js';
import { FirebaseError } from '../errors.js';

/**
 * Firebase Client for interacting with the Firebase API.
 * Constructed from the workers Environment.
 * @class
 */
export default class FirebaseClient {
	/**
	 * Construct a new client. Initialize the Firebase Client to interact with a Firebase API
	 * @param {*} env - The workers environment. Should detail a Firebase Service Account as a Text Blob
	 * @param {*} apiUrl - The Firebase API URL
	 * @constructor
	 * @returns {FirebaseClient}
	 */
	constructor(serviceAccount, apiUrl) {
		this.serviceAccount = serviceAccount;
		this.apiUrl = apiUrl;
		this.algorithm = 'RS256';
	}

	/**
	 * Print the Firebase Client
	 */
	json() {
		return JSON.stringify(this);
	}

	/**
	 * TODO: Try and store and read these from the KV store
	 * Generate the Authorization header for the Firebase API
	 * @returns {Object} - The Authorization header
	 * @async
	 */
	async authHeader(sub) {
		try {
			let jwt = await generateJWT(
				// Payload
				{
					iss: this.serviceAccount.client_email,
					sub: sub,
					aud: this.apiUrl,
				},
				// Private KeyId
				this.serviceAccount.private_key_id,
				// Private Key
				this.serviceAccount.private_key,
				// Algorithm
				this.algorithm
			);
			return {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${jwt}`,
			};
		} catch (error) {
			throw new FirebaseError(error);
		}
	}

	/**
	 * Call a Firebase API endpoint
	 * @param {string} endpoint - The endpoint to call
	 * @param {Object} options - The options to pass to fetch
	 * @param {string} uid - The uid to associate with the request
	 * @returns {Object} - The response from the Firebase API
	 * @async
	 */
	async call(endpoint, options, uid) {
		return await fetch(`${this.apiUrl}/${endpoint}`, {
			...options,
			headers: await this.authHeader(uid),
		}).catch((error) => {
			throw new FirebaseError(error);
		});
	}
}
