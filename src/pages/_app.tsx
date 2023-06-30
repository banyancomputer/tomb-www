import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { NextPageWithLayout } from '@/pages/page';
import { AuthProvider } from '@/contexts/auth';
import { TombProvider } from '@/contexts/tomb';
import { useEffect } from 'react';
import { ChakraProvider } from '@chakra-ui/react';

interface AppPropsWithLayout extends AppProps {
	Component: NextPageWithLayout;
}
export default function App({ Component, pageProps }: AppPropsWithLayout) {
	useEffect(() => {
		if (typeof window !== 'undefined') {
			const loader = document.getElementById('globalLoader');
			if (loader) loader.remove();
		}
	}, []);

	const getLayout = Component.getLayout || ((page) => page);
	return (
		<AuthProvider>
			<TombProvider>
				<ChakraProvider>
					{getLayout(<Component {...pageProps} />)}
				</ChakraProvider>
			</TombProvider>
		</AuthProvider>
	);
}
