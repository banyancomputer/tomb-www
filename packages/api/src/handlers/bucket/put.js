import { createBucket } from "../../utils/bucket";
import { JSONResponse } from "../../utils/json-response";
import { FirestoreCreateError } from "../../errors";

/**
 * Handle `put` bucket request
 * Creates a bucket with the name specified in the ctx.
 * Owns it according the calling user specified in the ctx.
 * @param {Request} request
 * @param {Env} env
 * @param {import('../../index').Ctx}
 */
export async function Put(_request, env, ctx) {
    const bucketId = ctx.bucketId;
    const userId = ctx.userId;

    return await createBucket(env, userId, bucketId).then(() => {
        return new Response(null , {
            status: 200,
            statusText: 'OK',
        })
    });
}