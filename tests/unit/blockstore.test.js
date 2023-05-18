import { describe, expect, it, beforeAll, afterAll } from "vitest";
import * as util from "../utils";


describe("Worker", () => {
    let blockstore; // Our blockstore

	beforeAll(async () => {
        blockstore = await util.getBlockstoreWorker(util.BLOCKSTORE_API);
	});

	afterAll(async () => {
        await blockstore.stop();
	});

	it("should fail for not including a bucket-id in the header", async () => {
        const resp = await blockstore.fetch(`put`, {
            headers: {
                ...util.getAuthHeader(),
            },
            method: "POST",
        });
        expect(resp).toBeDefined();
        expect(resp.status).toBe(400);
	});

    it("should fail for not including a block-type in the header", async () => {
        const resp = await blockstore.fetch(`put`, {
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
        const resp = await blockstore.fetch(`put`, {
            headers: {
                ...util.getBucketIdHeader(),
                ...util.getBadBlockTypeHeader(),
            },
        });
        expect(resp).toBeDefined();
        expect(resp.status).toBe(400);
    });

    it("should succeed at putting and getting metadata", async () => {
        const data = "Hello, World!";
        const put_resp = await blockstore.fetch(`put`, {
            headers: {
                ...util.getBucketIdHeader(),
                ...util.getMetadataBlockTypeHeader(),
            },
            body: data,
            method: 'POST',
        }).then(r => r.json());
        expect(put_resp).toBeDefined();
        const key = put_resp.Key;
        const resp = await blockstore.fetch(`get?arg=${key}`, {
            headers: {
                ...util.getBucketIdHeader(),
                ...util.getMetadataBlockTypeHeader(),
            },
        }).then(r => r.text());
        expect(resp).toBeDefined();
        expect(resp).toBe(data);
    });

    it("should succeed at putting and getting content", async () => {
        const data = "Hello, World!";
        const put_resp = await blockstore.fetch(`put`, {
            headers: {
                ...util.getBucketIdHeader(),
                ...util.getContentBlockTypeHeader(),
            },
            body: data,
            method: "POST",
        }).then(r => r.json());
        expect(put_resp).toBeDefined();
        const key = put_resp.Key;
        const resp = await blockstore.fetch(`get?arg=${key}`, {
            headers: {
                ...util.getBucketIdHeader(),
                ...util.getContentBlockTypeHeader(),
            },
        }).then(r => r.text());
        expect(resp).toBeDefined();
        expect(resp).toBe(data);
    });
});