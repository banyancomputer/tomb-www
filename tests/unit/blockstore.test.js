import { describe, expect, it, beforeAll, afterAll } from "vitest";
import * as util from "../utils";


describe("Blockstore Unit", () => {
    let blockstore; // Our blockstore

	beforeAll(async () => {
        blockstore = await util.getBlockstoreWorker(util.BLOCKSTORE_API);
	});

	afterAll(async () => {
        await blockstore.stop();
	});

	it("should fail for not including a bucket-id in the header", async () => {
        const resp = await blockstore.fetch(`put`, {
            method: "POST",
        });
        expect(resp).toBeDefined();
        expect(resp.status).toBe(400);
	});

    // TODO: This should be removed once the r2 bucket is accessible from the API
    // This route will no longer be needed
    // it("should be able to tell if a bucket is empty", async () => {
    //     const resp = await blockstore.fetch(``, {
    //         headers: {
    //             ...util.getBucketIdHeader(),
    //         },
    //         method: "DELETE",
    //     })
    //     expect(resp).toBeDefined();
    //     expect(resp.status).toBe(200);
    // });

    it("should succeed at putting, getting, and removing a RAW block", async () => {
        const data = "Hello, World!";
        const put_resp = await blockstore.fetch(`put`, {
            headers: {
                ...util.getBucketIdHeader(),
            },
            body: data,
            method: 'POST',
        }).then(r => r.json());
        expect(put_resp).toBeDefined();
        const key = put_resp.Key;
        const get_resp = await blockstore.fetch(`get?arg=${key}`, {
            headers: {
                ...util.getBucketIdHeader(),
            },
        }).then(r => r.text());
        expect(get_resp).toBeDefined();
        expect(get_resp).toBe(data);
        const delete_resp = await blockstore.fetch(`rm?arg=${key}`, {
            headers: {
                ...util.getBucketIdHeader(),
            },
            method: 'DELETE',
        }).then(r => r.json());
        expect(delete_resp).toBeDefined();
        expect(delete_resp.Hash).toBe(key);
    });

    it("should succeed at putting, getting, and removing a DAG-CBOR block", async () => {
        const data = "Hello, World!";
        const put_resp = await blockstore.fetch(`put?cid-codec=dag-cbor`, {
            headers: {
                ...util.getBucketIdHeader(),
            },
            body: data,
            method: "POST",
        }).then(r => r.json());
        expect(put_resp).toBeDefined();
        const key = put_resp.Key;
        const resp = await blockstore.fetch(`get?arg=${key}`, {
            headers: {
                ...util.getBucketIdHeader(),
            },
        }).then(r => r.text());
        expect(resp).toBeDefined();
        expect(resp).toBe(data);
        const delete_resp = await blockstore.fetch(`rm?arg=${key}`, {
            headers: {
                ...util.getBucketIdHeader(),
            },
            method: 'DELETE',
        }).then(r => r.json());
        expect(delete_resp).toBeDefined();
        expect(delete_resp.Hash).toBe(key);
    });
});