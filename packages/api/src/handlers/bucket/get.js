import { getBucketRootCid } from "../../utils/bucket";
import { JSONResponse } from "../../utils/json-response";

/**
 * Handle `put` bucket request
 * Creates a bucket with the name specified in the ctx.
 * Owns it according the calling user specified in the ctx.
 * @param {Request} request
 * @param {Env} env
 * @param {import('../../index').Ctx}
 */
export async function Get(_request, env, ctx) {
    const bucketId = ctx.bucketId;
    const userId = ctx.userId;
    return await getBucketRootCid(env, userId, bucketId).then((rootCid) => {
        return new JSONResponse({
            rootCid: rootCid
        })
    });
}