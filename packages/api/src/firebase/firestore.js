import { AccessDeniedError, FirestoreNotFoundError } from "../errors";

/**
 * Get the api route for the given project and API version
 * @param {string} projectId - The project ID
 * @param {string} apiVersion - The API version
 * @returns {string} - The API route
 */
const firestoreApiRoute = (projectId, apiVersion) => {
	switch (apiVersion) {
		default:
			return `v1/projects/${projectId}/databases/(default)/documents`;
	}
};

/**
 * Get a document from a firestore collection
 * @param {string} collection - The collection to get the document from
 * @param {string} document - The document to get from the collection
 * @param {string} mask - The mask to apply to the document. Should only be a single field
 * @returns {Object} - The response from the Firebase API. Null if the document does not exist.
 * @async
 */
export async function getDocument(firestoreClient, uid, collection,  document, mask) {
	const endpoint = `${firestoreApiRoute(
		firestoreClient.serviceAccount.project_id,
		firestoreClient.apiVersion
	)}/${collection}/${document}${mask ? '?mask.fieldPaths=' + mask : ''}`;
	return await firestoreClient
		.call(endpoint, {
			method: 'GET'
		}, uid)
		.then((response) => {
			let json = response.json();
			// TODO: This will raise a 403 if the request fails a secuirty rule, even if the underlying document does not exist
			if (response.status == 200) {
				return json;
			} else if (response.status == 403) {
				throw new AccessDeniedError();
			}
			throw new FirestoreNotFoundError();
		});
}

// /**
//  * Delete a document from a firestore collection
//  * @param {string} collection - The collection to delete the document from
//  * @param {string} document - The document to delete from the collection
//  * @returns {Object} - The response from the Firebase API
//  * @async
//  */
// export async function deleteDocument(firestoreClient, collection, document) {
// 	const endpoint = `${firestoreApiRoute(
// 		firestoreClient.serviceAccount.project_id,
// 		firestoreClient.apiVersion
// 	)}/${collection}/${document}`;
// 	// return endpoint;
// 	return await firestoreClient
// 		.call(endpoint, {
// 			method: 'DELETE',
// 		})
// 		.then((response) => {
// 			let json = response.json();
// 			if (response.status == 200) {
// 				return json;
// 			}
// 			throw new FirestoreDeleteError();
// 		});
// }
