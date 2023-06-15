import { NextPageWithLayout } from '@/pages/page';
import AuthedLayout from '@/layouts/authed/AuthedLayout';
import { getKeys } from '@/lib/db/firestore';
import AccessKey from '@/lib/entities/accessKey'
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
  // const [newEmail, setNewEmail] = useState<string>('');
  const [error, setError] = useState<string>('');
  // const { isOpen, onOpen, onClose } = useDisclosure();
  // const [isMobile] = useIsMobile();

  useEffect(() => {
    if (user) {
      setKeys([])
      // userDb.read(user.uid).then((u) => {
      //   setKeys([u.data?.pubkey || ''])
      // })


      // getKeys(user.uid).then((keys) => {
      //   setKeys(keys);
      // });
    }
  }, [user]);

  // const handleNewKey = () => {
  //   if (user) {
  //     firestore.createKey(user.uid).then((key) => {
  //       setKeys(keys => [...keys, key]);
  //     }
  //     )
  //   }
  // }

  // if (!keys) {
  //   return <LoadingScreen />;
  // }

  // TODO: Add button to create a new key
  return (
    <>
            <div className="flex flex-col gap-2 p-6">
              <h1 className="text-xl">Profile</h1>
              <div className="flex flex-col">
                <AccountInfoCard
                  uid={user?.firebaseUser.uid || ''}
                />

                {/* <div
                  className="border-t-2 border-t-black border-b-2 border-b-black pt-2 pb-2 flex cursor-pointer"
                  onClick={onOpen}
                >
                  E-mail
                  <div className="ml-4 text-slate-600">{userData.email}</div>
                  <ChangeModal
                    isOpen={isOpen}
                    onClose={onClose}
                    changeName="Change e-mail"
                    onChangeValue={(e: any) => {
                      setNewEmail(e.target.value);
                    }}
                    changeInputId="email"
                    changeInputPlaceholder="New E-mail"
                    error={error}
                    onClickCancel={() => {
                      onClose();
                      setError('');
                    }}
                    onClickSave={() => {
                      handleNewEmail();
                    }}
                  />
                </div> */}
                <div className='flex'>                
                <h2 className="text-xl">Keys</h2>
                {/* <Button className='flex'
                    leftIcon={<AddIcon />}
                    colorScheme="blue"
                    variant="solid"
                    ml={4}
                    w={40}
                    onClick={handleNewKey}
                  >
                    New Key
                  </Button> */}
                  </div>
                {keys.map((key, i) => (
                  <KeyCard
                    id={key}
                    value={"derp"}
                    key={i}
                  />
                ))}
              </div>
              {/* <ThemePreferences /> */}
              {/*<div className="flex flex-col gap-2 p-6">*/}
              {/*  <h1 className="text-xl">Security</h1>*/}
              {/*  /!*@ts-ignore*!/*/}
              {/*  <Accordion allowMultiple p={0} className="border-b border-b-black">*/}
              {/*    <AccordionItem>*/}
              {/*      <h2>*/}
              {/*        /!* TODO: Change password *!/*/}
              {/*        <AccordionButton className="border-t-2 border-t-black">*/}
              {/*          <Box as="span" flex="1" textAlign="left">*/}
              {/*            Password*/}
              {/*          </Box>*/}
              {/*          <AccordionIcon />*/}
              {/*        </AccordionButton>*/}
              {/*      </h2>*/}
              {/*    </AccordionItem>*/}
              {/*  </Accordion>*/}
              {/*  /!* TODO: Add terminate all sessions*!/*/}
              {/*  <Button colorScheme="red" variant="outline" bgColor="#CB35351A">*/}
              {/*    Terminate all other sessions*/}
              {/*  </Button>*/}
              {/*</div>*/}
            </div>
          </>
  );
};

export default Account;

Account.getLayout = (page) => {
  return <AuthedLayout>{page}</AuthedLayout>;
};
