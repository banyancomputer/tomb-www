/**
 * @param {Request} request
 * @param {Response} response
 * @returns {Response}
 */
export function addCorsHeaders(_request, response) {
	// Clone the response so that it's no longer immutable (like if it comes from cache or fetch)
	response = new Response(response.body, response);
	response.headers.set("Access-Control-Allow-Origin", '*');
	response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
	response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-bucket-id');
	return response;
}