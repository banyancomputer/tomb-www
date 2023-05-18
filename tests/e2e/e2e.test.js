import { describe, expect, it, beforeAll, afterAll } from "vitest";
import * as util from "../utils";

// TODO: End to end tests against a running server

describe("End to end tests", () => {
    let endpoint;
    beforeAll(() => {
        endpoint = process.env.ENDPOINT;
    });
    
    it("should fail with 401 error code for not including an Authoirzation Header", async () => {
        const resp = await fetch(endpoint);
        expect(resp).toBeDefined();
        expect(resp.status).toBe(401);
    });
});
