import { NextPageWithLayout } from '@/pages/page';
import AuthedLayout from '@/layouts/authed/AuthedLayout';
import { useEffect, useState } from 'react';
import AccountInfoCard from '@/components/cards/account/AccountInfoCard';
import { useTomb } from '@/contexts/tomb';
import InputModal from '@/components/modals/input/InputModal';
import { Button, useDisclosure } from '@chakra-ui/react';
import KeyCard from '@/components/cards/key/KeyCard';
import { getServerSession } from 'next-auth';
import { authOptions } from './api/auth/[...nextauth]';
import { useSession } from 'next-auth/react';
import Router from 'next/router';

export async function getServerSideProps(context: any) {
	const session = await getServerSession(context.req, context.res, authOptions);
	if (!session) {
		return {
			redirect: {
				destination: '/login',
				permanent: false,
			},
		};
	}
	return {
		props: {} as IAccount,
	};
}

export interface IAccount {}

const Account: NextPageWithLayout = ({}) => {
	const { data: session } = useSession();
	const {
		isRegistered,
		initializeKeystore,
		keystoreInitialized,
		getFingerprint,
		purgeKeystore,
	} = useTomb();
	const { isOpen, onOpen, onClose } = useDisclosure();
	const [passkey, setPasskey] = useState<string>('');
	const [fingerprint, setFingerprint] = useState<string>('');
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (keystoreInitialized) {
			getFingerprint()
				.then((fingerprint) => setFingerprint(fingerprint))
				.catch((err) => setError(err.message));
		}
	}, [keystoreInitialized]);

	const handleInitializeKeystore = () => {
		console.log('Acccount: Initializing keystore with passkey');
		if (!session) {
			console.error('Acccount: User not logged in');
			setError('User not logged in');
			return;
		}
		initializeKeystore(session, passkey)
			.then(() => {
				console.log('Acccount: Keystore initialized');
				setError(null);
				onClose();
				Router.reload();
			})
			.catch((error: any) => {
				setError('Failed to initialize keystore: ' + error.message);
			});
	};

	const handlePurgeKeystore = () => {
		console.log('Acccount: Purging keystore');
		if (!session) {
			console.error('Acccount: User not logged in');
			setError('User not logged in');
			return;
		}
		purgeKeystore()
			.then(() => {
				console.log('Acccount: Keystore purged');
				setError(null);
				Router.reload();
			})
			.catch((_) => setError('Acccount: Failed to purge keystore'));
	};

	return (
		<>
			<div className="flex flex-col gap-2 p-6">
				<h1 className="text-xl">Profile</h1>
				<div className="flex flex-col">
					<AccountInfoCard uid={session?.id || ''} />

					{keystoreInitialized ? (
						<>
							<KeyCard id={fingerprint || ''} />
							<Button
								colorScheme="red"
								variant="solid"
								ml={4}
								w={40}
								onClick={handlePurgeKeystore}
							>
								Purge Keystore
							</Button>
						</>
					) : (
						<Button
							colorScheme="blue"
							variant="solid"
							ml={4}
							w={40}
							onClick={onOpen}
						>
							Initialize Keystore
							<InputModal
								isOpen={isOpen}
								title="Enter your passkey"
								error={error || ''}
								description={
									isRegistered
										? 'Enter your passkey to recover your key pair'
										: "Derive a new key pair from a passkey -- don't forget it!"
								}
								onClose={onClose}
								onClickCancel={onClose}
								onClickSave={handleInitializeKeystore}
								onInputChange={(e: any) => setPasskey(e.target.value)}
								inputId="passkey"
								inputPlaceholder="Passkey"
							/>
						</Button>
					)}
				</div>
			</div>
		</>
	);
};

export default Account;

Account.getLayout = (page) => {
	return <AuthedLayout>{page}</AuthedLayout>;
};
