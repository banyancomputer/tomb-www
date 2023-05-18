import { describe, expect, it, beforeAll, afterAll } from "vitest";
import * as util from "../utils";

describe("Worker", () => {
	let api; // Our accessible API
    let blockstore; // Our blockstore

	beforeAll(async () => {
        // ORDER MATTERS HERE
        blockstore = await util.getBlockstoreWorker(null);
        api = await util.getApiWorker(util.BLOCKSTORE_API);
	});

	afterAll(async () => {
		await api.stop();
        await blockstore.stop();
	});

	it("should fail for not including a bucket-id in the header", async () => {
        const resp = await api.fetch(`put`, {
            headers: {
                ...util.getAuthHeader(),
            },
            method: "POST",
        });
        expect(resp).toBeDefined();
        expect(resp.status).toBe(400);
	});

    it("should fail for not including a block-type in the header", async () => {
        const resp = await api.fetch(`put`, {
            headers: {
                ...util.getAuthHeader(),
                ...util.getBucketIdHeader(),
            },
            method: "POST",
        });
        expect(resp).toBeDefined();
        expect(resp.status).toBe(400);
    });

    it("should fail for including an invalid block-type in the header", async () => {
        const resp = await api.fetch(`put`, {
            headers: {
                ...util.getAuthHeader(),
                ...util.getBucketIdHeader(),
                ...util.getBadBlockTypeHeader(),
            },
        });
        expect(resp).toBeDefined();
        expect(resp.status).toBe(400);
    });

    it("should succeed at putting and getting metadata", async () => {
        const data = "Hello, World!";
        const put_resp = await api.fetch(`put`, {
            headers: {
               ...util.getAuthHeader(),
                ...util.getBucketIdHeader(),
                ...util.getMetadataBlockTypeHeader(),
            },
            body: data,
            method: 'POST',
        }).then(r => r.json());
        expect(put_resp).toBeDefined();
        const key = put_resp.Key;
        const resp = await api.fetch(`get?arg=${key}`, {
            headers: {
                ...util.getAuthHeader(),
                ...util.getBucketIdHeader(),
                ...util.getMetadataBlockTypeHeader(),
            },
        }).then(r => r.text());
        expect(resp).toBeDefined();
        expect(resp).toBe(data);
    });

    it("should succeed at putting and getting content", async () => {
        const data = "Hello, World!";
        const put_resp = await api.fetch(`put`, {
            headers: {
                ...util.getAuthHeader(),
                ...util.getBucketIdHeader(),
                ...util.getContentBlockTypeHeader(),
            },
            body: data,
            method: "POST",
        }).then(r => r.json());
        expect(put_resp).toBeDefined();
        const key = put_resp.Key;
        const resp = await api.fetch(`get?arg=${key}`, {
            headers: {
                ...util.getAuthHeader(),
                ...util.getBucketIdHeader(),
                ...util.getContentBlockTypeHeader(),
            },
        }).then(r => r.text());
        expect(resp).toBeDefined();
        expect(resp).toBe(data);
    });
});