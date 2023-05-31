import {
	NoAuthError,
	InvalidTokenError,
	AccessDeniedError,
	ExpectedBearerStringError
} from '../errors';
import { User } from '../firebase';


/**
 * Check for valid Bearer Auth header - used for managing buckets
 * @param {Request} request
 * @param {import('./env.js').Env} env
 * @param {import('./env.js').Ctx} ctx
 * @returns {Promise<Response>}
 */
export async function withBearerAuth(request, env, ctx) {
	// Check for a Valid Header
	const authHeader = getAuthHeaderFromRequest(request);
	// Get the token from the Bearer Auth header
	const token = parseBearerAuthHeader(authHeader);
	// Get the userId and userKey from the token
	const [userId, userKey] = parseTokenString(token);
	// Validate whether the userKey is valid for the userId
	await validateUserKey(env, userId, userKey);
	// Attach the userId to the context if so
	ctx.userId = userId;
};

async function validateUserKey(env, userId, userKey) {
	const client = env.firestore;
	const key = await User.GetKey(client, userId);
	if (!key || key !== userKey) {
		throw new AccessDeniedError();
	}
};

function getAuthHeaderFromRequest(request) {
	const authHeader = request.headers.get('Authorization') || null;
 	if (!authHeader) {
		throw new NoAuthError();
	}
	return authHeader;
}

function parseTokenString(token) {
	const [id, key] = token.split(':');
	if (!id || !key) {
		throw new InvalidTokenError();
	}
	return [id, key]
}

function parseBearerAuthHeader(header) {
	if (!header.toLowerCase().startsWith('bearer ')) {
		throw new ExpectedBearerStringError();
	}
	return header.substring(7);
}