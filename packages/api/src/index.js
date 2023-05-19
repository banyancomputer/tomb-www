import { Router } from 'itty-router';
import { errorHandler } from './errors.js';
import * as mw from './middleware/index.js';
import * as bucket from './handlers/bucket/index.js';

const BLOCKSTORE_API_ROUTE = `/block`;

const router = Router();

router
	// Authenticate all requests, and associate them with a bucket
	.all('*', mw.withFirestore, mw.withBearerAuth, mw.withBucketId)
	/* Ipfs Routes */
	.all(`${BLOCKSTORE_API_ROUTE}/*`, mw.withBucketAccess, async (req, env, ctx) => {
		return await env.blockstore_service.fetch(req, env, ctx);
	})
	/* Root Routes */
	// TODO: should this be PATCH?
	.put('/', bucket.Put)
	// Should get the root CID of the bucket
	.get('/', mw.withBucketAccess, bucket.Get)
	// Should set the root CID of the bucket
	.post('/', mw.withBucketAccess, bucket.Post)
	.delete('/', mw.withBucketAccess, bucket.Delete)

/**
 * @param {Request} request
 * @param {Response} response
 * @returns {Response}
 */
function addCorsHeaders(request, response) {
	// Clone the response so that it's no longer immutable (like if it comes from cache or fetch)
	response = new Response(response.body, response);
	const origin = request.headers.get('origin');
	if (origin) {
		response.headers.set('Access-Control-Allow-Origin', origin);
		response.headers.set('Vary', 'Origin');
	} else {
		response.headers.set('Access-Control-Allow-Origin', '*');
	}
	response.headers.set('Access-Control-Expose-Headers', 'Link');
	return response;
}

// https://developer.mozilla.org/en-US/docs/Web/API/FetchEvent
/** @typedef {{ waitUntil(p: Promise): void }} Ctx */

export default {
	async fetch(request, env, ctx) {
		try {
			let response = await router.handle(request, env, ctx);
			return addCorsHeaders(request, response);
		} catch (error) {
			return addCorsHeaders(request, errorHandler(error, env));
		}
	},
};
