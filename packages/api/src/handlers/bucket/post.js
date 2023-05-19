import { updateBucketRootCid } from "../../utils/bucket";

/**
 * Handle `put` bucket request
 * Creates a bucket with the name specified in the ctx.
 * Owns it according the calling user specified in the ctx.
 * @param {Request} request
 * @param {Env} env
 * @param {import('../../index').Ctx}
 */
export async function Post(request, env, ctx) {
    const bucketId = ctx.bucketId;
    const userId = ctx.userId;
    // get the rootCid from the request body
    const { rootCid } = await request.json();
    if (!rootCid) {
        throw new Error('`rootCid` is required');
    }
    // update the bucket root CID in Firestore
    return await updateBucketRootCid(env, userId, bucketId, rootCid);
}