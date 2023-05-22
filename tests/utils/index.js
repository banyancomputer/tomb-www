
export const BLOCKSTORE_API = "/block";

export const getDevUrl = () => {
	return process.env.E2E_ENDPOINT || "http://127.0.0.1:8787";
}

export * from "./helpers.js"
export * from "./workers.js"