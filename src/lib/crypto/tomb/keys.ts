import { webcrypto } from 'one-webcrypto'
import { DEFAULT_RSA_SIZE, DEFAULT_HASH_ALG } from '../constants'
import { RsaSize, HashAlg, PublicKey, ExportKeyFormat } from '../types'
import utils from '../utils'
import { AsymmAlg } from '../types'

export async function makeKeypair(
  asymmAlg: AsymmAlg,
  size: RsaSize = DEFAULT_RSA_SIZE,
  hashAlg: HashAlg = DEFAULT_HASH_ALG,
): Promise<CryptoKeyPair> {
  const alg = asymmAlg
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

function stripPublicKeyHeader(base64Key: string): string{
  return base64Key
    .replace('-----BEGIN PUBLIC KEY-----\n', '')
    .replace('\n-----END PUBLIC KEY-----', '')
}

export async function importPublicKey(
  base64Key: string,
  alg: AsymmAlg,
  hashAlg: HashAlg,
  format: ExportKeyFormat
): Promise<PublicKey> {
  const uses: KeyUsage[] = ['encrypt']
  const buf = utils.base64ToArrBuf(stripPublicKeyHeader(base64Key))
  return webcrypto.subtle.importKey(
    format,
    buf,
    { name: alg, hash: {name: hashAlg}},
    true,
    uses
  )
}

export async function importPrivateKey(
  base64Key: string,
  alg: AsymmAlg,
  hashAlg: HashAlg,
  format: ExportKeyFormat
): Promise<CryptoKey> {
  const uses: KeyUsage[] = ['decrypt']
  const buf = utils.base64ToArrBuf(stripPrivateKeyHeader(base64Key))
  return webcrypto.subtle.importKey(
    format,
    buf,
    { name: alg, hash: {name: hashAlg}},
    true,
    uses
  )
}

export async function importKeyPair(
  publicKey: string,
  privateKey: string,
  alg: AsymmAlg,
  hashAlg: HashAlg,
  pubFormat: ExportKeyFormat,
  privFormat: ExportKeyFormat,
): Promise<CryptoKeyPair> {
  console.log('importing key pair')
  const pub = await importPublicKey(publicKey, alg, hashAlg, pubFormat)
  console.log('imported public key')
  const priv = await importPrivateKey(privateKey, alg, hashAlg, privFormat)
  return { publicKey: pub, privateKey: priv }
}

export default {
  makeKeypair,
  importPublicKey,
  importPrivateKey,
  importKeyPair,
}
