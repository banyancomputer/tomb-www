import { NextPageWithLayout } from '@/pages/page';
import AuthedLayout from '@/layouts/authed/AuthedLayout';
import AuthorizedRoute from '@/components/utils/routes/Authorized';
import { useEffect, useState } from 'react';
import LoadingScreen from '@/components/utils/screens/LoadingScreen';
import { useAuth } from '@/contexts/session';
import KeyCard from '@/components/cards/key/KeyCard';
import AccountInfoCard from '@/components/cards/account/AccountInfoCard';
import * as userDb from '@/lib/db/user';

const Account: NextPageWithLayout = ({}) => {
  const { user } = useAuth();
  const [keys, setKeys] = useState<string[]>([]);
  const [error, setError] = useState<string>('');
  // const { isOpen, onOpen, onClose } = useDisclosure();
  // const [isMobile] = useIsMobile();

  useEffect(() => {
    if (user) {
      setKeys([user.data?.pubkey_fingerprint || ''])
    }
  }, [user]);

  // TODO: Add button to create a new key
  return (
    <>
      <div className="flex flex-col gap-2 p-6">
        <h1 className="text-xl">Profile</h1>
        <div className="flex flex-col">
          <AccountInfoCard
            uid={user?.firebaseUser.uid || ''}
          />
          <div className='flex'>                
          <h2 className="text-xl">Pub Key</h2>
            </div>
          {keys.map((key, i) => (
            <KeyCard
              id={key}
              value={"derp"}
              key={i}
            />
          ))}
        </div>
      </div>
    </>
  );
};

export default Account;

Account.getLayout = (page) => {
  return <AuthedLayout>{page}</AuthedLayout>;
};
