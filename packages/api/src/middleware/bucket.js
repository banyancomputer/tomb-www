import {
	NoBucketIdError,
    AccessDeniedError,
    BucketNotFoundError
} from '../errors.js';
import { getBucketOwner } from '../utils/bucket.js';
import { JSONResponse } from '../utils/json-response.js';

// TODO: Eventually this should be replaced by wildcard subdomain routing
// i.e. instead of specicyfing the bucketId in x-bucket-id, you specify it in the subdomain for the request
// At the vesy least for testing, you might need to specify x-bucket-id
/**
 * Check for a x-bucket-id header and attach it to the context
 * @param {Request} request
 * @param {import('./env.js').Env} env
 * @param {import('../index').Ctx} ctx -- userId is expected within the context
 * @returns {Promise<Response>}
 */
export async function withBucket(request, env, ctx) {
    const bucketId = getBucketIdFromRequest(request);
    let t = await verifyBucketAccess(env, ctx.userId, bucketId)
    // return new JSONResponse({ t });
    ctx.bucketId = bucketId;
};

// TODO: Verify access to a bucket
async function verifyBucketAccess(env, userId, bucketId) {
    // throw new BucketNotFoundError
    const owner = await getBucketOwner(env, userId, bucketId);
    if (!owner) {
        throw new BucketNotFoundError();
    } 
    else if (owner !== userId) {
        throw new AccessDeniedError();
    }
}

function getBucketIdFromRequest(request) {
	const bucketId = request.headers.get('x-bucket-id') || null;
    if (!bucketId) {
        throw new NoBucketIdError();
    }
    return bucketId;
}