#!/usr/bin/env node
import sade from 'sade';

import { deployCmd } from './deploy.js';
import { importFirebaseCmd } from './import-firebase.js';

const prog = sade('blucket-cli');

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
	.option('--secrets', 'Push secrets to the worker', false)
	.action(deployCmd);

prog.parse(process.argv);
