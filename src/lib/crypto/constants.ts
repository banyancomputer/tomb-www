import { RsaSize, SymmAlg, SymmKeyLength, HashAlg, CharSize } from './types'

export const DEFAULT_CRYPTOSYSTEM = 'rsa'
export const DEFAULT_ASYMM_ALG = 'RSA-OAEP'
export const DEFAULT_RSA_SIZE = RsaSize.B3072

export const DEFAULT_SYMM_ALG = SymmAlg.AES_GCM
export const DEFAULT_SYMM_LEN = SymmKeyLength.B256
export const DEFAULT_SALT_LENGTH = 128

export const DEFAULT_HASH_ALG = HashAlg.SHA_256
export const DEFAULT_CHAR_SIZE = CharSize.B16

export const DEFAULT_STORE_NAME = 'keystore'
export const DEFAULT_KEY_PAIR_NAME = 'key-pair'
export const DEFAULT_PASS_KEY_NAME = 'pass-key'

export default {
  DEFAULT_CRYPTOSYSTEM,
  DEFAULT_ASYMM_ALG,
  DEFAULT_RSA_SIZE,
  DEFAULT_SYMM_ALG,
  DEFAULT_SYMM_LEN,
  DEFAULT_SALT_LENGTH,
  DEFAULT_HASH_ALG,
  DEFAULT_CHAR_SIZE,
  DEFAULT_STORE_NAME,
  DEFAULT_KEY_PAIR_NAME,
  DEFAULT_PASS_KEY_NAME
}