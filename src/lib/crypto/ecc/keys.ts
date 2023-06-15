import { webcrypto } from 'one-webcrypto'
import utils, { normalizeBase64ToBuf } from '../utils'
// import { EccCurve, KeyUse, PublicKey, CharSize, HashAlg } from '../types'
import { EccCurve, PublicKey, ExportKeyFormat } from '../types'
// import { checkValidKeyUse } from '../errors'
// import { DEFAULT_CHAR_SIZE, DEFAULT_HASH_ALG, ECC_EXCHANGE_ALG, ECC_WRITE_ALG } from '../constants'
import { DEFAULT_ECC_CURVE, ECC_KEY_PAIR_ALG } from '../constants'
import * as aes from '../aes/index'
import { getPublicKey, getPrivateKey } from './operations'

// TODO: This entire ECC scheme is all messed up and needs to be fixed.

export async function makeKeypair(
  curve: EccCurve = DEFAULT_ECC_CURVE,
  // use: KeyUse
): Promise<CryptoKeyPair> {
  // checkValidKeyUse(use)
  // const alg = use === KeyUse.Exchange ? ECC_EXCHANGE_ALG : ECC_WRITE_ALG
  // const uses: KeyUsage[] =
  //   use === KeyUse.Exchange ? ['deriveKey', 'deriveBits'] : ['sign', 'verify']
  const alg = ECC_KEY_PAIR_ALG
  // const uses: KeyUsage[] = ['decrypt', 'encrypt']
  // const uses: KeyUsage[] = ['decrypt', 'encrypt', 'sign', 'verify']
  const uses: KeyUsage[] = ['unwrapKey', 'wrapKey']

  //['encrypt', 'decrypt']
  console.log('makeKeypair: alg', alg)
  console.log('makeKeypair: uses', uses)

  return webcrypto.subtle.generateKey(
    { name: 'ECDH', namedCurve: curve },
    true,
    uses
  )
}

export async function importEncryptedKeyPair(
  publicKey: string,
  encPrivateKey: string,
  passphrase: string,
  salt?: Uint8Array,
  curve: EccCurve = DEFAULT_ECC_CURVE
): Promise<CryptoKeyPair> {
  const importedPublicKey = await importPublicKey(publicKey, curve)
  const passphraseKey = await aes.deriveKey(passphrase, salt)
  const privateKey = await aes.decrypt(encPrivateKey, passphraseKey)
  return webcrypto.subtle.importKey(
    ExportKeyFormat.PKCS8,
    normalizeBase64ToBuf(privateKey),
    { name: ECC_KEY_PAIR_ALG, namedCurve: curve },
    true,
    ['decrypt', 'encrypt']
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

export async function importPublicKey(
  base64Key: string, 
  curve: EccCurve,
  format?: ExportKeyFormat,
): Promise<PublicKey> {
  // checkValidKeyUse(use)
  // const alg = use === KeyUse.Exchange ? ECC_EXCHANGE_ALG : ECC_WRITE_ALG
  // const uses: KeyUsage[] =
  //   use === KeyUse.Exchange ? [] : ['verify']
  const alg = ECC_KEY_PAIR_ALG
  const uses: KeyUsage[] = ['encrypt']
  const buf = utils.base64ToArrBuf(base64Key)
  return webcrypto.subtle.importKey(
    format ?? ExportKeyFormat.PKCS8,
    buf,
    { name: alg, namedCurve: curve },
    true,
    uses
  )
}

export default {
  makeKeypair,
  importEncryptedKeyPair,
  exportEncryptedKeyPair,
  importPublicKey,
}
