import { NextPageWithLayout } from '@/pages/page';
import AuthedLayout from '@/layouts/authed/AuthedLayout';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

export interface IDashboard {}

const Dashboard: NextPageWithLayout<IDashboard> = () => {
	const { data: session } = useSession();
	const [content, setContent] = useState<string>('');

	useEffect(() => {
		if (session) {
			fetch('/api/restricted')
				.then((res) => {
					console.log(res);
					if (res.ok) return res.json();
					throw new Error('Unauthorized');
				})
				.then((data) => {
					setContent(JSON.stringify(data, null, 2));
				});
		}
	}, [session]);

	return (
		<>
			Signed in as {session?.user?.name} <br />
			Your email address is {session?.user?.email} <br />
			<div>Access Token: {session?.accessToken || ''}</div>
			<div>User Id: {session?.id}</div>
			<div>Provider: {session?.provider}</div>
			<div>{content}</div>
		</>
	);
};

export default Dashboard;

Dashboard.getLayout = (page) => {
	return <AuthedLayout>{page}</AuthedLayout>;
};
