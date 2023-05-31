import { Bucket } from './../../firebase'
import { JSONResponse } from './../../utils'

/**
 * @param {Request} request
 * @param {Env} env
 * @param {import('../../index').Ctx}
 */
export async function Get(_request, env, ctx) {
    const client = env.firestore;
    const bucketId = ctx.bucketId;
    const userId = ctx.userId;
    return await Bucket.GetRootCid(client, userId, bucketId).then((rootCid) => {
        return new JSONResponse({
            rootCid: rootCid
        })
    });
}