import { Router } from 'itty-router';
import { errorHandler } from './errors.js';
import * as mw from './middleware/index.js';
import { JSONResponse } from './utils/json-response.js';

const IPFS_ROUTE = '/ipfs';
const IPFS_API_ROUTE = `${IPFS_ROUTE}/api/v0`

const router = Router();
const ipfsRouter = Router();

ipfsRouter
	/* Kubo HTTP RPC API */
	.all(`${IPFS_API_ROUTE}/block/*`, async (req, env, ctx) => {
		// console.log('ipfs block route');
		return await env.blockstore_service.fetch(req, env, ctx);
		// return new JSONResponse({ userId: ctx.userId, bucketId: ctx.bucketId })
	})

router
	// Authenticate all requests, and associate them with a bucket
	.all('*', mw.withFirestore, mw.withBearerAuth, mw.withBucket)
	/* Blucket management routes */
	// TODO: @amiller68
	// .put()
	// .delete()
	/* Ipfs Routes */
	.all(`${IPFS_ROUTE}/*`, ipfsRouter.handle)
	/* Misc Routes */
	// Get a 200 response for submitting a good GET request
	.get("/", async (_req, _env, ctx) => new JSONResponse({ userId: ctx.userId, bucketId: ctx.bucketId }))

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
