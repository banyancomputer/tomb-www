import { unstable_dev } from "wrangler";

export class MyWorker {

	/*
	 * @param {string} api
	 */
	constructor(path, options) {
		this.api = null;
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

	withAPI(api) {
		this.api = api;
		return this;
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
		
export async function getWorker(api) {
	let worker = new MyWorker(api ?? '', "src/index.js", {
		config: "wrangler.toml",
		experimental: { disableExperimentalWarning: true },
        env: 'dev'
	});
	await worker.init();
	return worker;
}

// export async function getBlockstoreWorker(api) {
// 	let worker = new MyWorker(api ?? '', "packages/blockstore/build/worker/shim.mjs", {
// 		config: "packages/blockstore/wrangler.toml",
// 		experimental: { disableExperimentalWarning: true },
//         env: 'dev'
// 	});
// 	await worker.init();
// 	return worker;
// }