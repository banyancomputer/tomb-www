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
import TombKeyStore from '@/lib/crypto/tomb/keystore';
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
  const [ keystore, setKeystore ] = useState<TombKeyStore | null>(null)
  const [ error, setError ] = useState<string>('')

  /* Helpers */ 

  // Initialize a keystore pointed by the user's uid
  const getKeystore = async (uid: string) => {
    const storeName = KEY_STORE_NAME + '-' + uid
    if (keystore) {
      return keystore;
    }
    // Defaults are fine here
    const ks = await TombKeyStore.init({ storeName })
    setKeystore(ks);
    return ks;
  }

  // Register a new user in firestore
  const registerUser = async (firebaseUser: FirebaseUser, passphrase: string): Promise<void> => {
    // Get the uid of the new user
    const owner: string = firebaseUser.uid;
    // Get the keystore for the user from the browser
    const ks = await getKeystore(owner);
    // Generate a new keypair for the user 
    await ks.genKeyPair();
    // Derive a new passkey for the user -- this generates a random salt
    const passkey_salt: string = await ks.derivePassKey(passphrase);
    const spki: string = await ks.exportPublicKey();
    const privkey_pkcs8: string = await ks.exportPrivateKey();
    const enc_privkey_pkcs8: string = await ks.encryptWithPassKey(privkey_pkcs8);
    // Assoicate the public key in the db with the user
    const pubkey_data: PubKeyData = { spki, owner };
    const pubkey_fingerprint: string = fingerprint(spki);
    await pubkeyDb.create(pubkey_fingerprint, pubkey_data)
    // Create the user in the db with a reference to the pubkey and the encrypted private key
    const user_data: UserData = {
      pubkey_fingerprint,
      enc_privkey_pkcs8,
      passkey_salt,
    };
    const user = await userDb.create(firebaseUser, user_data);
    setUser(user);
  }

  const initUserSession = async (firebaseUser: FirebaseUser, passphrase?: string) => {
    // Get the keystore and user
    const ks = await getKeystore(firebaseUser.uid)
    const user = await userDb.read(firebaseUser);
    setUser(user);
    if (user && passphrase) {
      // If we can import the private key, then do so.
      // Read the user's encrypted private key and salt and derive the passkey
      const { pubkey_fingerprint, enc_privkey_pkcs8, passkey_salt } = user.data;
      await ks.derivePassKey(passphrase, passkey_salt);
      // Read the user's public key, decrypt the priv key import the keypair into the keystore
      const pubkey = await pubkeyDb.read(pubkey_fingerprint);
      const pubkey_spki = pubkey.data.spki;
      const privkey_pkcs8 = await ks.decryptWithPassKey(enc_privkey_pkcs8);
      await ks.importKeyPair(pubkey_spki, privkey_pkcs8);
    }
    // Check that the keystore is valid
    const msg = 'hello world';
    const ciphertext = await ks.encrypt(msg);
    const plaintext = await ks.decrypt(ciphertext);
    if (plaintext !== msg) {
      throw new Error('Keystore is invalid');
    }
  }

  const clearKeystore = async (uid: string) => {
    const ks = await getKeystore(uid)
    await ks.clear();
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
        await clearKeystore(uid)
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
