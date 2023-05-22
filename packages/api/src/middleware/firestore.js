/* global BRANCH, VERSION, COMMITHASH, SENTRY_RELEASE */
import { FirebaseClient } from '../firebase/index.js'

/**
 * @typedef {import('multiformats/bases/interface').MultibaseCodec<any>} MultibaseCodec
 *
 * @typedef {Object} EnvInput
 * @property {string} [FIREBASE_PROJECT_ID]
 * @property {string} [FIREBASE_PRIVATE_KEY_ID]
 * @property {string} [FIREBASE_PRIVATE_KEY]
 * @property {string} [FIREBASE_CLIENT_EMAIL]
 * @property {string} [FIRESTORE_API_URL]

 *
 * @typedef {Object} EnvTransformed
 * @property {FirebaseClient} firestore
 *
 * @typedef {EnvInput & EnvTransformed} Env
 */

/**
 * @param {Request} request
 * @param {Env} env
 * @param {import('../index.js').Ctx} ctx
 */
export function withFirestore(_request, env, _ctx) {
	if (
		!env.project_id ||
		!env.private_key_id ||
		!env.private_key ||
		!env.client_email ||
		!env.FIRESTORE_API_URL
	) {
		throw new Error('Missing required env vars for firestore');
	}

	// Why can't cloudflare just work with JSON text blobs as ENV vars
	// Like JSON.stringify -> JSON.parse works locally but not on cloudflare...
	// Idk so that's why we do this ...
	env.firestore = new FirebaseClient(
		{
			project_id: env.project_id,
			private_key_id: env.private_key_id,
			private_key: env.private_key,
			client_email: env.client_email
		},
		env.FIRESTORE_API_URL
	);
}