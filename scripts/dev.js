import { spawn } from 'child_process';

function kill_children(children) {
    children.forEach(child => {
        child.kill();
    });
}

export async function devCmd() {
    let children = [];
	console.log(`Initializing dev environment...`);

    try {
    console.log(`Starting Firebase Emulator Suite...`);
	children.push(spawn(`cd firebase && firebase emulators:start --import emualtor`, []));
    // , (err, stdout, stderr) => {
    //     if (err) {
    //         console.log(err);
    //         kill_children(children);
    //         return;
    //     }
    //     console.log(stdout);
    //     console.log(stderr);
    // }));

    console.log(`Starting API Service...`);
    children.push(spawn(`cd packages/api && npm run dev`, (err, stdout, stderr) => {
        if (err) {
            console.log(err);
            kill_children(children);
            return;
        }
        console.log(stdout);
        console.log(stderr);
    }));

    console.log(`Starting Blockstore Service...`);
    children.push(spawn (`cd packages/blockstore && npm run build && npm run dev`, (err, stdout, stderr) => {
        if (err) {
            console.log(err);
            kill_children(children);
            return;
        }
        console.log(stdout);
        console.log(stderr);
    }));

    // Wait for the user to exit the process
    process.stdin.resume();
    process.stdin.on('data', () => {
        kill_children(children);
    });
} catch (e) {
    console.log(e);
    kill_children(children);
}
}
