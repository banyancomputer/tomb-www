import IDB from '../idb';
import config from '../config';
import utils from '../utils';
import KeyStoreBase from '../keystore/base';
import { KeyStore, Config, CryptoSystem } from '../types';
import keys from './keys';
import operations from './operations';

export class TombKeyStore extends KeyStoreBase implements KeyStore {
	static async init(maybeCfg?: Partial<Config>): Promise<TombKeyStore> {
		const cfg = config.normalize({
			...(maybeCfg || {}),
			type: CryptoSystem.RSA,
		});
		const { storeName } = cfg;
		const store = IDB.createStore(storeName);
		return new TombKeyStore(cfg, store);
	}

	/* Key management interface */

	/**
	 * Generate a new asymm keypair and store it in IndexedDB
	 */
	async genKeyPair(): Promise<void> {
		await IDB.createIfDoesNotExist(
			this.cfg.keyPairName,
			() =>
				keys.makeKeypair(this.cfg.asymmAlg, this.cfg.rsaSize, this.cfg.hashAlg),
			this.store
		);
	}

	/**
	 * Import an asymm keypair and store it in IndexedDB
	 */
	async importKeyPair(
		publicKey: string,
		privateKey: string,
		cfg?: Partial<Config>
	): Promise<void> {
		const mergedCfg = config.merge(this.cfg, cfg);
		await IDB.createIfDoesNotExist(
			this.cfg.keyPairName,
			() =>
				keys.importKeyPair(
					publicKey,
					privateKey,
					mergedCfg.asymmAlg,
					mergedCfg.hashAlg
				),
			this.store
		);
	}

	/**
	 * Derive a new symm pass-key and store it in IndexedDB
	 */
	async derivePassKey(
		seedphrase: string,
		saltStr?: string,
		cfg?: Partial<Config>
	): Promise<string> {
		const mergedCfg = config.merge(this.cfg, cfg);
		const saltBuf = saltStr
			? utils.base64ToArrBuf(saltStr)
			: utils.randomSalt(mergedCfg.saltLen);
		await IDB.createIfDoesNotExist(
			this.cfg.passKeyName,
			() =>
				this.deriveSymmKey(
					this.cfg.passKeyName,
					seedphrase,
					saltBuf,
					mergedCfg
				),
			this.store
		);
		return saltStr ?? utils.arrBufToBase64(saltBuf);
	}

	/* Operations Interface */

	async encrypt(msg: string, cfg?: Partial<Config>): Promise<string> {
		const mergedCfg = config.merge(this.cfg, cfg);
		const keyPair = await this.keyPair();
		return utils.arrBufToBase64(
			await operations.encrypt(
				msg,
				keyPair.publicKey,
				mergedCfg.asymmAlg,
				mergedCfg.charSize
			)
		);
	}

	async decrypt(cipherText: string, cfg?: Partial<Config>): Promise<string> {
		const mergedCfg = config.merge(this.cfg, cfg);
		const keyPair = await this.keyPair();
		return utils.arrBufToStr(
			await operations.decrypt(
				cipherText,
				keyPair.privateKey,
				mergedCfg.asymmAlg
			),
			mergedCfg.charSize
		);
	}

	async encryptWithPassKey(
		msg: string,
		cfg?: Partial<Config>
	): Promise<string> {
		const mergedCfg = config.merge(this.cfg, cfg);
		return this.encryptWithSymmKey(msg, this.cfg.passKeyName, mergedCfg);
	}

	async decryptWithPassKey(
		cipherText: string,
		cfg?: Partial<Config>
	): Promise<string> {
		const mergedCfg = config.merge(this.cfg, cfg);
		return this.decryptWithSymmKey(cipherText, this.cfg.passKeyName, mergedCfg);
	}
}

export default TombKeyStore;
