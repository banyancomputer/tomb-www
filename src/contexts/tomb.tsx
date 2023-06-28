import { createContext, useState, useEffect, useContext } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { PrivKeyData } from '@/lib/entities/privkey';
import { PubKeyData } from '@/lib/entities/pubkey';
import * as privkeyDb from '@/lib/db/privkey';
import * as pubkeyDb from '@/lib/db/pubkey';
import TombKeyStore from '@/lib/crypto/tomb/keystore';
import { useAuth } from '@/contexts/auth';

// TODO: Add in Tomb client from alex/eng-39-tomb-wasm-bindings branch
// TODO: Reincorporate changes to fingerprinting in fingerprint branch

const KEY_STORE_NAME_PREFIX = 'key-store';
const KEY_PAIR_NAME = 'key-pair';
const PASS_KEY_NAME = 'pass-key';

export const TombContext = createContext<{
	// A RSA keypair and passkey for the user
	keystore: TombKeyStore | null;
	// A Tomb client for the user
	// client: any | null;
	// Whether the user has an encrypted private key in the db
	isRegistered: boolean;
	// Whether the user's keystore has been initialized
	keystoreInitialized: boolean;

	// Initialize a keystore based on the user's passphrase
	initializeKeystore: (user: FirebaseUser, passkey: string) => Promise<void>;
	// Purge the keystore from storage
	purgeKeystore: () => Promise<void>;
	// Get the public key's fingerprint
	getFingerprint: () => Promise<string>;
}>({
	keystore: null,
	// client: null,
	isRegistered: false,
	keystoreInitialized: false,
	initializeKeystore: async (user: FirebaseUser, passkey: string) => {},
	purgeKeystore: async () => {},
	getFingerprint: async () => '',
});

export const TombProvider = ({ children }: any) => {
	const { user } = useAuth();
	const [keystore, setKeystore] = useState<TombKeyStore | null>(null);
	const [isRegistered, setIsRegistered] = useState<boolean>(false);
	const [keystoreInitialized, setKeystoreInitialized] =
		useState<boolean>(false);
	const [privkeyData, setPrivkeyData] = useState<PrivKeyData | null>(null);
	const [error, setError] = useState<string | null>(null);

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
			if (
				(await ks.keyExists(PASS_KEY_NAME)) &&
				(await ks.keyPairExists(KEY_PAIR_NAME))
			) {
				setKeystore(ks);
				setKeystoreInitialized(true);
			}
		};
		if (user) {
			init(user);
		}
	}, [user]);

	// Set the isRegistered state when the keystore is initialized
	useEffect(() => {
		const check = async (user: FirebaseUser) => {
			const { data } = await privkeyDb.read(user.uid);
			if (data) {
				setIsRegistered(true);
				setPrivkeyData(data);
			}
		};
		if (user) {
			check(user);
		}
	}, [user]);

	/* Methods */

	// Initialize a keystore based on the user's passphrase
	const initializeKeystore = async (
		user: FirebaseUser,
		passkey: string
	): Promise<void> => {
		if (privkeyData && !keystoreInitialized) {
			await initKeystore(user, privkeyData, passkey);
		} else {
			await registerUser(user, passkey);
		}
	};

	// Get the public key's fingerprint
	const getFingerprint = async (): Promise<string> => {
		if (!keystore) {
			throw new Error('Keystore not initialized');
		}
		return await keystore.fingerprintPublicKey(); 
	};

	// Purge the keystore from storage
	const purgeKeystore = async (): Promise<void> => {
		if (!keystore) {
			throw new Error('Keystore not initialized');
		}
		await keystore.clear();
		setKeystore(null);
		setIsRegistered(false);
		setKeystoreInitialized(false);
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
		const pubkey_fingerprint: string = await ks.fingerprintPublicKey();
		await pubkeyDb.create(pubkey_fingerprint, pubkey_data);
		// Create the user in the db with a reference to the pubkey and the encrypted private key
		const privkey_data: PrivKeyData = {
			pubkey_fingerprint,
			enc_privkey_pkcs8,
			passkey_salt,
		};
		await privkeyDb.create(owner, privkey_data);
	};

	const initKeystore = async (
		firebaseUser: FirebaseUser,
		privkeyData: PrivKeyData,
		passphrase: string
	) => {
		// Get the keystore by the user's uid 
		const ks = await getKeystore(firebaseUser.uid);

		// Check if the user's keystore is already initialized
		if (
			(await ks.keyExists(PASS_KEY_NAME)) &&
			(await ks.keyPairExists(KEY_PAIR_NAME))
		) {
			return;
		}

		// Read the user's encrypted private key and salt and derive the passkey
		const { pubkey_fingerprint, enc_privkey_pkcs8, passkey_salt } = privkeyData;
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
		<TombContext.Provider
			value={{
				keystore,
				isRegistered,
				keystoreInitialized,
				initializeKeystore,
				getFingerprint,
				purgeKeystore,
			}}
		>
			{children}
		</TombContext.Provider>
	);
};

export const useTomb = () => useContext(TombContext);
