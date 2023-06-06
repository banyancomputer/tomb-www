export * as Bucket from './bucket.js';
export * as User from './user.js';
export * as Key from './key.js';

import { generateJWT } from '../utils';
import { FirebaseError } from '../errors';

/**
 * Firebase Client for interacting with the Firebase API.
 * Constructed from the workers Environment.
 * @class
 */
export default class Client {
	/**
	 * Construct a new client. Initialize the Firebase Client to interact with a Firebase API
	 * @param {*} serviceAccount - The Firebase Service Account to use
	 * @param {*} apiUrl - The Firebase API URL you want to interact with
	 * @constructor
	 * @returns {Client}
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
		// console.log(`Calling Firebase API at ${this.apiUrl}/${endpoint}`);
		return await fetch(`${this.apiUrl}/${endpoint}`, {
			...options,
			headers: await this.authHeader(uid),
		}).catch((error) => {
			throw new FirebaseError(error);
		});
	}
}

