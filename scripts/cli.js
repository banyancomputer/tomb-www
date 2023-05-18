#!/usr/bin/env node
// import path from 'path';
// import dotenv from 'dotenv';
// import { fileURLToPath } from 'url';
import sade from 'sade';

// import { buildCmd } from './build.js';
// import { deployCmd } from './deploy.js';
// import { destroyCmd } from './destroy.js';
import { devCmd } from './dev.js';

// const __dirname = path.dirname(fileURLToPath(import.meta.url));
// dotenv.config({
// 	path: path.join(__dirname, '..', '.env'),
// });

const prog = sade('blucket-api');

prog
	.command('dev')
	.describe('Run the blucket API locally.')
	.option('--env', 'Environment', process.env.ENV)
	.action(devCmd);

// prog
//     .command('deploy')
// 	.describe('Deploy the worker.')
// 	.option('--env', 'Environment', process.env.ENV)
// 	.option('--secrets', 'Push secrets to the worker', false)
// 	.option('--r2', 'Deploy R2 buckets', false)
// 	.action(deployCmd);

// prog
// 	.command('destroy')
// 	.describe('Tear down the workers and infrastructure.')
// 	.option('--env', 'Environment', process.env.ENV)
// 	.option('--r2', 'Destroy R2 buckets', false)
// 	.action(destroyCmd);


prog.parse(process.argv);
