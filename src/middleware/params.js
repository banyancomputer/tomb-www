/**
 * Check for valid Bearer Auth header - used for managing buckets
 * @param {Request} request
 * @param {import('./env.js').Env} env
 * @param {import('./env.js').Ctx} ctx
 * @returns {Promise<Response>}
 */
export async function withParams(request, _env, ctx) {
    const { searchParams } = new URL(request.url)
    ctx.params = searchParams;
};