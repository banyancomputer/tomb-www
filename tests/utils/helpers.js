import { globals } from './globals.js';

/* Header Helpers */

export function createBucketIdHeader(bucketId) {
	return {
		'x-bucket-id': bucketId,
	}
}

export function createBearerHeader(bearerToken) {
	return {
		'authorization': `Bearer ${bearerToken}`,
	}
}

export function createBlockTypeHeader(blockType) {
	return {
		'x-block-type': blockType,
	}
}

/* Header Getters */

export function getAuthHeader() {
	return createBearerHeader(getBearerToken());
}

export function getBucketIdHeader() {
	return createBucketIdHeader(getBucketId());
}

export function getBadAuthHeader() {
	return createBearerHeader(getBadBearerToken());
}

export function getBadBucketIdHeader() {
	return createBucketIdHeader(getBadBucketId());
}

export function getMetadataBlockTypeHeader() {
	return createBlockTypeHeader(getMetadataBlockType());
}

export function getContentBlockTypeHeader() {
	return createBlockTypeHeader(getContentBlockType());
}

export function getBadBlockTypeHeader() {
	return createBlockTypeHeader(getInvalidBlockType());
}

/* Global Getters */

export function getBearerToken() {
	return `${globals.USER_ID}:${globals.USER_KEY}`;
}

export function getBadBearerToken() {
	return `${globals.USER_ID}:bad-secret`;
}

export function getBucketId() {
	return globals.BUCKET_ID;
}

export function getBadBucketId() {
	return globals.BAD_BUCKET_ID;
}

export function getMetadataBlockType() {
	return 'metadata';
}

export function getContentBlockType() {
	return 'content';
}

export function getInvalidBlockType() {
	return 'invalid';
}

export function getTestTextData() {
	return globals.TEXT_DATA;
}

export function getTestJsonData() {
	return globals.JSON_DATA;
}