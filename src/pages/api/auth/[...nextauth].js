import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { FirestoreAdapter } from '@auth/firebase-adapter';
// import { Firestore } fros m '@/config/firebase-admin';
// import * as allowedDb from '@/lib/admin/db/allowed';

// Allowed emails
const allowedEmails = [
	'alex@banyan.computer',
];

export const authOptions = {
	debug: process.env.NODE_ENV === 'development',
	// adapter: FirestoreAdapter(Firestore),
	// Configure one or more authentication providers
	providers: [
		GoogleProvider({
			clientId: process.env.GOOGLE_CLIENT_ID,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET
		}),
	],
	callbacks: {
		async signIn({ user }) {
			// TODO: Real is allowed list from DB	
			const isAllowedToSignIn = allowedEmails.includes(user.email);
			// const isAllowedToSignIn = await allowedDb.read(user.email);

			if (isAllowedToSignIn) {
				return true;
			} else {
				// TODO: redirect to page with resources to request access to Alpha
				return false;
			}
		},
	},
};

export default NextAuth(authOptions);
