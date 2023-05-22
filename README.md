# Blucket
An edgebased, scalable, and user oriented blockstore deployed on Cloudflare

## Dependencies
- node LTS
- npm
- lerna
- firebase
- wrangler

## Layout
- `firebase` - Firebase resources and emulator data
- `packages` - our main services
  - api - our high level API, with authentication + integration with Firebase
  - blockstore - our blockstore implementation, meant to integrate with R2
- `tests` -  unit / service, integration, and e2e tests

## Setup
- Setup your Firebase integration -- login to Firebase and get a service account for your project
- Setup Cloudflare -- login to wrangler
- Config `packages/api/.dev.{stage}` TODO: Explain how

## Building
```sh
# Compiles the entire project
$ lerna run build
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

## WebAssembly
`blockstore` is implemented as a Rust worker.

`workers-rs` (the Rust SDK for Cloudflare Workers used in this template) is meant to be executed as compiled WebAssembly, and as such so **must** all the code you write and depend upon. All crates and modules used in Rust-based Workers projects have to compile to the `wasm32-unknown-unknown` triple.

Read more about this on the [`workers-rs`](https://github.com/cloudflare/workers-rs) project README.

## Issues

If you have any problems with the `worker` crate, please open an issue on the upstream project issue tracker on the [`workers-rs` repository](https://github.com/cloudflare/workers-rs).
