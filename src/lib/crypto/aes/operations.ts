import { webcrypto } from 'one-webcrypto'
import utils from '../utils'
import { DEFAULT_SYMM_ALG } from '../constants'
import { SymmKey, SymmKeyOpts, CipherText, Msg } from '../types'
import { 
  InvalidIvLength, InvalidCipherTextLength
} from '../errors'

// Note: we only support AES-GCM here
// If you want support for more symmetric key algorithms, add implementations here

export async function encryptBytes(
  msg: Msg,
  key: SymmKey,
  opts?: Partial<SymmKeyOpts>
): Promise<CipherText> {
  const data = utils.normalizeUtf16ToBuf(msg)
  const alg = opts?.alg || DEFAULT_SYMM_ALG
  const iv = opts?.iv || utils.randomBuf(16)
  const cipherBuf = await webcrypto.subtle.encrypt(
    {
      name: alg,
      iv,
    },
    key,
    data
  )
  return utils.joinCipherText(iv, cipherBuf)
}

export async function decryptBytes(
  msg: Msg,
  key: SymmKey,
  opts?: Partial<SymmKeyOpts>
): Promise<ArrayBuffer> {
  const cipherText = utils.normalizeBase64ToBuf(msg)
  const alg = opts?.alg || DEFAULT_SYMM_ALG
  const [iv, cipher] = utils.splitCipherText(cipherText)
  // Check lengths
  if (iv.byteLength !== 16) {
    throw InvalidIvLength
  } else if (cipher.byteLength === 0 || cipher.byteLength % 16 !== 0) {
    throw InvalidCipherTextLength
  }
  const msgBuff = await webcrypto.subtle.decrypt(
    { 
      name: alg,
      iv
    },
    key,
    cipher
  )
  return msgBuff
}

export async function encrypt(
  msg: Msg,
  key: SymmKey,
  opts?: Partial<SymmKeyOpts>
): Promise<string> {
  const cipherText = await encryptBytes(msg, key, opts)
  return utils.arrBufToBase64(cipherText)
}

export async function decrypt(
  msg: Msg,
  key: SymmKey,
  opts?: Partial<SymmKeyOpts>
): Promise<string> {
  const msgBytes = await decryptBytes(msg, key, opts)
  return utils.arrBufToStr(msgBytes, 16)
}

export default {
  encryptBytes,
  decryptBytes,
  encrypt,
  decrypt,
}
