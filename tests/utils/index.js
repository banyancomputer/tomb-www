import { unstable_dev } from "wrangler";

export const BLOCKSTORE_API = "/ipfs/api/v0/block";

export class MyWorker {

	/*
	 * @param {string} api
	 */
	constructor(api, path, options) {
		this.api = api;
		this.path = path;
		this.options = options;
		this.worker = null;
	}

	async init() {
		this.worker = await unstable_dev(
			this.path,
			this.options
		);
	}

	async stop() {
		await this.worker.stop();
	}

	async fetch(path, options) {
		return await this.worker.fetch(`${this.api}/${path}`, {
			...options,
		});
	}
}
		
export async function getApiWorker(api) {
	let worker = new MyWorker(api ?? '', "packages/api/src/index.js", {
		config: "packages/api/wrangler.toml",
		experimental: { disableExperimentalWarning: true },
	});
	await worker.init();
	return worker;
}

export async function getBlockstoreWorker(api) {
	let worker = new MyWorker(api, "packages/blockstore/build/worker/shim.mjs", {
		config: "packages/blockstore/wrangler.toml",
		experimental: { disableExperimentalWarning: true },
	});
	await worker.init();
	return worker;
}

export * from "./helpers.js"