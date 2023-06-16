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

### Docker

Build a development docker image:
  
```bash
docker-compose build
```

Run a development docker container:
  
```bash
docker-compose up
```

The frontend will be available at http://localhost:3000.

### Local

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

#### Test Data

There is a test user in the Firebase emulator with the following credentials:

```
Email: test@test.com
password: iamatest
```

You can use this user to login to the app and test the functionality.

The above command won't keep state between runs, if you'd like to save state run the following command instead:
  
```bash
npm run firebase:save
```

Please make sure there is only the test user and its associated data across Firebase state before pushing changes to the repository.

## Testing

TODO: Re-implement Cypress tests.