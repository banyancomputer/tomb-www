import { NextPageWithLayout } from '@/pages/page';
import AuthedLayout from '@/layouts/authed/AuthedLayout';
import { useSession } from 'next-auth/react';

export interface IDashboard {}

const Dashboard: NextPageWithLayout<IDashboard> = () => {
	const { data: session } = useSession();

	return (
		<>
			Signed in as {session?.user?.name} <br />
			Your email address is {session?.user?.email} <br />
			<div>Access Token: {session?.accessToken || ''}</div>
			<div>User Id: {session?.id}</div>
			<div>Provider: {session?.provider}</div>
		</>
	);
};

export default Dashboard;

Dashboard.getLayout = (page) => {
	return <AuthedLayout>{page}</AuthedLayout>;
};
