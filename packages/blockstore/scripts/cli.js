#!/usr/bin/env node
import sade from 'sade';

import { deployCmd } from './deploy.js';
// import { destroyCmd } from './destroy.js';
import { importFirebaseCmd } from './import-firebase.js';

const prog = sade('blucket-api');

// Import Firebase configuration into the configruation of the api worker.
prog
	.command('import-firebase')
	.describe('Import a firebase service account.')
	.option('--env', 'Environment', 'dev') 
	.option('--force', 'Force import', false)
	.action(importFirebaseCmd);

prog
    .command('deploy')
	.describe('Deploy the worker.')
	.option('--env', 'Environment', process.env.ENV)
	.option('--r2', 'Deploy R2 buckets', false)
	.action(deployCmd);

// prog
// 	.command('destroy')
// 	.describe('Tear down the workers and infrastructure.')
// 	.option('--env', 'Environment', process.env.ENV)
// 	.option('--r2', 'Destroy R2 buckets', false)
// 	.action(destroyCmd);


prog.parse(process.argv);
