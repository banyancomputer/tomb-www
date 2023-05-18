import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process'; 
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// The only reason this command needs to exist is that wrangler doesn't support
// loading secrets from a .env file when publishing to the worker. This is a
// workaround until that's fixed.
// This doesn't necessarily also need to handle deploying the worker, but it can, so might as well.
// And it doesn't need to deploy our R2 buckets, but it can, so might as well.
export async function destroyCmd(opts) {
	let env = opts.env || 'dev';
	// Check if .env.${env} exists
	const envPath = path.join(__dirname, `..`, `.env.${env}`);
	if (!fs.existsSync(envPath)) {
		console.error(`Environment ${env} not found`);
		// process.exit(1);
	}
	console.log(`Destroying ${env}...`);

	if (env === 'dev') {
		console.log('Not implemented yet :(');
		return;
		// process.exit(1);
	}

	if (opts.r2) {
		// Deploy R2 buckets
		// TODO: Empty the bucket first
		exec(`wrangler r2 bucket  destroy --name blockstore-${env} --env ${env}`);
	};
	exec (`wrangler delete --env ${env}`);
}
