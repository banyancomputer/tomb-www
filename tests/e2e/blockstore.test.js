import { describe, expect, it, beforeAll, afterAll } from "vitest";
import * as util from "../utils";

const DEV_URL = `${util.getDevUrl()}/block`

describe("Blockstore e2e", () => {
	it("should fail for not including a bucket-id in the header", async () => {
        const resp = await fetch(`${DEV_URL}/put`, {
            headers: {
                ...util.getAuthHeader(),
            },
            method: "POST",
        });
        expect(resp).toBeDefined();
        expect(resp.status).toBe(400);
	});

    it("should succeed at putting, getting, and removing a RAW block", async () => {
        const data = util.getRandomData() //"Hello, World!";
        const put_resp = await fetch(`${DEV_URL}/put`, {
            headers: {
               ...util.getAuthHeader(),
                ...util.getBucketIdHeader(),
            },
            body: data,
            method: 'POST',
        }).then(r => r.json());
        expect(put_resp).toBeDefined();
        const key = put_resp.Key;
        const get_resp = await fetch(`${DEV_URL}/get?arg=${key}`, {
            headers: {
                ...util.getAuthHeader(),
                ...util.getBucketIdHeader(),
            },
        }).then(r => r.text());
        expect(get_resp).toBeDefined();
        expect(get_resp).toBe(data);

        const rm_resp = await fetch(`${DEV_URL}/rm?arg=${key}`, {
            headers: {
                ...util.getAuthHeader(),
                ...util.getBucketIdHeader(),
            },
            method: 'DELETE',
        }).then(r => r.json());
        expect(rm_resp).toBeDefined();
        expect(rm_resp.Hash).toBe(key);
    });

    it("should succeed at putting, getting, and removing a DAG-CBOR block", async () => {
        const data = util.getRandomData();
        const put_resp = await fetch(`${DEV_URL}/put?cid-codec=dag-cbor`, {
            headers: {
                ...util.getAuthHeader(),
                ...util.getBucketIdHeader(),
            },
            body: data,
            method: "POST",
        }).then(r => r.json());
        expect(put_resp).toBeDefined();
        const key = put_resp.Key;
        const get_resp = await fetch(`${DEV_URL}/get?arg=${key}`, {
            headers: {
                ...util.getAuthHeader(),
                ...util.getBucketIdHeader(),
            },
        }).then(r => r.text());
        expect(get_resp).toBeDefined();
        expect(get_resp).toBe(data);

        const rm_resp = await fetch(`${DEV_URL}/rm?arg=${key}`, {
            headers: {
                ...util.getAuthHeader(),
                ...util.getBucketIdHeader(),
            },
            method: 'DELETE',
        }).then(r => r.json());
        expect(rm_resp).toBeDefined();
        expect(rm_resp.Hash).toBe(key);
    });
});