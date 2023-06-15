import aes from '../aes/index'
import keys from './keys'
import utils, { normalizeBase64ToBuf, normalizeUnicodeToBuf } from '../utils'
// import { DEFAULT_CHAR_SIZE, DEFAULT_ECC_CURVE, DEFAULT_HASH_ALG, ECC_EXCHANGE_ALG, ECC_WRITE_ALG, DEFAULT_SYMM_ALG, DEFAULT_SYMM_LEN } from '../constants'
// import { CharSize, EccCurve, Msg, PrivateKey, PublicKey, HashAlg, KeyUse, SymmKey, SymmKeyOpts } from '../types'
import { DEFAULT_CHAR_SIZE, DEFAULT_ECC_CURVE,  DEFAULT_SYMM_ALG, DEFAULT_SYMM_LEN, ECC_KEY_PAIR_ALG } from '../constants'
import { CharSize, EccCurve, Msg, PrivateKey, PublicKey,  SymmKey, SymmKeyOpts } from '../types'
import { webcrypto } from 'one-webcrypto'

// export async function sign(
//   msg: Msg,
//   privateKey: PrivateKey,
//   charSize: CharSize = DEFAULT_CHAR_SIZE,
//   hashAlg: HashAlg = DEFAULT_HASH_ALG,
// ): Promise<ArrayBuffer> {
//   return webcrypto.subtle.sign(
//     { name: ECC_WRITE_ALG, hash: { name: hashAlg }},
//     privateKey,
//     normalizeUnicodeToBuf(msg, charSize)
//   )
// }

// export async function verify(
//   msg: Msg,
//   sig: Msg,
//   publicKey: string | PublicKey,
//   charSize: CharSize = DEFAULT_CHAR_SIZE,
//   curve: EccCurve = DEFAULT_ECC_CURVE,
//   hashAlg: HashAlg = DEFAULT_HASH_ALG
// ): Promise<boolean> {
//   return webcrypto.subtle.verify(
//     { name: ECC_WRITE_ALG, hash: { name: hashAlg }},
//     typeof publicKey === "string"
//       ? await keys.importPublicKey(publicKey, curve, KeyUse.Write)
//       : publicKey,
//     normalizeBase64ToBuf(sig),
//     normalizeUnicodeToBuf(msg, charSize)
//   )
// }

// TODO: Why are they generating a shared key here?
// export async function encrypt(
//   msg: Msg,
//   privateKey: PrivateKey,
//   publicKey: string | PublicKey,
//   charSize: CharSize = DEFAULT_CHAR_SIZE,
//   curve: EccCurve = DEFAULT_ECC_CURVE,
//   opts?: Partial<SymmKeyOpts>
// ): Promise<ArrayBuffer> {
//   const importedPublicKey = typeof publicKey === "string"
//     ? await keys.importPublicKey(publicKey, curve) // , KeyUse.Exchange)
//     : publicKey

//   const cipherKey = await getSharedKey(privateKey, importedPublicKey, opts)
//   return aes.encryptBytes(normalizeUnicodeToBuf(msg, charSize), cipherKey, opts)
// }

// export async function decrypt(
//   msg: Msg,
//   privateKey: PrivateKey,
//   publicKey: string | PublicKey,
//   curve: EccCurve = DEFAULT_ECC_CURVE,
//   opts?: Partial<SymmKeyOpts>
// ): Promise<ArrayBuffer> {
//   const importedPublicKey = typeof publicKey === "string"
//     ? await keys.importPublicKey(publicKey, curve) // , KeyUse.Exchange)
//     : publicKey

//   const cipherKey = await getSharedKey(privateKey, importedPublicKey, opts)
//   return aes.decryptBytes(normalizeBase64ToBuf(msg), cipherKey, opts)
// }

/**
 * Encypt with a public key
 */
export async function encrypt(
  msg: Msg,
  publicKey: string | PublicKey,
  charSize: CharSize = DEFAULT_CHAR_SIZE,
  curve: EccCurve = DEFAULT_ECC_CURVE,
  opts?: Partial<SymmKeyOpts>
): Promise<ArrayBuffer> {
  const importedPublicKey = typeof publicKey === "string"
    ? await keys.importPublicKey(publicKey, curve) // , KeyUse.Exchange)
    : publicKey
  return aes.encryptBytes(normalizeUnicodeToBuf(msg, charSize), importedPublicKey, opts)
}

/**
 * Decrypt with a private key
 */
export async function decrypt(
  msg: Msg,
  privateKey: PrivateKey,
  opts?: Partial<SymmKeyOpts>
): Promise<ArrayBuffer> {
  return aes.decryptBytes(normalizeBase64ToBuf(msg), privateKey, opts)
}

export async function getPublicKey(key: CryptoKeyPair, format?: "raw" | "spki" | "pkcs8"): Promise<string> {
  const key_str = await webcrypto.subtle.exportKey(format ?? "pkcs8", key.publicKey as PublicKey)
  return utils.arrBufToBase64(key_str)
}

export async function getPrivateKey(key: CryptoKeyPair, format?: "raw" | "spki" | "pkcs8"): Promise<string> {
  const key_str = await webcrypto.subtle.exportKey(format ?? "pkcs8", key.privateKey as PrivateKey)
  return utils.arrBufToBase64(key_str)
}

// export getKeyPair = async (privateKey: string, publicKey: string, format?: "raw" | "spki" | "pkcs8"): Promise<[string, string]> => {
//   const priv = await getPrivateKey(privateKey, format)
//   const pub = await getPublicKey(publicKey, format)


export async function getSharedKey(privateKey: PrivateKey, publicKey: PublicKey, opts?: Partial<SymmKeyOpts>): Promise<SymmKey> {
  return webcrypto.subtle.deriveKey(
    { name: ECC_KEY_PAIR_ALG, public: publicKey },
    privateKey,
    {
      name: opts?.alg || DEFAULT_SYMM_ALG,
      length: opts?.length || DEFAULT_SYMM_LEN
    },
    false,
    ['encrypt', 'decrypt']
  )
}

export default {
  // sign,
  // verify,
  encrypt,
  decrypt,
  getPublicKey,
  getPrivateKey,
  // getSharedKey
}
