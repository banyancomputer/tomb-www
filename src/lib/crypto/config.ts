import {
	DEFAULT_CRYPTOSYSTEM,
	DEFAULT_RSA_SIZE,
	DEFAULT_PRIV_KEY_FORMAT,
	DEFAULT_PUB_KEY_FORMAT,
	DEFAULT_SYMM_ALG,
	DEFAULT_SYMM_LEN,
	DEFAULT_SALT_LENGTH,
	DEFAULT_SYMM_KEY_FORMAT,
	DEFAULT_HASH_ALG,
	DEFAULT_CHAR_SIZE,
	DEFAULT_STORE_NAME,
	DEFAULT_KEY_PAIR_NAME,
	DEFAULT_ASYMM_ALG,
	DEFAULT_PASS_KEY_NAME,
} from './constants';
import { Config, SymmKeyOpts } from './types';

export const defaultConfig = {
	type: DEFAULT_CRYPTOSYSTEM,
	asymmAlg: DEFAULT_ASYMM_ALG,
	rsaSize: DEFAULT_RSA_SIZE,
	privateKeyFormat: DEFAULT_PRIV_KEY_FORMAT,
	publicKeyFormat: DEFAULT_PUB_KEY_FORMAT,
	symmAlg: DEFAULT_SYMM_ALG,
	symmLen: DEFAULT_SYMM_LEN,
	saltLen: DEFAULT_SALT_LENGTH,
	symmKeyFormat: DEFAULT_SYMM_KEY_FORMAT,
	hashAlg: DEFAULT_HASH_ALG,
	charSize: DEFAULT_CHAR_SIZE,
	storeName: DEFAULT_STORE_NAME,
	keyPairName: DEFAULT_KEY_PAIR_NAME,
	passKeyName: DEFAULT_PASS_KEY_NAME,
} as Config;

export function normalize(maybeCfg?: Partial<Config>): Config {
	let cfg;
	if (!maybeCfg) {
		cfg = defaultConfig;
	} else {
		cfg = {
			...defaultConfig,
			...maybeCfg,
		};
	}
	return cfg;
}

export function merge(cfg: Config, overwrites: Partial<Config> = {}): Config {
	return {
		...cfg,
		...overwrites,
	};
}

export function symmKeyOpts(cfg: Config): Partial<SymmKeyOpts> {
	return { alg: cfg.symmAlg, length: cfg.symmLen };
}

export default {
	defaultConfig,
	normalize,
	merge,
	symmKeyOpts,
};
