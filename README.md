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

#### **Next Auth Setup**

NextAuth needs to know where it's running, and a secret to encrypt sessions with. Set:

```
NEXTAUTH_URL=<where_next_is_running>
NEXTAUTH_SECRET=<some_random_string>
```

For development the default values should be fine, but you can change them if you'd like.

#### **Google Project Setup**

This project relies on Firestore for database storage and Google OAuth2.0 for authentication. You'll need to setup the following:

_Firebase Setup_

To set this up, you'll need to create a Firebase project and setup the following services:

- Firestore

Take note of the project ID, you'll need it for configuring your emulator for local development:

Please edit `firebase.rc` and set the default `project` variable to the project ID you created above:

```
{
  "projects": {
    "default": "banyan-dev-a3b42"
  }
}
```

You will also need a service account key for the Firebase Admin SDK. You can create one by following the instructions [here](https://firebase.google.com/docs/admin/setup#initialize-sdk). Once you have this key, store it in the `.env.dev` file you created above:

```
FIREBASE_PROJECT_ID=<project_id>
FIREBASE_CLIENT_EMAIL=<client_email>
FIREBASE_PRIVATE_KEY=<private_key>
```

_Google Auth Setup_

You'll need to create a Google OAuth Client ID and Secret. You can do this by following the instructions [here](https://next-auth.js.org/providers/google).

Once you have these secrets, store them in the `.env.dev` file you created above:

```
GOOGLE_CLIENT_ID=<client_id>
GOOGLE_CLIENT_SECRET=<client_secret>
```

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
