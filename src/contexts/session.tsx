import { createContext, useState, useEffect, useContext } from 'react';
import { Auth } from '../config/firebase';
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  User as FirebaseUser
} from 'firebase/auth';
import User, { UserData } from '@/lib/entities/user';
import PubKey, { PubKeyData } from '@/lib/entities/pubkey';
import * as userDb from '@/lib/db/user';
import * as pubkeyDb from '@/lib/db/pubkey';
import KeyStore, { clear as clearKeyStore } from '@/lib/crypto/keystore';
import { exists as keystoreExists } from '@/lib/crypto/idb';
import { fingerprint } from '@/lib/crypto/utils';

const KEY_STORE_NAME = 'key-store'

export const SessionContext = createContext<{
  // TODO: Replace with User type
  user: User | null;
  signUp: (email: string, password: string) => Promise<void>;
  logIn: (email: string, password: string) => Promise<void>;
  logOut: () => Promise<void>;
}>({
  user: null,
  signUp: async (email: string, password: string) => {},
  logIn: async (email: string, password: string) => {},
  logOut: async () => {},
});

export const SessionProvider = ({ children }: any) => {
  const [user, setUser] = useState<User | null>(null);
  const [ keystore, setKeystore ] = useState<KeyStore | null>(null)
  const [ error, setError ] = useState<string>('')

  /* Helpers */ 

  // Initialize a keystore pointed by the user's uid
  const getKeystore = async (uid: string) => {
    const storeName = KEY_STORE_NAME + '-' + uid
    if (await keystoreExists(storeName)) {
      return keystore;
    }
    const ks = await KeyStore.init({ storeName })
    setKeystore(ks);
    return ks;
  }

  // Register a new user in firestore
  const registerUser = async (firebaseUser: FirebaseUser, passphrase: string): Promise<void> => {
    // Get the uid of the new user
    const owner = firebaseUser.uid;
    // Get the keystore for the user from the browser
    const ks = await getKeystore(owner);

    // TODO: Get rid of this if statement -- i'm p sure this is always defined
    if (ks) {
      // Generate a new keypair for the user 
      await ks.makeKeyPair();

      // Export the public key -- it's a pkcs8 format
      const { publicKey, encPrivateKey } = await ks.exportEncryptedKeyPair(passphrase);
      // Assoicate the public key in the db with the user
      const pubkey_data = { 
        spki: publicKey,
        owner 
      } as PubKeyData;
      const id = fingerprint(publicKey);
      await pubkeyDb.create(id, pubkey_data)

      // Create the user in the db with a reference to the pubkey and the encrypted private key
      const user_data = { pubkey_fingerprint: id, enc_privkey: encPrivateKey } as UserData;
      await userDb.create(firebaseUser, user_data);
    }
  }

  const initUserSession = async (firebaseUser: FirebaseUser, passphrase?: string) => {
    console.log('initUserSession')
    // Get the keystore for the user from the browser
    const ks = await getKeystore(firebaseUser.uid)
    // TODO: Get rid of this if statement -- i'm p sure this is always defined
    if (ks) {
      const user = await userDb.read(firebaseUser);
      setUser(user);
      if (user && passphrase) {
        // Get the user from the db
        const { pubkey_fingerprint, enc_privkey } = user.data;
        // Get the public key from the db
        const pubkey = await pubkeyDb.read(pubkey_fingerprint);
        // Import the keypair into the keystore if it's not already there
        await ks.importEncryptedKeyPair(pubkey.data.spki, enc_privkey, passphrase);
      }
      // Test the keypair and raise an error if it's not valid
      const msg = 'hello world';
      const ciphertext = await ks.encrypt(msg);
      const plaintext = await ks.decrypt(ciphertext);
      if (plaintext !== msg) {
        throw new Error('Keystore is invalid');
      }
      console.log('Keystore is valid')
    }
  }

  const destroyKeystore = async (uid: string) => {
    const ks = await getKeystore(uid)
    if (ks) {
      await ks.destroy();
      await clearKeyStore();
    }
  }

  /* Effects */

  // Update the user state when the auth state changes
  useEffect(() => {
    const unsubscribe = Auth.onAuthStateChanged(async (firebaseUser) => {
      try {
        if (firebaseUser) {
          await initUserSession(firebaseUser);
        } else {
          setUser(null);
        }
      } catch (error: any) {
        setError(error)
      }
    });
    return unsubscribe;
  }, []);

  // Set an error alert when an error occurs
  useEffect(() => {
    if (error) {
      // alert(error)
      console.error(error)
    }
  }, [error]);

  const signUp = async (email: string, password: string): Promise<void> => {
    createUserWithEmailAndPassword(Auth, email, password).then(async (userCredential) => {
      await registerUser(userCredential.user, password)
    }).catch((error) => {
      setError(error.message)
    });
  };

  const logIn = async (email: string, password: string): Promise<void> => {
    signInWithEmailAndPassword(Auth, email, password).then(async (userCredential) => {
      await initUserSession(userCredential.user, password);
    }).catch((error) => {
      setError(error.message)
    });
  };

  const logOut = async (): Promise<void> => {
    signOut(Auth).then(async () => {
      const uid = user?.firebaseUser.uid
      if (uid) {
        await destroyKeystore(uid)
      }
    });
  };

  return (
    // @ts-ignore
    <SessionContext.Provider value={{ user, signUp, logIn, logOut }}>
      {children}
    </SessionContext.Provider>
  );
};

export const useAuth = () => useContext(SessionContext);
