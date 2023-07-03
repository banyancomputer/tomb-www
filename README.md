# Tomb-WWW

Experimental frontend for Tomb.

## Dependencies

- [Node.js](https://nodejs.org/en/)
- [Yarn](https://yarnpkg.com/)
- Next.js
- Firebase CLI

## Development Setup

Install dependencies:

```bash
npm install
```

### Environment and Services
There is a `env.example` file in the root of the project. Copy this file to `.env.dev` and fill in the values. See below for more information on each variable.

#### Next Auth Setup
NextAuth needs to know where it's running, and a secret to encrypt sessions with.
For development the default values should be fine, but you can change them if you'd like.

#### Google Auth Setup
This project relies on Google Authentication through NextAuth.js. To set this up, you'll need to create a Google OAuth Client ID and Secret. You can do this by following the instructions [here](https://next-auth.js.org/providers/google).

Once you have these secrets, store them in the `.env.dev` file you created above.

#### Firebase Setup
This project uses Firebase for storing user data. To set this up, you'll need to create a Firebase project and enable the following services:

- Firestore

And initialize a Web App for it. Banyan team members can just use the project described in web.config.json -- you will need to update this config if you want to use your own Firebase project.

You will also need a service account key for the Firebase Admin SDK. You can create one by following the instructions [here](https://firebase.google.com/docs/admin/setup#initialize-sdk). Once you have this key, store it in the `.env.dev` file you created above.

You will need to set the vars described in the `env.example` file above.

### Running with Docker

Build a development docker image:

```bash
docker-compose build
```

Run a development docker container:

```bash
docker-compose up
```

If you have a properly configured `.env.dev` file, the frontend will be available at http://localhost:3000.

### Running Dev Server Locally

First make sure to source the `.env.dev` file you created above:

```bash
source .env.dev
```

Run the development server:

```bash
npm run dev
```

The frontend will be available at http://localhost:3000.

### Firebase

In addition to runing either docker or the local development server, you'll need to
run the Firebase emulators in another terminal:

```bash
npm run firebase
```

The Firebase emulators UI will be available at http://localhost:4000.

Note: The firebase emualtores might need to be installed on your machine.

<!-- TODO: Docuemtn test data -->
<!-- 
#### Test Data

There is a test user in the Firebase emulator with the following credentials:

```
Email: test@test.com
Passkey: test-key
```

You can use this user to login to the app and test the functionality.

The above command won't keep state between runs, if you'd like to save state run the following command instead:

```bash
npm run firebase:save
```

Please make sure there is only the test user and its associated data across Firebase state before pushing changes to the repository.

## Testing

TODO: Re-implement Cypress tests. -->
