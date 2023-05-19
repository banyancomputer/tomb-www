import { deleteBucket } from "../../utils/bucket";
import { BucketNotEmptyError } from "../../errors";
import { JSONResponse } from "../../utils/json-response";

/**
 * Delete a bucket
 * @param {Request} request - 
 * @param {Env} env
 * @param {import('../../index').Ctx} -- gaurenteed to have bucketId
 */
export async function Delete(request, env, ctx) {
    const bucketId = ctx.bucketId;
    const userId = ctx.userId;
    // TODO: janky as hell, but it works
    // We shouldn't have to shill out to the blockstore service to check if the bucket is empty ... idt
    let is_empty = await env.blockstore_service.fetch(request, env, ctx).then((response) => {
        return response.status !== 400;
    });
    if (!is_empty) {
        throw new BucketNotEmptyError(bucketId);
    }
    return await deleteBucket(env, userId, bucketId)
}