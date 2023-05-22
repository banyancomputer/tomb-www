import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process'; 
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const WORKER_PATH = path.join(__dirname, '..');

export async function deployCmd(opts) {
	let env = opts.env || 'staging';
	if (env !== 'staging' && env !== 'production') {
		console.log('Environment must be either staging or production');
		return;
		process.exit(1);
	}
	// Check if .env.${env} exists
	const var_file = path.join(WORKER_PATH, `.${env}.vars`);
	if (!fs.existsSync(var_file)) {
		console.error(`Environment Variables for ${env} not found`);
		process.exit(1);
	}
	console.log(`Deploying into ${env}...`);
	// If we're deploying with secrets, we need to publish them to the worker
	if (opts.secrets) {
		console.log(`Publishing secrets to ${env}...`);
		// Iterate over the .env.${env} file and publish the secrets to the worker
		const vars = dotenv.parse(fs.readFileSync(var_file));
		for (const k in vars) {
			console.log(`Publishing secret ${k} to ${env}...`);
			// Echo the secret to the worker -- this is to allow bash scripts to be used
			exec(`echo '${vars[k]}' | wrangler secret put ${k} --env ${env}`);
		}
	}

	// Deploy the worker
	console.log(`Deploying worker to ${env}...`);
	exec (`wrangler publish --env ${env}`);
}
