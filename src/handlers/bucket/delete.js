import { Bucket } from '../../firebase'
import { BucketNotEmptyError } from "../../errors";

/**
 * Delete a bucket
 * @param {Request} request - 
 * @param {Env} env
 * @param {import('../../index').Ctx} -- gaurenteed to have a firebase client, userId, and bucketId attached
 */
export async function Delete(_request, env, ctx) {
    const client = env.firestore
    const userId = ctx.userId;
    const bucketId = ctx.bucketId;

    // Check if the bucket is empty
    const is_empty = await env.r2_bucket.list({
        prefix: bucketId,
        limit: 1
    }).then((res) => res.objects.length === 0);
    
    console.log(`Bucket ${bucketId} is empty: ${is_empty}`);

    // If it isn't throw an error
    if (!is_empty) {
        throw new BucketNotEmptyError(bucketId);
    }
    // Otherwise try deleting the bucket
    return await Bucket.Delete(client, userId, bucketId)
}