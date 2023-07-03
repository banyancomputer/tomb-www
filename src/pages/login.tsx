import { useEffect, useState } from 'react';
import { NextPageWithLayout } from '@/pages/page';
import PublicLayout from '@/layouts/public/PublicLayout';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/router';

const Login: NextPageWithLayout = ({}) => {
	const { data: session } = useSession();
	const router = useRouter();
	const [error, setError] = useState('');

	useEffect(() => {
		if (session) {
			router.push('/').then(() => window.scrollTo(0, 0));
		}
	}, [session]);

	const handleLoginWithProvider = (provider: any) => () => {
		signIn(provider)
		.catch((err) => {
			setError(err.message);
		});
	};

	return (
		<div>
			<div className="text-6xl font-semibold align-left mb-2">Log in</div>
			{error && (
				// Error when login fails
				<label htmlFor="registration" className="label">
					<span className="text-xxs !p-0 text-error text-left">
						There was an issue logging you in. Please try again.
					</span>
				</label>
			)}

			<div className="flex items-center mt-4">
				<button
					className="!h-[52px] flex-1 text-[#FFF] bg-[#000] rounded-sm"
					onClick={handleLoginWithProvider('google')}
				>
					Log in with Google
				</button>
			</div>
		</div>
	);
};

export default Login;

Login.getLayout = (page) => {
	return <PublicLayout>{page}</PublicLayout>;
};
