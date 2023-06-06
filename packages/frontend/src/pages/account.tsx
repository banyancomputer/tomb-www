import { Button, useDisclosure } from '@chakra-ui/react';
import { NextPageWithLayout } from '@/pages/page';
import AuthedLayout from '@/components/layouts/authed/AuthedLayout';
import { auth, db, firestore } from '@/lib/firebase';
import AccessKey from '@/lib/entities/accessKey'
import AuthorizedRoute from '@/components/utils/routes/Authorized';
import { useEffect, useState } from 'react';
import LoadingScreen from '@/components/utils/screens/LoadingScreen';
import { useAuth } from '@/contexts/auth';
import KeyCard from '@/components/cards/key/KeyCard';
import ChangeModal from '@/components/modals/ChangeModal';
import useIsMobile from '@/components/utils/device/useIsMobile';
import AccountInfoCard from '@/components/cards/account/AccountInfoCard';
import { AddIcon } from '@chakra-ui/icons';

const Account: NextPageWithLayout = ({}) => {
  const { user } = useAuth();
  const [keys, setKeys] = useState<AccessKey[]>([]);
  // const [newEmail, setNewEmail] = useState<string>('');
  const [error, setError] = useState<string>('');
  // const { isOpen, onOpen, onClose } = useDisclosure();
  const [isMobile] = useIsMobile();

  useEffect(() => {
    if (user) {
      firestore.getKeys(user.id).then((keys) => {
        setKeys(keys);
      });
    }
  }, [user]);

  const handleNewKey = () => {
    if (user) {
      firestore.createKey(user.id).then((key) => {
        setKeys(keys => [...keys, key]);
      }
      )
    }
  }

  if (!keys) {
    return <LoadingScreen />;
  }

  // const handleNewEmail = () => {
  //   if (user) {
  //     auth
  //       .updateEmail(newEmail)
  //       .then(() => {
  //         console.log('Updated email in auth');
  //         db.updateUserEmail(user.uid, newEmail)
  //           .then(() => {
  //             console.log('Updated email in db');
  //             // Copy User Data
  //             const newUserData = { ...userData };
  //             // Update email
  //             newUserData.email = newEmail;
  //             // Set new user data
  //             setUserData(newUserData);
  //             onClose();
  //           })
  //           .catch((err) => {
  //             console.log(err);
  //             setError(err.message);
  //           });
  //       })
  //       .catch((err) => {
  //         console.log(err);
  //         setError(err.message);
  //       });
  //   }
  // };

  // TODO: Add button to create a new key
  return (
    <>
      <AuthorizedRoute>
        {isMobile ? (
          <>
            <div className="flex flex-col gap-2 p-6">
              <h1 className="text-xl">Profile</h1>
              <div className="flex flex-col">
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
                <h2 className="text-xl">Keys</h2>
                {keys.map((key, i) => (
                  <KeyCard
                    id={key.id}
                    value={key.data.value}
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
        ) : (
          <>
            <div className="flex flex-col gap-2 p-6">
              <h1 className="text-xl">Profile</h1>
              <div className="flex flex-col">
                <AccountInfoCard
                  uid={user?.id || ''}
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
                    id={key.id}
                    value={key.data.value}
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
        )}
      </AuthorizedRoute>
    </>
  );
};

export default Account;

Account.getLayout = (page) => {
  return <AuthedLayout>{page}</AuthedLayout>;
};
