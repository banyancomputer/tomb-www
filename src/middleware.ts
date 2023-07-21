export { default } from 'next-auth/middleware';
export const config = {
	// Block specific routes -- this allows us to use api/admin/allow.ts in dev mode
	matcher: ['/', '/account', 'api/keys/*'],
};
