import { 
	AccessDeniedError, 
	FirestoreNotFoundError, 
	FirestoreUpdateError, 
	FirestoreCreateError,
	FirestoreDeleteError
} from "../errors";

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

// Create

/**
 * Create a document in a firestore collection
 * @param {Object} firestoreClient - The firestore client to use
 * @param {string} uid - The uid of the user to use for the request
 * @param {string} collection - The collection to create the document in
 * @param {string} document - The document to create in the collection
 * @param {Object} data - The data to put in the document
 * @returns {Object} - The response from the Firebase API
 * @async
 */
export async function createDocument(firestoreClient, uid, collection, document, data) {
	const endpoint = `${firestoreApiRoute(
		firestoreClient.serviceAccount.project_id,
		firestoreClient.apiVersion
	)}/${collection}?documentId=${document}`;
	return await firestoreClient
		.call(endpoint, {
			method: 'POST',
			name: `${collection}/${document}`,
			body: JSON.stringify({
				fields: data,
			}),
		}, uid)
		.then((response) => {
			let json = response.json();
			if (response.status == 200) {
				return json;
			}
			throw new FirestoreCreateError();
		});
}

// Read

/**
 * Get a document from a firestore collection
 * @param {string} collection - The collection to get the document from
 * @param {string} document - The document to get from the collection
 * @param {string} mask - The mask to apply to the document. Should only be a single field
 * @returns {Object} - The response from the Firebase API. Null if the document does not exist.
 * @async
 */
export async function getDocument(firestoreClient, uid, collection, document, mask) {
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

// Update

/**
 * Update a document in a firestore collection
 * @param {Object} firestoreClient - The firestore client to use
 * @param {string} uid - The uid of the user to use for the request
 * @param {string} collection - The collection to update the document in
 * @param {string} document - The document to update in the collection
 * @param {Object} data - The data to put in the document
 * @returns {Object} - The response from the Firebase API
 * @async
 */
export async function updateDocument(firestoreClient, uid, collection, document, data, updateMask, mask) {
	const endpoint = `${firestoreApiRoute(
		firestoreClient.serviceAccount.project_id,
		firestoreClient.apiVersion
	)}/${collection}/${document}?${updateMask ? 'updateMask.fieldPaths=' + updateMask : ''}${mask ? '&mask.fieldPaths=' + mask : ''}`;
	return await firestoreClient
		.call(endpoint, {
			method: 'PATCH',
			// name: `${collection}/${document}`,
			body: JSON.stringify({
				fields: data,
			}),
		}, uid)
		.then((response) => {
			let json = response.json();
			if (response.status == 200) {
				return json;
			}
			throw new FirestoreUpdateError();
		});
}

// Delete

/**
 * Delete a document from a firestore collection
 * @param {Object} firestoreClient - The firestore client to use
 * @param {string} uid - The uid of the user to use for the request
 * @param {string} collection - The collection to delete the document from
 * @param {string} document - The document to delete from the collection
 * @returns {Object} - The response from the Firebase API
 * @async
 */
export async function deleteDocument(firestoreClient, uid, collection, document) {
	const endpoint = `${firestoreApiRoute(
		firestoreClient.serviceAccount.project_id,
		firestoreClient.apiVersion
	)}/${collection}/${document}`;
	return await firestoreClient
		.call(endpoint, {
			method: 'DELETE',
		}, uid)
		.then((response) => {
			let json = response.json();
			if (response.status == 200) {
				return json;
			}
			throw new FirestoreDeleteError();
		});
}