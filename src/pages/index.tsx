import { NextPageWithLayout } from '@/pages/page';
import AuthedLayout from '@/layouts/authed/AuthedLayout';
// import { getBuckets, createBucket, removeBucket } from '@/lib/db/firestore';
import { useEffect, useState } from 'react';
import DataTable from 'react-data-table-component';
import { AddIcon, SearchIcon } from '@chakra-ui/icons';
import {
	Button,
	Input,
	InputGroup,
	InputLeftElement,
	useDisclosure,
} from '@chakra-ui/react';
import AuthorizedRoute from '@/components/utils/routes/Authorized';
import NoUploadScreen from '@/components/utils/screens/NoUploadScreen';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/auth';
import ChangeModal from '@/components/modals/input/InputModal';
import { useSession, signIn, signOut } from 'next-auth/react';

export interface IDashboard {}

const customStyles = {
	headRow: {
		style: {
			borderTopWidth: '2px',
			borderTopColor: '#000',
			borderTopStyle: 'solid',
			borderBottomWidth: '2px',
			borderBottomColor: '#000',
			borderBottomStyle: 'solid',
			fontWeight: 700,
		},
	},
};

const Dashboard: NextPageWithLayout<IDashboard> = () => {
	// @ts-ignore
	const { accessToken, data: session } = useSession();
	const [data, setData] = useState<string>('');

	useEffect(() => {
		if (session) {
			fetch('/api/restricted')
				.then((res) => {
					console.log(res);
					if (res.ok) return res.json();
					throw new Error('Unauthorized');
				})
				.then((data) => {
					setData(
						JSON.stringify(data, null, 2)
					)
				});
		}
	}, [session]);

	if (session) {
		return (
			<>
				Signed in as {session.user?.email} <br />
				<div>Access Token: {accessToken || ''}</div>
				<button onClick={() => signOut()}>Sign out</button>
				<div>{data}</div>
			</>
		);
	}
	return (
		<>
			Not signed in <br />
			<button onClick={() => signIn()}>Sign in</button>
		</>
	);
	// const router = useRouter();
	// const { isOpen, onOpen, onClose } = useDisclosure();
	// const { user } = useAuth();
	// const [error, setError] = useState<string>('');
	// const [buckets, setBuckets] = useState<Bucket[]>([]);
	// const [newBucketId, setNewBucketId] = useState<string>('');
	// const [searchQuery, setSearchQuery] = useState<string>('');

	// useEffect(() => {
	// 	if (!user) {
	// 		router.push('/login');
	// 	}
	// }, [user]);

	// const handleNewBucket = async () => {
	// 	if (user) {
	// 		console.log('new bucket: ' + newBucketId);
	// 		// createBucket(user.uid, newBucketId)
	// 		//   .then((bucket: Bucket) => {
	// 		//     console.log('Created new bucket');
	// 		//     buckets.push(bucket);
	// 		//     setNewBucketId('');
	// 		//     onClose();
	// 		//   })
	// 		//   .catch((err) => {
	// 		//     console.log(err);
	// 		//     setError(err.message);
	// 		//   }
	// 		// );
	// 	}
	// };

	// const overviewColumns = [
	// 	{
	// 		name: 'BUCKET NAME',
	// 		selector: (row: Bucket) => row.id,
	// 		sortable: true,
	// 	},
	// ];

	// const handleRemoveBucket = async (bucketId: string) => {
	// 	if (user) {
	// 		// removeBucket(bucketId)
	// 		//   .then(() => {
	// 		//     console.log('Deleted bucket');
	// 		//     setBuckets(buckets.filter((bucket) => bucket.id !== bucketId));
	// 		//   }
	// 		// );
	// 	}
	// };

	// const ExpandedComponentOverView = ({ data }: any) => (
	// 	<div className="flex flex-row text-white">
	// 		{/* <button
	//     className="w-full bg-[#0398fc]"
	//     onClick={() => {
	//       console.log("huh")
	//       router.push('/blocks/' + data.id)
	//     }}
	//   >
	//     Open Block View
	//   </button> */}
	// 		{/* <button
	//     className="w-full bg-[#16181B]"
	//     onClick={() => router.push('/files/' + data.id)}
	//   >
	//     Open File View
	//   </button> */}
	// 		<button
	// 			className="w-full bg-[#CB3535] "
	// 			onClick={async () => handleRemoveBucket(data.id)}
	// 		>
	// 			Delete Bucket
	// 		</button>
	// 	</div>
	// );

	// const applyFilters = () => {
	// 	let filtered = buckets;

	// 	// if (statusFilter.length > 0) {
	// 	//   filtered = filtered.filter((item) => statusFilter.includes(item.status));
	// 	// }

	// 	if (searchQuery !== '') {
	// 		const query = searchQuery.toLowerCase().trim();
	// 		filtered = filtered.filter((item) =>
	// 			item.id.toLowerCase().includes(query)
	// 		);
	// 		console.log('search');
	// 	}
	// 	return filtered;
	// };

	// return (
	// 	<div className="overflow-auto">
	// 		{/* <AuthorizedRoute> */}

	// 		<div className="border-t-2 border-t-[#000] pb-44">
	// 			<div className="flex mt-4">
	// 				{/* <Button
	// 					leftIcon={<AddIcon />}
	// 					colorScheme="blue"
	// 					variant="solid"
	// 					ml={4}
	// 					w={40}
	// 					onClick={onOpen}
	// 				>
	// 					New Bucket
	// 					<ChangeModal
	// 						isOpen={isOpen}
	// 						onClose={onClose}
	// 						changeName="Create a new Bucket"
	// 						onInputChange={(e: any) => {
	// 							// console.log(e.target.value);
	// 							setNewBucketId(e.target.value);
	// 						}}
	// 						inputId="bucketId"
	// 						inputPlaceholder="New Bucket"
	// 						error={error}
	// 						onClickCancel={() => {
	// 							onClose();
	// 							setError('');
	// 							setNewBucketId('');
	// 						}}
	// 						onClickSave={async () => {
	// 							await handleNewBucket();
	// 							// console.log('save');
	// 						}}
	// 					/>
	// 				</Button> */}
	// 				<div className="flex gap-4 ml-auto">
	// 					<InputGroup>
	// 						<InputLeftElement pointerEvents="none">
	// 							<SearchIcon color="gray.400" />
	// 						</InputLeftElement>
	// 						<Input
	// 							htmlSize={40}
	// 							width="auto"
	// 							type="search"
	// 							placeholder="Search"
	// 							bgColor="white"
	// 							value={searchQuery}
	// 							onChange={(e) => setSearchQuery(e.target.value)}
	// 						/>
	// 					</InputGroup>
	// 				</div>
	// 			</div>
	// 		</div>
	// 		<DataTable
	// 			columns={overviewColumns}
	// 			data={applyFilters()}
	// 			customStyles={customStyles}
	// 			expandableRows
	// 			expandableRowsComponent={ExpandedComponentOverView}
	// 		/>
	// 		{/* </AuthorizedRoute> */}
	// 	</div>
	// );
};

export default Dashboard;

Dashboard.getLayout = (page) => {
	return <AuthedLayout>{page}</AuthedLayout>;
};
