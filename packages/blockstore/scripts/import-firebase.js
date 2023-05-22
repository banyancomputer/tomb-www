import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const API_WORKER_PATH = path.join(__dirname, '..');
const FIREBASE_PATH = path.join(__dirname, '..', '..', '..', 'firebase');

export async function importFirebaseCmd(opts) {
    // Check our environment
    let env = opts.env || 'dev';
    let force = opts.force || false;
    if (env !== 'dev' && env !== 'production' && env !== 'staging') {
        console.error(`Environment ${env} not found`);
        process.exit(1);
    }
    console.log("Importing Firebase into ", env);
    // Check if the environment already exists
    let var_file_path = path.join(API_WORKER_PATH, `.${env}.vars`);
    if (fs.existsSync(var_file_path) && !force) {
        console.error(`Environment ${env} already exists. Skipping...`);
        process.exit(0);
    } else if (force) {
        console.log(`Overwriting environment ${env}...`);
        fs.unlinkSync(var_file_path);
    }

    // Read the serviceAccount.json file
    const serviceAccountPath = path.join(FIREBASE_PATH, `service-account.${env}.json`);
    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath));
    let firestore_url = `https://firestore.googleapis.com`;
    if (env === 'dev') {
        firestore_url = `http://127.0.0.1:8080`;
    }
	
    // Open a logger to the var_file
    const var_file = fs.createWriteStream(var_file_path, {flags: 'a'});
    var_file.write(`project_id=${serviceAccount.project_id}\n`);
    var_file.write(`private_key_id=${serviceAccount.private_key_id}\n`);
    var_file.write(`private_key="${serviceAccount.private_key.replace(/\n/g, '\\n')}"\n`);
    var_file.write(`client_email=${serviceAccount.client_email}\n`);
    var_file.write(`FIRESTORE_API_URL=${firestore_url}\n`);
    var_file.end();
}
