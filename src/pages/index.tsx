import { NextPageWithLayout } from '@/pages/page';
import AuthedLayout from '@/layouts/authed/AuthedLayout';
import { useSession } from 'next-auth/react';
import { getServerSession } from 'next-auth';
import { authOptions } from './api/auth/[...nextauth]';

export async function getServerSideProps(context: any) {
	// If the user has a session, serve the page
	// @ts-ignore
	const session = await getServerSession(context.req, context.res, authOptions);
	if (session) {
		return {
			// Just return empty props for now, eventually we'll pass more data
			props: { },
		};
  	}
	// If no session, redirect to login
	return {
		redirect: {
			destination: '/login',
			permanent: false,
		},
	};
}

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
