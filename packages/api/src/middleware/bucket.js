import {
	NoBucketIdError,
    AccessDeniedError,
} from '../errors.js';
import { isBucketOwner } from '../utils/bucket.js';
import { JSONResponse } from '../utils/json-response.js';

// TODO: Eventually this should be replaced by wildcard subdomain routing
// i.e. instead of specicyfing the bucketId in x-bucket-id, you specify it in the subdomain for the request
// At the vesy least for testing, you might need to specify x-bucket-id
export function withBucketId(request, env, ctx) {
    const bucketId = getBucketIdFromRequest(request);
    ctx.bucketId = bucketId;
};

/**
 * Check for a x-bucket-id header and attach it to the context
 * @param {Request} request
 * @param {import('./env.js').Env} env
 * @param {import('../index').Ctx} ctx -- userId is expected within the context, bucketId is expected to be attached to the context
 * @returns {Promise<Response>}
 */
export async function withBucketAccess(_request, env, ctx) {
    await verifyBucketAccess(env, ctx.userId, ctx.bucketId)
};

async function verifyBucketAccess(env, userId, bucketId) {
    const isOwner = await isBucketOwner(env, userId, bucketId);
    if (!isOwner) {
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