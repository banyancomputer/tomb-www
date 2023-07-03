import { defineConfig } from 'cypress';

// TODO: Implement testing with NextAuth and Google Login

export default defineConfig({
	e2e: {
		baseUrl: 'http://localhost:3000/',
		chromeWebSecurity: false,
	},
	viewportWidth: 1280,
	viewportHeight: 720,
});
