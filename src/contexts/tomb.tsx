import { createContext, useState, useEffect, useContext, use } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { UserData } from '@/lib/entities/user';
import { PubKeyData } from '@/lib/entities/pubkey';
import * as userDb from '@/lib/db/user';
import * as pubkeyDb from '@/lib/db/pubkey';
import TombKeyStore from '@/lib/crypto/tomb/keystore';
import { useAuth } from '@/contexts/auth';

// TODO: Add in Tomb client from alex/eng-39-tomb-wasm-bindings branch
// TODO: Reincorporate changes to fingerprinting in fingerprint branch

const KEY_STORE_NAME_PREFIX = 'key-store';
const KEY_PAIR_NAME = 'key-pair';
const PASS_KEY_NAME = 'pass-key';


export const TombContext = createContext<{
	keystore : TombKeyStore | null;
	client: any | null;
	userIsRegistered: boolean;
	keystoreInitialized: boolean;
	initializeKeystore: (user: FirebaseUser, passkey: string) => Promise<void>;
}>({
	keystore: null,
	client: null,
	userIsRegistered: false,
	keystoreInitialized: false,
	initializeKeystore: async (user: FirebaseUser, passkey: string) => {},
});

export const TombProvider = ({ children }: any) => {
	const { user } = useAuth();
	const [client, setClient] = useState<any | null>(null);
	const [keystore, setKeystore] = useState<TombKeyStore | null>(null);
	const [userIsRegistered, setUserIsRegistered] = useState<boolean>(false);
	const [keystoreInitialized, setKeystoreInitialized] = useState<boolean>(false);

	const [error, setError] = useState<string>('');
	const [userData, setUserData] = useState<UserData | null>(null);

	/* Effects */

	// Handle errors
	useEffect(() => {
		if (error) {
			console.error(error);
		}
	}, [error]);

	// Attempt to initialize the keystore when the user is logged in
	useEffect(() => {
		const init = async (user: FirebaseUser) => {
			const ks = await getKeystore(user.uid);
			if (await ks.keyExists(PASS_KEY_NAME) && await ks.keyPairExists(KEY_PAIR_NAME)) {
				setKeystore(ks);
				setKeystoreInitialized(true);
			}
		}
		if (user) {
			init(user);
		}
	}, [user]);

	// Set the isRegistered state when the keystore is initialized
	useEffect(() => {
		const check = async (user: FirebaseUser) => {
			const { firebaseUser, data } = await userDb.read(user);
			if (data) {
				setUserIsRegistered(true);
				setUserData(data);
			}
		}
		if (user) {
			check(user);
		}
	}, [user]);

	/* Methods */

	// Initialize a keystore based on the user's passphrase
	const initializeKeystore = async (user: FirebaseUser, passkey: string): Promise<void> => {
		if (!user) {
			console.error('User not logged in');
			setError('User not logged in');
			return;
		}

		if (userData && !keystoreInitialized ) {
			await initKeystore(user, userData, passkey);
		} else {
			await registerUser(user, passkey);
		}
	};

	/* Helpers */

	// Initialize a keystore pointed by the user's uid
	const getKeystore = async (uid: string) => {
		const storeName = KEY_STORE_NAME_PREFIX + '-' + uid;
		const keyPairName = KEY_PAIR_NAME;
		const passKeyName = PASS_KEY_NAME;
		if (keystore) {
			return keystore;
		}
		// Defaults are fine here
		const ks = await TombKeyStore.init({ storeName, keyPairName, passKeyName });
		setKeystore(ks);
		return ks;
	};

	// Register a new user in firestore
	const registerUser = async (
		firebaseUser: FirebaseUser,
		passphrase: string
	): Promise<void> => {
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
		const enc_privkey_pkcs8: string = await ks.encryptWithPassKey(
			privkey_pkcs8
		);
		// Assoicate the public key in the db with the user
		const pubkey_data: PubKeyData = { spki, owner };
		const pubkey_fingerprint: string = fingerprint(spki);
		await pubkeyDb.create(pubkey_fingerprint, pubkey_data);
		// Create the user in the db with a reference to the pubkey and the encrypted private key
		const user_data: UserData = {
			pubkey_fingerprint,
			enc_privkey_pkcs8,
			passkey_salt,
		};
		await userDb.create(firebaseUser, user_data);
	};

	const initKeystore = async (
		firebaseUser: FirebaseUser,
		userData: UserData,
		passphrase: string
	) => {
		// Get the keystore and user
		const ks = await getKeystore(firebaseUser.uid);

		// Check if the user's keystore is already initialized
		if (await ks.keyExists(PASS_KEY_NAME) && await ks.keyPairExists(KEY_PAIR_NAME)) {
			return;
		}

		// Read the user's encrypted private key and salt and derive the passkey
		const { pubkey_fingerprint, enc_privkey_pkcs8, passkey_salt } = userData;
		await ks.derivePassKey(passphrase, passkey_salt);

		// Read the user's public key, decrypt the priv key import the keypair into the keystore
		const pubkey = await pubkeyDb.read(pubkey_fingerprint);
		const pubkey_spki = pubkey.data.spki;
		const privkey_pkcs8 = await ks.decryptWithPassKey(enc_privkey_pkcs8);
		await ks.importKeyPair(pubkey_spki, privkey_pkcs8);

		// Check that the keystore is valid
		const msg = 'hello world';
		const ciphertext = await ks.encrypt(msg);
		const plaintext = await ks.decrypt(ciphertext);
		if (plaintext !== msg) {
			setError('Keystore is invalid');
			throw new Error('Keystore is invalid');
		}
	};

	return (
		<TombContext.Provider value={{
			keystore,
			client,
			userIsRegistered,
			keystoreInitialized,
			initializeKeystore
		}}>
			{children}
		</TombContext.Provider>
	);
};

export const useTomb = () => useContext(TombContext);
