import { describe, expect, it } from "vitest";
import * as util from '../utils'

const DEV_URL = util.getDevUrl();

describe("Bucket Integration", () => {
	it("should fail at attempting to create an extant bucket", async () => {
		// Create a bucket
		const put_resp = await fetch(DEV_URL, {
			headers: {
				...util.getAuthHeader(),
				...util.getBucketIdHeader(),
			},
			method: 'PUT'
		});
		expect(put_resp).toBeDefined();
		expect(put_resp.status).toBe(400);
	});

	it("should fail at attempting to delete a non-empty bucket", async () => {
		// Put a block in the bucket
		const put_resp = await fetch(`${DEV_URL}/block/put`, {
			headers: {
				...util.getAuthHeader(),
				...util.getBucketIdHeader(),
			},
			body: "Hello, World!",
			method: 'POST'
		}).then(r => r.json());
		expect(put_resp).toBeDefined();
		expect(put_resp.Key).toBeDefined();

		// Delete the bucket
		const delete_resp = await fetch(DEV_URL, {
			headers: {
				...util.getAuthHeader(),
				...util.getBucketIdHeader(),
			},
			method: 'DELETE'
		});
		expect(delete_resp).toBeDefined();
		expect(delete_resp.status).toBe(400);
	});

	it("should succeed at creating and immediately deleting a bucket", async () => {
		// Create a bucket
		const put_resp = await fetch(DEV_URL, {
			headers: {
				...util.getAuthHeader(),
				...util.createBucketIdHeader("test-bucket"),
			},
			method: 'PUT'
		});
		expect(put_resp).toBeDefined();
		expect(put_resp.status).toBe(200);

		// Delete the bucket
		const delete_resp = await fetch(DEV_URL, {
			headers: {
				...util.getAuthHeader(),
				...util.createBucketIdHeader("test-bucket"),
			},
			method: 'DELETE'
		});
		expect(delete_resp).toBeDefined();
		expect(delete_resp.status).toBe(200);
	});

	it("should succeed at creating a bucket, putting a block in it, removing the block, and deleting the bucket", async () => {
		// Create a bucket
		const put_resp = await fetch(DEV_URL, {
			headers: {
				...util.getAuthHeader(),
				...util.createBucketIdHeader("test-bucket"),
			},
			method: 'PUT'
		});
		expect(put_resp).toBeDefined();
		expect(put_resp.status).toBe(200);

		// Put a block in the bucket
		const put_block_resp = await fetch(`${DEV_URL}/block/put`, {
			headers: {
				...util.getAuthHeader(),
				...util.createBucketIdHeader("test-bucket"),
			},
			body: "Hello, World!",
			method: 'POST'
		}).then(r => r.json());
		expect(put_block_resp).toBeDefined();
		expect(put_block_resp.Key).toBeDefined();

		// Delete the block from the bucket
		const delete_block_resp = await fetch(`${DEV_URL}/block/rm?arg=${put_block_resp.Key}`, {
			headers: {
				...util.getAuthHeader(),
				...util.createBucketIdHeader("test-bucket"),
			},
			method: 'DELETE'
		}).then(r => r.json());
		expect(delete_block_resp).toBeDefined();
		expect(delete_block_resp.Hash).toBe(put_block_resp.Key);

		// Delete the bucket
		const delete_resp = await fetch(DEV_URL, {
			headers: {
				...util.getAuthHeader(),
				...util.createBucketIdHeader("test-bucket"),
			},
			method: 'DELETE'
		});
		expect(delete_resp).toBeDefined();
		expect(delete_resp.status).toBe(200);
	});

	it("should succeed at updating and retrieving the root CID of a bucket", async () => {
		// Update the root CID of the bucket
		const put_root_resp = await fetch(DEV_URL, {
			headers: {
				...util.getAuthHeader(),
				...util.getBucketIdHeader(),
			},
			body: JSON.stringify({
				rootCid: "badc0de",
			}),
			method: 'POST'
		});
		expect(put_root_resp).toBeDefined();
		expect(put_root_resp.status).toBe(200);

		// Get the root CID of the bucket
		const get_root_resp = await fetch(DEV_URL, {
			headers: {
				...util.getAuthHeader(),
				...util.getBucketIdHeader(),
			},
			method: 'GET'
		}).then(r => r.json());
		expect(get_root_resp).toBeDefined();
		expect(get_root_resp.rootCid).toBe("badc0de");
	});
});
