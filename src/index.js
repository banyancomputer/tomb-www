import { Router } from 'itty-router';
import { errorHandler } from './errors';
import {Block, Bucket} from './handlers';
import * as utils from './utils' 
import {
	withFirestore,
	withBearerAuth,
	withBucketId,
	withBucketAccess,
	withParams
} from './middleware';

// Our API routes
const BLOCKSTORE_API_ROUTE = `/block/*`;
const BLUCKET_API_ROUTE = '';

// Our Blucket Method Router
const blucketRouter = Router();
blucketRouter
	// Puts aren't authenticated, since the bucket doesn't exist yet
	.put(`${BLUCKET_API_ROUTE}`, Bucket.Put)
	// All other methods require authentication
	.all('*', withBucketAccess)
	.get(`${BLUCKET_API_ROUTE}`, Bucket.Get)
	.post(`${BLUCKET_API_ROUTE}`, Bucket.Post)
	.delete(`${BLUCKET_API_ROUTE}`, Bucket.Delete)

// Our Blocktore Method Router
const blockRouter = Router();
blockRouter
	.all('*', withBucketAccess)
	.post(`${BLOCKSTORE_API_ROUTE}/put?`, Block.Post)
	.get(`${BLOCKSTORE_API_ROUTE}/get?`, Block.Get)
	// TODO: block/stat
	// .head(`${BLOCKSTORE_API_ROUTE}/stat?`, Block.Head)
	.delete(`${BLOCKSTORE_API_ROUTE}/rm?`, Block.Delete)

const router = Router();
router
	// Authenticate all requests, and associate them with a bucket
	.all('*', withFirestore, withBearerAuth, withBucketId, withParams)
	// Blockstore Routes
	.all(BLOCKSTORE_API_ROUTE, blockRouter.handle)
	// Blucket Management Routes
	.all(BLUCKET_API_ROUTE, blucketRouter.handle)
	// Catch all 404
	.all('*', () => new Response({ status: 404 }));


export default {
	async fetch(request, env, ctx) {
		let response;
		try {
			response = await router.handle(request, env, ctx);
		} catch (error) {
			response = errorHandler(error);
		} finally {
			return utils.addCorsHeaders(request, response);
		}
	},
};
