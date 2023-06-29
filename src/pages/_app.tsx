import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { NextPageWithLayout } from '@/pages/page';
import { AuthProvider } from '@/contexts/auth';
import { TombProvider } from '@/contexts/tomb';
import { useEffect } from 'react';
import { ChakraProvider } from '@chakra-ui/react';
import { SessionProvider } from 'next-auth/react';

interface AppPropsWithLayout extends AppProps {
	Component: NextPageWithLayout;
}
export default function App({
	Component,
	pageProps: { session, ...pageProps },
}: AppPropsWithLayout) {
	useEffect(() => {
		if (typeof window !== 'undefined') {
			const loader = document.getElementById('globalLoader');
			if (loader) loader.remove();
		}
	}, []);

	const getLayout = Component.getLayout || ((page) => page);
	return (
		// <AuthProvider>
		<SessionProvider session={session}>
			{/* <TombProvider> */}
			<ChakraProvider>{getLayout(<Component {...pageProps} />)}</ChakraProvider>
			{/* </TombProvider> */}
		</SessionProvider>
		// </AuthProvider>
	);
}
