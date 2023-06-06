import { Bucket } from "../../firebase";

/**
 * @param {Request} request
 * @param {Env} env
 * @param {import('../../index').Ctx}
 */
export async function Post(request, env, ctx) {
    const client = env.firestore
    const bucketId = ctx.bucketId;
    const userId = ctx.userId;
    // get the rootCid from the request body
    const { rootCid } = await request.json();
    if (!rootCid) {
        // TODO: This should be a properly defined error
        throw new Error('`rootCid` is required');
    }
    // update the bucket root CID in Firestore
    return await Bucket.PutRootCid(client, userId, bucketId, rootCid);
}