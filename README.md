# Blucket
An edgebased, scalable, and user oriented blockstore deployed on Cloudflare
Much love to [Vasco Santos](https://github.com/vasco-santos)


## Dependencies
- `node LTS - 18.16.0` at time of writing
- `npm`
- `lerna`
- `firebase-tools`
- `wrangler`

## Layout
- `firebase` - Firebase resources
- `packages` - Our main Cloudflare services and packages
  - api: our high level API, with authentication + integration with Firebase
  - blockstore: our blockstore implementation, meant to integrate with R2
- `tests` -  Our tests
  - unit: Unit tests for individual services
  - integration: Local Integration tests run with the `wrangler` JS API
  - e2e: End to end tests run against a deployed service

## Setup
- Firebase
  - Make sure you have a Firebase Account
  - Login to Firebase CLI
    - `firebase login` 
  - Setup your Firebase projects
    - Create a new project for each environment you want to implement. We've setup `dev`, `staging`, and `production` for our deployments.
    - Associate your project ids to their stages in `firebase/.firebaserc`.
    - Save the Admin SDK service accounts for these stages locally, for development and for pushing to Cloudflare. You can find these in the `Service Accounts` heading in your projects' settings. Save the JSON files as `firebase/service-account.${stage}.json`
- Cloudflare
  - Make sure you have a Cloudflare Account
  - Login to Cloudflare CLI
    - `wrangler login`
  - Configure your Cloudflare Account ID in:
    - `packages/api/wrangler.toml`
    - `packages/blockstore/wrangler.toml`
    - wrangler should handle this 🤌 but doesn't

## Building
```sh
# Compiles the entire project
$ npm i
$ npm run build
```

## Developing
To start a development server, run in this order:
```sh
# Start the Firebase emulator -- we rely on it for Firestore
cd firebase && firebase emulators:start --import emulator
# Start the API as a parent worker
cd packages/api && npm run dev
# Start the Blockstore as a child worker -- this needs to happen last
cd packages/blockstore && npm run dev
```

## Testing

```sh
# Run unit tests
npm run test:unit
# Run integration tests
npm run test:integration
# Run e2e tests, relies on having either a dev or deployed service
npm run test:e2e
```

## Deploying
TODO: Docs
tl;dr it's really annoying

## WebAssembly
`blockstore` is implemented as a Rust worker.

`workers-rs` (the Rust SDK for Cloudflare Workers used in this template) is meant to be executed as compiled WebAssembly, and as such so **must** all the code you write and depend upon. All crates and modules used in Rust-based Workers projects have to compile to the `wasm32-unknown-unknown` triple.

Read more about this on the [`workers-rs`](https://github.com/cloudflare/workers-rs) project README.

## Issues

If you have any problems with the `worker` crate, please open an issue on the upstream project issue tracker on the [`workers-rs` repository](https://github.com/cloudflare/workers-rs).
