import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process'; 
import dotenv from 'dotenv';
import serviceAccount from '../../serviceAccount.json' assert { type: "json" };

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// The only reason this command needs to exist is that wrangler doesn't support
// loading secrets from a .env file when publishing to the worker. This is a
// workaround until that's fixed.
// This doesn't necessarily also need to handle deploying the worker, but it can, so might as well.
// And it doesn't need to deploy our R2 buckets, but it can, so might as well.
export async function deployCmd(opts) {
	let env = opts.env || 'dev';
	// Check if .env.${env} exists
	const envPath = path.join(__dirname, `..`, `.env.${env}`);
	if (!fs.existsSync(envPath)) {
		console.error(`Environment ${env} not found`);
		// process.exit(1);
	}
	console.log(`Deploying into ${env}...`);

	if (env === 'dev') {
		console.log('Not implemented yet :(');
		return;
		// process.exit(1);
	}

	// If we're deploying with secrets, we need to publish them to the worker
	if (opts.secrets) {
		console.log(`Publishing secrets to ${env}...`);
		// Iterate over the .env.${env} file and publish the secrets to the worker
		const envVars = dotenv.parse(fs.readFileSync(envPath));
		for (const k in envVars) {
			console.log(`Publishing secret ${k} to ${env}...`);
			// Echo the secret to the worker -- this is to allow bash scripts to be used
			exec(`echo ${envVars[k]} | wrangler secret put ${k} --env ${env}`);
		}

		// Finally push the serviceAccount.json file to the worker
		// Read the serviceAccount.json file
		// const serviceAccountJson = JSON.stringify(serviceAccount);
		// console.log(serviceAccountJson);
		// Echo the serviceAccount.json file to the worker
		// exec(`echo "${serviceAccountJson}" | wrangler secret put FIREBASE_SERVICE_ACCOUNT_BLOB --env ${env}`);
	}

	if (opts.r2) {
		console.log(`Deploying R2 buckets to ${env}...`);
		// Deploy R2 buckets
		exec(`wrangler r2 bucket create blockstore-${env} --env ${env}`);
	};

	// Deploy the worker
	console.log(`Deploying worker to ${env}...`);
	exec (`wrangler publish --env ${env}`);
}
