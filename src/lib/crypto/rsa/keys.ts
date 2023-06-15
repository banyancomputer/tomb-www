import { webcrypto } from 'one-webcrypto'
// import { RSA_EXCHANGE_ALG, RSA_WRITE_ALG } from '../constants.js'
// import { RsaSize, HashAlg, KeyUse, PublicKey } from '../types.js'
import { RSA_KEY_PAIR_ALG, DEFAULT_RSA_SIZE, DEFAULT_HASH_ALG, DEFAULT_EXPORT_KEY_FORMAT } from '../constants'
import { RsaSize, HashAlg, PublicKey, ExportKeyFormat } from '../types'
import utils, { normalizeBase64ToBuf } from '../utils'
import * as aes from '../aes/index'
import { getPublicKey, getPrivateKey } from './operations'
// import { checkValidKeyUse } from '../errors.js'

export async function makeKeypair(
  size: RsaSize = DEFAULT_RSA_SIZE,
  hashAlg: HashAlg = DEFAULT_HASH_ALG,
  // use: KeyUse
): Promise<CryptoKeyPair> {
  // checkValidKeyUse(use)
  // const alg = use === KeyUse.Exchange ? RSA_EXCHANGE_ALG : RSA_WRITE_ALG
  // const uses: KeyUsage[] = use === KeyUse.Exchange ? ['encrypt', 'decrypt'] : ['sign', 'verify']
  
  const alg = RSA_KEY_PAIR_ALG
  const uses: KeyUsage[] = ['decrypt', 'encrypt']
  return webcrypto.subtle.generateKey(
    {
      name: alg,
      modulusLength: size,
      publicExponent: utils.publicExponent(),
      hash: { name: hashAlg }
    },
    true,
    uses
  )
}

function stripPrivateKeyHeader(base64Key: string): string{
  return base64Key
    .replace('-----BEGIN PRIVATE KEY-----\n', '')
    .replace('\n-----END PRIVATE KEY-----', '')
}

export async function importEncryptedKeyPair(
  publicKey: string,
  encPrivateKey: string,
  passphrase: string,
  salt?: Uint8Array,
  hashAlg: HashAlg = DEFAULT_HASH_ALG
): Promise<CryptoKeyPair> {
  const importedPublicKey = await importPublicKey(publicKey)
  const passphraseKey = await aes.deriveKey(passphrase, salt)
  const privateKey = await aes.decrypt(encPrivateKey, passphraseKey)
  const buf = utils.base64ToArrBuf(stripPrivateKeyHeader(privateKey))
  return webcrypto.subtle.importKey(
    ExportKeyFormat.PKCS8,
    buf,
    { 
      name: RSA_KEY_PAIR_ALG,
      hash: hashAlg
    },
    true,
    ['decrypt']
  ).then((importedPrivateKey) => {
    return { publicKey: importedPublicKey, privateKey: importedPrivateKey }
  })
}

export async function exportEncryptedKeyPair(
  keypair: CryptoKeyPair,
  passphrase: string,
  salt?: Uint8Array,
): Promise<{ publicKey: string, encPrivateKey: string }> {
  const passphraseKey = await aes.deriveKey(passphrase, salt)
  const privateKey = await getPrivateKey(keypair)
  const publicKey = await getPublicKey(keypair)
  const encPrivateKey = await aes.encrypt(privateKey, passphraseKey)
  return { publicKey, encPrivateKey }
}

function stripPublicKeyHeader(base64Key: string): string{
  return base64Key
    .replace('-----BEGIN PUBLIC KEY-----\n', '')
    .replace('\n-----END PUBLIC KEY-----', '')
}

// export async function importPublicKey(base64Key: string, hashAlg: HashAlg, use: KeyUse): Promise<PublicKey> {
export async function importPublicKey(
  base64Key: string, 
  hashAlg: HashAlg = DEFAULT_HASH_ALG,
  format: ExportKeyFormat = DEFAULT_EXPORT_KEY_FORMAT
): Promise<PublicKey> {
  // checkValidKeyUse(use)
  // const alg = use === KeyUse.Exchange ? RSA_EXCHANGE_ALG : RSA_WRITE_ALG
  // const uses: KeyUsage[] = use === KeyUse.Exchange ? ['encrypt'] : ['verify']
  const alg = RSA_KEY_PAIR_ALG
  const uses: KeyUsage[] = ['encrypt']
  const buf = utils.base64ToArrBuf(stripPublicKeyHeader(base64Key))
  return webcrypto.subtle.importKey(
    'spki',
    buf,
    { name: alg, hash: {name: hashAlg}},
    true,
    uses
  )
}

export default {
  makeKeypair,
  importPublicKey,
  exportEncryptedKeyPair,
  importEncryptedKeyPair,
}
