import { BlockNotFoundError } from '../../errors';
import { blockKey } from '../../utils';
import { CID } from 'multiformats/cid'
import { JSONResponse } from '../../utils';

/**
 * Handle Block GET request
 * @param {Request} request
 * @param {Env} env
 * @param {Ctx} ctx - Gauranteed to have bucketId
 */
export async function Get(request, env, ctx) {

	const bucketId = ctx.bucketId;
	const params = ctx.params

	// TODO: How does authentication tie in to cached reqs?
	// Get cached block if exists
	const cache = caches.default;
	let res = await cache.match(request);
	if (res) {
		return res;
	}

	// Read the CID configuration from the request
	const cid_string = 	params ? params.get('arg') : undefined;
	// TODO: This should prolly be a 403
	if (!cid_string) throw new BlockNotFoundError;
	const cid = CID.parse(cid_string);
	const key = blockKey(bucketId, cid);
	console.log(`Block request for ${key}`);
	// Retrieve from bucket
	const r2Object = await env.r2_bucket.get(key);
	if (r2Object) {
		res = new Response(r2Object.body);
		// TODO: Determine if this is a permissioning issue
		// Store in cache
		ctx.waitUntil(cache.put(request, res.clone()));
		return res;
	}
	throw new BlockNotFoundError();
}

// TODO: Add test for Ls
/**
 * @param {Request} request
 * @param {Env} env
 * @param {import('../../index').Ctx}
 */
export async function Ls(_request, env, ctx) {
    const bucketId = ctx.bucketId;
    const blocks = await env.r2_bucket.list({
        prefix: bucketId,
        include: ['customMetadata']
    }).then((res) => {
		return res.objects.map(
			(b) => {
				return {
					cid: b.customMetadata.cid,
					size: b.size,
					uploaded: b.uploaded
				}
			}
		);
	});
    return new JSONResponse( blocks )
}
