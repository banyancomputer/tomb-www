import { Bucket } from '../../firebase'

/**
 * @param {Request} request
 * @param {Env} env
 * @param {import('../../index').Ctx}
 */
export async function Put(_request, env, ctx) {
    const client = env.firestore;
    const bucketId = ctx.bucketId;
    const userId = ctx.userId;
    return await Bucket.Create(client, userId, bucketId);
}