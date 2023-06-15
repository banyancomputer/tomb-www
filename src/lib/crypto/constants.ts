import { EccCurve, RsaSize, SymmAlg, SymmKeyLength, HashAlg, CharSize, ExportKeyFormat } from './types'
// import { EccCurve, SymmAlg, SymmKeyLength, HashAlg, CharSize } from './types'

export const ECC_KEY_PAIR_ALG = 'ECDSA'
// export const ECC_EXCHANGE_ALG = 'ECDH'
// export const ECC_WRITE_ALG = 'ECDSA'
// export const RSA_EXCHANGE_ALG = 'RSA-OAEP'
export const RSA_KEY_PAIR_ALG = 'RSA-OAEP'
// export const RSA_WRITE_ALG = 'RSASSA-PKCS1-v1_5'
export const SALT_LENGTH = 128

export const DEFAULT_EXPORT_KEY_FORMAT = ExportKeyFormat.PKCS8

export const DEFAULT_CRYPTOSYSTEM = 'rsa'
export const DEFAULT_ECC_CURVE = EccCurve.P_384
export const DEFAULT_RSA_SIZE = RsaSize.B3072

export const DEFAULT_SYMM_ALG = SymmAlg.AES_CTR
export const DEFAULT_SYMM_LEN = SymmKeyLength.B256
export const DEFAULT_CTR_LEN = 64

export const DEFAULT_HASH_ALG = HashAlg.SHA_256
export const DEFAULT_CHAR_SIZE = CharSize.B16

export const DEFAULT_STORE_NAME = 'keystore'
export const DEFAULT_KEY_PAIR_NAME = 'key-pair'
// export const DEFAULT_EXCHANGE_KEY_NAME = 'exchange-key'
// export const DEFAULT_WRITE_KEY_NAME = 'write-key'

export default {
  ECC_KEY_PAIR_ALG,
  // ECC_EXCHANGE_ALG,
  // ECC_WRITE_ALG,
  // RSA_EXCHANGE_ALG,
  RSA_KEY_PAIR_ALG,
  // RSA_WRITE_ALG,
  SALT_LENGTH,
  DEFAULT_CRYPTOSYSTEM,
  DEFAULT_ECC_CURVE,
  DEFAULT_RSA_SIZE,
  DEFAULT_EXPORT_KEY_FORMAT,
  DEFAULT_SYMM_ALG,
  DEFAULT_CTR_LEN,
  DEFAULT_HASH_ALG,
  DEFAULT_CHAR_SIZE,
  DEFAULT_STORE_NAME,
  DEFAULT_KEY_PAIR_NAME,
  // DEFAULT_EXCHANGE_KEY_NAME,
  // DEFAULT_WRITE_KEY_NAME,
}
