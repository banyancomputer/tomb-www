import { describe, expect, it, beforeAll, afterAll } from "vitest";
import * as util from '../utils'

describe("Auth Integration", () => {
	let api;

	beforeAll(async () => {
		api = await util.getWorker();
	});

	afterAll(async () => {
		await api.stop();
	});

	it("should fail with 401 error code for not including an Authoirzation Header", async () => {
		const resp = await api.fetch();
		expect(resp).toBeDefined();
		expect(resp.status).toBe(401);
	});

	it("should fail with 401 error code for not including a Bearer token", async () => {
		const resp = await api.fetch('', {
			headers: {
				"Authorization": "NOPE",
			},
		});
		expect(resp).toBeDefined();
		expect(resp.status).toBe(401);
	});

	it("should fail with 401 error code for not including a valid Bearer token", async () => {
		const resp = await api.fetch('', {
			headers: {
				...util.createBearerHeader("NOPE"),
			},
		});
		expect(resp).toBeDefined();
		expect(resp.status).toBe(401);
	});

	it("should fail with 403 error code for not including a Bearer token with a valid userId", async () => {
		const resp = await api.fetch('', {
			headers: {
				...util.createBearerHeader("bad-user-id:bad-secret"),
			},
		});
		expect(resp).toBeDefined();
		expect(resp.status).toBe(403);
	});

	it("should fail with 403 error code for not including a Bearer token with a valid userKey", async () => {
		const resp = await api.fetch('', {
			headers: {
				...util.getBadAuthHeader(),
			},
		});
		expect(resp).toBeDefined();
		expect(resp.status).toBe(403);
	});

	it("should fail with 400 error code for including valid authorization, but not a valid bucket header", async () => {
		const resp = await api.fetch('', {
			headers: {
				...util.getAuthHeader(),
			},
		});
		expect(resp).toBeDefined();
		expect(resp.status).toBe(400);
	});

	it("should fail with 404 error code for including valid authorization, but non-extant bucketId", async () => {
		const resp = await api.fetch('', {
			headers: {
				...util.getAuthHeader(),
				"x-bucket-id": "NOPE",
			},
		});
		expect(resp).toBeDefined();
		expect(resp.status).toBe(404);
	});

	it("should fail with a 403 error code for including valid authorization, but a bucketId that the user does not have access to", async () => {
		const resp = await api.fetch('', {
			headers: {
				...util.getAuthHeader(),
				...util.getBadBucketIdHeader(),
			},
		});
		expect(resp).toBeDefined();
		expect(resp.status).toBe(403);
	});

	it("should succeed with a 200 code for including valid authorization and a valid bucketId", async () => {
		const resp = await api.fetch('', {
			headers: {
				...util.getAuthHeader(),
				...util.getBucketIdHeader(),
			},
			method: 'GET'
		}).then(r => r.json());
		expect(resp).toBeDefined();
	});
});
