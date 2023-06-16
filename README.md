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

Build a development docker image:
  
```bash
docker-compose build
```

Run a development docker container:
  
```bash
docker-compose up
```

And run the Firebase emulators in another terminal:
  
```bash
npm run firebase
```

## Testing

Re-implement Cypress tests.
