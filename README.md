# Blucket
An edgebased, scalable, and user oriented blockstore deployed on Cloudflare
Much love to [Vasco Santos](https://github.com/vasco-santos)


## Dependencies
- `node LTS - 18.16.0` at time of writing
- `npm`
- `firebase-tools`
- `wrangler`

## Layout
- `packages` - Our main services and packages
  - worker: our Cloudflare worker implementation for our Blockstore
  - firebase: a Firebase project that handles our user authentication and data
  - frontend: our frontend
- `tests` -  Our tests
  - integration: Local Integration tests run with the `wrangler` JS API. NOTE: Something seems to be wrong with `unstable_dev`, so these tests are currently broken.
  - e2e: End to end tests run against a deployed service

## Setup
Install dependencies:
```sh
$ npm i
```
Setup your vendor accounts and credentials:

- Firebase
  - Make sure you have a Firebase Account
  - Login to Firebase CLI
    - `firebase login` 
  - Setup your Firebase projects
    - Create a new project for each environment you want to implement. We've setup `dev`, and `production` for our deployments.
    - Associate your project ids to their stages in `firebase/.firebaserc`.
    - Save the Admin SDK service accounts for these stages locally, for development and for pushing to Cloudflare. You can find these in the `Service Accounts` heading in your projects' settings. Save the JSON files as `firebase/service-account.${stage}.json`
- Cloudflare
  - Make sure you have a Cloudflare Account
  - Login to Cloudflare CLI
    - `wrangler login`
  - Configure your Cloudflare Account ID in:
    - `wrangler.toml`

## Developing
To start a development server, run:
```sh
$ npm run dev
```
This runs our Firebase emulator, worker, and frontend in parallel. You can access the frontend at `localhost:3000`. You can access the Firebase emulator at `localhost:4000`. You can access the worker at `localhost:8787`.

## Testing

```sh
# Run integration tests -- no need to start a dev server
# TODO: Fix these tests
npm run test:integration
# Run e2e tests, relies on having either a dev or deployed service to test against
npm run test:e2e
```

## Deploying
TODO: Docs
tl;dr it's really annoying