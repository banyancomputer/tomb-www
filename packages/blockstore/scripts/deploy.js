import { exec } from 'child_process'; 

export async function deployCmd(opts) {
	let env = opts.env || 'staging';
	if (env !== 'staging' && env !== 'production') {
		console.log('Environment must be either staging or production');
		return;
		process.exit(1);
	}
	console.log(`Deploying into ${env}...`);

	if (opts.r2) {
		console.log(`Deploying R2 buckets to ${env}...`);
		// Deploy R2 buckets
		exec(`wrangler r2 bucket create blucket-blockstore-bucket-${env} --env ${env}`);
	};

	// Deploy the worker
	console.log(`Deploying worker to ${env}...`);
	exec (`wrangler publish --env ${env}`);
}
