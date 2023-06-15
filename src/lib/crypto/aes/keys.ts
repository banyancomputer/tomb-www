import { webcrypto } from 'one-webcrypto'
import utils, { normalizeUnicodeToBuf } from '../utils'
import { DEFAULT_SYMM_ALG, DEFAULT_SYMM_LEN, DEFAULT_HASH_ALG, DEFAULT_CHAR_SIZE } from '../constants'
import { SymmKey, SymmKeyOpts, HashAlg, CharSize, ExportKeyFormat } from '../types'

export async function makeKey(opts?: Partial<SymmKeyOpts>): Promise<SymmKey> {
  return webcrypto.subtle.generateKey(
    {
      name: opts?.alg || DEFAULT_SYMM_ALG,
      length: opts?.length || DEFAULT_SYMM_LEN,
    },
    true,
    ['encrypt', 'decrypt']
  )
}

export async function deriveKey(
  passphrase: string, 
  salt?: Uint8Array, 
  opts?: Partial<SymmKeyOpts>,
  hashAlg: HashAlg = DEFAULT_HASH_ALG,
  // charSize: CharSize = DEFAULT_CHAR_SIZE
): Promise<SymmKey> {
  const enc = new TextEncoder()
  let baseKey = await webcrypto.subtle.importKey(
    'raw', // raw format of the key - should be Uint8Array
    enc.encode(passphrase),
    'PBKDF2', // Re-use the same algorithm as in encrypt()
    false, // extractable (we don't need to extract it, just the derived key)
    ['deriveBits', 'deriveKey'] // what this key can do
  );
  // Generate the new key from the password key
  const alg: Pbkdf2Params = {
    name: 'PBKDF2',
    salt: salt ?? new Uint8Array(16),
    iterations: 100000,
    hash: hashAlg
  }
  return await webcrypto.subtle.deriveKey(
    alg,
    baseKey,
    { name: DEFAULT_SYMM_ALG, length: DEFAULT_SYMM_LEN },
    true, // whether the derived key is extractable (i.e. can be used in exportKey)
    ['encrypt', 'decrypt'] // limited to the options encrypt and decrypt
  );
};

export async function importKey(base64key: string, opts?: Partial<SymmKeyOpts>): Promise<SymmKey> {
  const buf = utils.base64ToArrBuf(base64key)
  return webcrypto.subtle.importKey(
    opts?.format || ExportKeyFormat.PKCS8,
    buf,
    {
      name: opts?.alg || DEFAULT_SYMM_ALG,
      length: opts?.length || DEFAULT_SYMM_LEN,
    },
    true,
    ['encrypt', 'decrypt']
  )
}

export default {
  makeKey,
  importKey,
}
