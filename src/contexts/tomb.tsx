import { createContext, useState, useEffect, useContext } from 'react';
import { PrivKeyData } from '@/interfaces/privkey';
import { PubKeyData } from '@/interfaces/pubkey';
import * as privkeyDb from '@/lib/client/db/privkey';
import * as pubkeyDb from '@/lib/client/db/pubkey';
import ECCKeystore from 'banyan-webcrypto-experiment/ecc/keystore';
import { clear as clearIdb } from 'banyan-webcrypto-experiment/idb';
import { useSession } from 'next-auth/react';
import { Session } from 'next-auth';

// TODO: Add in Tomb client from alex/eng-39-tomb-wasm-bindings branch

const KEY_STORE_NAME_PREFIX = 'key-store';
const EXCHANGE_KEY_PAIR_NAME = 'exchange-key-pair';
const WRITE_KEY_PAIR_NAME = 'write-key-pair';
const ESCROW_KEY_NAME = 'escrow-key';

export const TombContext = createContext<{
	// External State

	// Whether the user has an encrypted private key in the db
	isRegistered: boolean;
	// Whether the user's keystore has been initialized
	keystoreInitialized: boolean;

	// External Methods

	// Initialize a keystore based on the user's passphrase
	initializeKeystore: (session: Session, passkey: string) => Promise<void>;
	// Purge the keystore from storage
	purgeKeystore: () => Promise<void>;
	// Get the public key's fingerprint
	getFingerprint: () => Promise<string>;
}>({
	isRegistered: false,
	keystoreInitialized: false,
	initializeKeystore: async (session: Session, passkey: string) => {},
	purgeKeystore: async () => {},
	getFingerprint: async () => '',
});

