import { webcrypto } from 'one-webcrypto'
import utils from '../utils'
import {
  DEFAULT_SYMM_ALG,
  DEFAULT_SYMM_LEN,
  DEFAULT_SYMM_KEY_FORMAT,
} from '../constants'
import { SymmKey, SymmKeyOpts, HashAlg } from '../types'

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
  seed: string, 
  salt: ArrayBuffer,
  hashAlg: HashAlg,
  opts?: Partial<SymmKeyOpts>,
): Promise<SymmKey> {
  const enc = new TextEncoder()
  let baseKey = await webcrypto.subtle.importKey(
    opts?.format || DEFAULT_SYMM_KEY_FORMAT,
    enc.encode(seed),
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  );
  const alg: Pbkdf2Params = {
    name: 'PBKDF2',
    salt: salt,
    iterations: 100000,
    hash: hashAlg
  }
  return webcrypto.subtle.deriveKey(
    alg,
    baseKey,
    { 
      name: opts?.alg || DEFAULT_SYMM_ALG,
      length: opts?.length || DEFAULT_SYMM_LEN 
    },
    true,
    ['encrypt', 'decrypt']
  );
};

export async function importKey(base64key: string, opts?: Partial<SymmKeyOpts>): Promise<SymmKey> {
  const buf = utils.base64ToArrBuf(base64key)
  return webcrypto.subtle.importKey(
    opts?.format || DEFAULT_SYMM_KEY_FORMAT,
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
  deriveKey,
  importKey,
}
