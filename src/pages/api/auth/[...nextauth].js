import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { FirestoreAdapter } from '@auth/firebase-adapter';
// import { Firestore } fros m '@/config/firebase-admin';
// import * as allowedDb from '@/lib/admin/db/allowed';

// Allowed emails
const allowedEmails = ['alex@banyan.computer'];

export const authOptions = {
	debug: process.env.NODE_ENV === 'development',
	// adapter: FirestoreAdapter(Firestore),
	// Configure one or more authentication providers
	providers: [
		GoogleProvider({
			clientId: process.env.GOOGLE_CLIENT_ID,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET,
		}),
	],
	callbacks: {
		// Set new data in the token from the jwt callback
		async jwt({ token, account }) {
			// console.log(
			// 	'JWT callback: ',
			// 	'\nToken -> ',
			// 	token,
			// 	'\nAccount -> ',
			// 	account
			// );
			if (account) {
				token.accessToken = account.access_token;
				token.provider = account.provider;
				// Question: Does this work for all providers?
				token.id = account.providerAccountId;
			}
			return token;
		},

		// Set new data in the session from the user object, using token modified in jwt callback
		async session({ session, token }) {
			session.accessToken = token.accessToken;
			session.id = token.id;
			session.provider = token.provider;

			// console.log('New Session: ', session);
			return session;
		},

		async signIn({ account, profile }) {
			// Prevent sign in if the account is not allowed
			if (account.provider !== 'google') {
				return false;
			}
			// console.log(
			// 	'Sign in callback: ',
			// 	'\nAccount -> ',
			// 	account,
			// 	'\nProfile -> ',
			// 	profile
			// );

			// TODO: Real is allowed list from DB
			const isAllowedToSignIn = allowedEmails.includes(profile.email);
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
