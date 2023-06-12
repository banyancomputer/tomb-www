const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, HEAD, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-bucket-id',
    'Access-Control-Max-Age': '86400',
};

export function handleOptions(request, env, ctx) {
    console.log("huh")
    if (request.method === 'OPTIONS') {
        console.log('Handling OPTIONS request');
        return new Response(null, {
            headers: corsHeaders,
        });
    }
    return request;
}
