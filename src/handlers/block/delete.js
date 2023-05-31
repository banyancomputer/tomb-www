import { BlockNotFoundError } from '../../errors';
import { blockKey, JSONResponse } from '../../utils';
import { CID } from 'multiformats/cid'
/**
 * Handle Block GET request
 * @param {Request} request
 * @param {Env} env
 * @param {Ctx} ctx - Gauranteed to have bucketId
 */
export async function Delete(_request, env, ctx) {
	const bucketId = ctx.bucketId;
	const params = ctx.params

	// Read the CID configuration from the request
	const cid_string = 	params ? params.get('arg') : undefined;
	if (!cid_string) throw new BlockNotFoundError;
	const cid = CID.parse(cid_string);
	const key = blockKey(bucketId, cid);
	// Remove from bucket
	return await env.r2_bucket.delete(key).then(
		() => new JSONResponse({ Error: null, Hash: cid_string })
	);
}