export const TombProvider = ({ children }: any) => {
	/* State */

	// Inherited State
	const { data: session } = useSession();

	// External State
	const [isRegistered, setIsRegistered] = useState<boolean>(false);
	const [keystoreInitialized, setKeystoreInitialized] =
		useState<boolean>(false);

	// Internal State
	const [keystore, setKeystore] = useState<ECCKeystore | null>(null);
	const [privkeyData, setPrivkeyData] = useState<PrivKeyData | null>(null);
	const [error, setError] = useState<string | null>(null);

	/* Effects */

	// Handle errors
	useEffect(() => {
		if (error) {
			console.error(error);
		}
	}, [error]);

	// Attempt to initialize the keystore when the session changes
	useEffect(() => {
		const init = async (session: Session) => {
			const ks = await getKeystore(session.id);
			if (
				(await ks.keyExists(ESCROW_KEY_NAME)) &&
				(await ks.keyPairExists(EXCHANGE_KEY_PAIR_NAME)) &&
				(await ks.keyPairExists(WRITE_KEY_PAIR_NAME))
			) {
				setKeystore(ks);
				setKeystoreInitialized(true);
			}
		};
		if (session) {
			init(session);
		}
	}, [session]);

	// Set the isRegistered state if the user has an encrypted private key in the db
	useEffect(() => {
		const check = async (session: Session) => {
			const { data } = await privkeyDb.read().catch((err) => {
				setError('Failed to read privkey data: ' + err.message);
				console.error(err);
				return { data: null };
			});
			if (data) {
				setIsRegistered(true);
				setPrivkeyData(data);
			}
		};
		if (session) {
			check(session);
		}
	}, [session]);

	/* Methods */

	// Initialize a keystore based on the user's passphrase
	const initializeKeystore = async (
		session: Session,
		passkey: string
	): Promise<void> => {
		console.log('Initializing keystore');
		if (privkeyData && !keystoreInitialized) {
			console.log('Initializing keystore with recovered privkey data');
			await initKeystore(session, privkeyData, passkey);
		} else {
			console.log('Registering user');
			await registerUser(session, passkey);
		}
	};

	// Get the ecdsa public key's fingerprint
	const getFingerprint = async (): Promise<string> => {
		if (!keystore) {
			throw new Error('Keystore not initialized');
		}
		return await keystore.fingerprintPublicWriteKey();
	};

	// Purge the keystore from storage
	const purgeKeystore = async (): Promise<void> => {
		if (!keystore) {
			throw new Error('Keystore not initialized');
		}
		await keystore.destroy();
		await clearIdb();
		setKeystore(null);
		setIsRegistered(false);
		setKeystoreInitialized(false);
	};

	/* Helpers */

	// Initialize a keystore pointed by the user's uid
	const getKeystore = async (uid: string) => {
		const storeName = KEY_STORE_NAME_PREFIX + '-' + uid;
		if (keystore) {
			return keystore;
		}
		// Defaults are fine here
		const ks = await ECCKeystore.init({ storeName });
		setKeystore(ks);
		return ks;
	};

	// Register a new user in firestore
	const registerUser = async (
		session: Session,
		passphrase: string
	): Promise<void> => {
		// Get the uid of the new user
		const owner: string = session.id;
		// Get the keystore for the user from the browser
		const ks = await getKeystore(owner);
		// Generate a new keypairs for the user
		await ks.genExchangeKeyPair();
		await ks.genWriteKeyPair();
		// Derive a new passkey for the user -- this generates a random salt
		const passkey_salt: string = await ks.deriveEscrowKey(passphrase);
		const wrapped_ecdh_key_pair = await ks.exportEscrowedExchangeKeyPair();
		const wrapped_ecdsa_key_pair = await ks.exportEscrowedWriteKeyPair();

		// Assoicate the public key in the db with the user
		const pubkey_data: PubKeyData = { 
			ecdh_spki: wrapped_ecdh_key_pair.publicKeyStr,
			ecdsa_spki: wrapped_ecdsa_key_pair.publicKeyStr,
			owner
		};

		const ecdsa_pubkey_fingerprint = await ks.fingerprintPublicWriteKey(); 

		await pubkeyDb.create(ecdsa_pubkey_fingerprint, pubkey_data);
		// Create the user in the db with a reference to the pubkey and the encrypted private key
		const privkey_data: PrivKeyData = {
			ecdsa_pubkey_fingerprint,
			wrapped_ecdsa_privkey_pkcs8: wrapped_ecdsa_key_pair.wrappedPrivateKeyStr,
			wrapped_ecdh_privkey_pkcs8: wrapped_ecdh_key_pair.wrappedPrivateKeyStr,
			passkey_salt,
		};
		await privkeyDb.create(privkey_data);
	};

	const initKeystore = async (
		session: Session,
		privkeyData: PrivKeyData,
		passphrase: string
	) => {
		// Get the keystore by the user's uid
		const ks = await getKeystore(session.id);

		// Check if the user's keystore is already initialized
		if (
			(await ks.keyExists(ESCROW_KEY_NAME)) &&
			(await ks.keyPairExists(EXCHANGE_KEY_PAIR_NAME)) &&
			(await ks.keyPairExists(WRITE_KEY_PAIR_NAME))
		) {
			return;
		}

		// Read the user's encrypted private key and salt and derive the passkey
		const { ecdsa_pubkey_fingerprint, wrapped_ecdsa_privkey_pkcs8, wrapped_ecdh_privkey_pkcs8, passkey_salt } = privkeyData;

		console.log(privkeyData);
		await ks.deriveEscrowKey(passphrase, passkey_salt);
		const pubkey = await pubkeyDb.read(ecdsa_pubkey_fingerprint);
		const { ecdsa_spki, ecdh_spki } = pubkey.data;

		// Import the keypair into the keystore
		await ks.importEscrowedWriteKeyPair(
			{
				publicKeyStr: ecdsa_spki,
				wrappedPrivateKeyStr: wrapped_ecdsa_privkey_pkcs8,
			}
		)
		await ks.importEscrowedExchangeKeyPair(
			{
				publicKeyStr: ecdh_spki,
				wrappedPrivateKeyStr: wrapped_ecdh_privkey_pkcs8,
			}
		)

		// Check that the keystore is valid
		const msg = 'hello world';
		
		const ciphertext = await ks.encrypt(msg, ecdh_spki, passkey_salt);
		const plaintext = await ks.decrypt(ciphertext, ecdh_spki, passkey_salt);
		if (plaintext !== msg) {
			setError('Keystore is invalid: ' + plaintext + ' != ' + msg);
			throw new Error('Keystore is invalid: ' + plaintext + ' != ' + msg);
		}
		const signature = await ks.sign(msg);
		const verified = await ks.verify(msg, signature, ecdsa_spki);
		if (!verified) {
			setError('Keystore is invalid (signature)');
			throw new Error('Keystore is invalid (signature)');
		}
	};

	return (
		<TombContext.Provider
			value={{
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
