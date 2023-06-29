import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

// Allowed emails
const allowedEmails = [
	'alex@banyan.computer',
];

export const authOptions = {
	debug: process.env.NODE_ENV === 'development',
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
