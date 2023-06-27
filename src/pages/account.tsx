import { NextPageWithLayout } from '@/pages/page';
import AuthedLayout from '@/layouts/authed/AuthedLayout';
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/auth';
import AccountInfoCard from '@/components/cards/account/AccountInfoCard';
import { useRouter } from 'next/router';
import { useTomb } from '@/contexts/tomb';
import InputModal from '@/components/modals/input/InputModal';
import { useDisclosure } from '@chakra-ui/react';

const Account: NextPageWithLayout = ({}) => {
	const { user } = useAuth();
	const { keystore, userIsRegistered, initializeKeystore, keystoreInitialized } = useTomb();
	const router = useRouter();
	const [error, setError] = useState<string>('');
	const { isOpen, onOpen, onClose } = useDisclosure();
	const [passkey, setPasskey] = useState<string>('');

	useEffect(() => {
		if (!user) {
			router.push('/login');
		}
	}, [user]);

	useEffect(() => {
		if (!keystoreInitialized) {
			onOpen();
		}
		if (keystoreInitialized) {
			onClose();
		}
	}, [keystoreInitialized]);

	const handlePasskey = () => {
		console.log('Initializing keystore with passkey: ' + passkey);
		if (!user) {
			console.error('App: User not logged in');
			setError('User not logged in');
			return;
		}
		initializeKeystore(user, passkey)
			.then(() => {
				console.log('App: Keystore initialized with passkey: ' + passkey);
			})
			.catch((err) => setError(err.message));
	};

	// TODO: Add button to create a new key
	return (
		<>
			<div className="flex flex-col gap-2 p-6">
				<h1 className="text-xl">Profile</h1>
				<div className="flex flex-col">
				<InputModal
						isOpen={isOpen}
						title='Enter your passkey'
						error={error}
						description={
							userIsRegistered ?
								"Enter your passkey to recover your key pair"
								: "Derive a new key pair from your passkey -- don't forget it!"
						}
						onClose={onClose}
						onClickCancel={() => setError('You must enter a passkey')}
						onClickSave={handlePasskey}
						onInputChange={(e: any) => setPasskey(e.target.value)}
						inputId='passkey'
						inputPlaceholder='Passkey'
					/>
					<AccountInfoCard uid={user?.uid || ''} />
					<div className="flex">
						<h2 className="text-xl">Pub Key Fingerprint</h2>
						{keystore ? (
							<div className="flex flex-col gap-2">
								<p> Your keystore is initialized! </p>
							</div>
						) : (
							<p>
								Your keystore is not initialized. Please enter your passkey to
							</p>
						)}
					</div>
				</div>
			</div>
		</>
	);
};

export default Account;

Account.getLayout = (page) => {
	return <AuthedLayout>{page}</AuthedLayout>;
};
