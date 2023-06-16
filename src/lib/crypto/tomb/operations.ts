import { normalizeBase64ToBuf, normalizeUnicodeToBuf } from '../utils'
import { CharSize, Msg, PrivateKey, PublicKey, AsymmAlg } from '../types'
import { webcrypto } from 'one-webcrypto'


export async function encrypt(
  msg: Msg,
  publicKey: PublicKey,
  asymmAlg: AsymmAlg,
  charSize: CharSize,
): Promise<ArrayBuffer> {
  return webcrypto.subtle.encrypt(
    { name: asymmAlg },
    publicKey,
    normalizeUnicodeToBuf(msg, charSize)
  )
}

export async function decrypt(
  msg: Msg,
  privateKey: PrivateKey,
  asymmAlg: AsymmAlg,
): Promise<ArrayBuffer> {
  const normalized = normalizeBase64ToBuf(msg)
  return webcrypto.subtle.decrypt(
    { name: asymmAlg },
    privateKey,
    normalized
  )
}

export default {
  encrypt,
  decrypt,
}
