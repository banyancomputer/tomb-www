// import keys from './keys.js'
// import utils, { normalizeBase64ToBuf, normalizeUnicodeToBuf } from '../utils.js'
// import { DEFAULT_CHAR_SIZE, DEFAULT_HASH_ALG, RSA_EXCHANGE_ALG, RSA_WRITE_ALG, SALT_LENGTH } from '../constants.js'
// import { CharSize, HashAlg, KeyUse, Msg, PrivateKey, PublicKey } from '../types.js'
// import { webcrypto } from 'one-webcrypto'
// import aes from '../aes/index'
import keys from './keys'
import utils, { normalizeBase64ToBuf, normalizeUnicodeToBuf } from '../utils'
// import { DEFAULT_CHAR_SIZE, DEFAULT_ECC_CURVE, DEFAULT_HASH_ALG, ECC_EXCHANGE_ALG, ECC_WRITE_ALG, DEFAULT_SYMM_ALG, DEFAULT_SYMM_LEN } from '../constants'
// import { CharSize, EccCurve, Msg, PrivateKey, PublicKey, HashAlg, KeyUse, SymmKey, SymmKeyOpts } from '../types'
import { DEFAULT_CHAR_SIZE, DEFAULT_HASH_ALG, RSA_KEY_PAIR_ALG, SALT_LENGTH } from '../constants'
import { CharSize, Msg, PrivateKey, PublicKey,  SymmKey, SymmKeyOpts, HashAlg } from '../types'
import { webcrypto } from 'one-webcrypto'


// export async function sign(
//   msg: Msg,
//   privateKey: PrivateKey,
//   charSize: CharSize = DEFAULT_CHAR_SIZE
// ): Promise<ArrayBuffer> {
//   return webcrypto.subtle.sign(
//     { name: RSA_WRITE_ALG, saltLength: SALT_LENGTH },
//     privateKey,
//     normalizeUnicodeToBuf(msg, charSize)
//   )
// }

// export async function verify(
//   msg: Msg,
//   sig: Msg,
//   publicKey: string | PublicKey,
//   charSize: CharSize = DEFAULT_CHAR_SIZE,
//   hashAlg: HashAlg = DEFAULT_HASH_ALG
// ): Promise<boolean> {
//   return webcrypto.subtle.verify(
//     { name: RSA_WRITE_ALG, saltLength: SALT_LENGTH },
//     typeof publicKey === "string"
//       ? await keys.importPublicKey(publicKey, hashAlg, KeyUse.Write)
//       : publicKey,
//     normalizeBase64ToBuf(sig),
//     normalizeUnicodeToBuf(msg, charSize)
//   )
// }

export async function encrypt(
  msg: Msg,
  publicKey: string | PublicKey,
  charSize: CharSize = DEFAULT_CHAR_SIZE,
  hashAlg: HashAlg = DEFAULT_HASH_ALG
): Promise<ArrayBuffer> {
  return webcrypto.subtle.encrypt(
    { name: RSA_KEY_PAIR_ALG },
    typeof publicKey === "string"
      ? await keys.importPublicKey(publicKey, hashAlg) // , KeyUse.Exchange)
      : publicKey,
    normalizeUnicodeToBuf(msg, charSize)
  )
}

export async function decrypt(
  msg: Msg,
  privateKey: PrivateKey
): Promise<ArrayBuffer> {
  const normalized = normalizeBase64ToBuf(msg)
  return webcrypto.subtle.decrypt(
    { name: RSA_KEY_PAIR_ALG },
    privateKey,
    normalized
  )
}

// Note: use SPKI for public key format
export async function getPublicKey(key: CryptoKeyPair): Promise<string> {
  const spki = await webcrypto.subtle.exportKey('spki', key.publicKey as PublicKey)
  return utils.arrBufToBase64(spki)
}

// Note: use PKCS8 for private key format
export async function getPrivateKey(key: CryptoKeyPair): Promise<string> {
  const key_str = await webcrypto.subtle.exportKey("pkcs8", key.privateKey as PrivateKey)
  return utils.arrBufToBase64(key_str)
}

export default {
  // sign,
  // verify,
  encrypt,
  decrypt,
  getPublicKey,
  getPrivateKey
}
