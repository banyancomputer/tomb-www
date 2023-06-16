export const KeyDoesNotExist = new Error("Key does not exist. Make sure you properly instantiated the keystore.")
export const NotKeyPair = new Error("Retrieved a symmetric key when an asymmetric keypair was expected. Please use a different key name.")
export const NotKey = new Error("Retrieved an asymmetric keypair when an symmetric key was expected. Please use a different key name.")
export const UnsupportedCrypto = new Error("Cryptosystem not supported. Please use ECC or RSA")
export const InvalidKeyUse = new Error("Invalid key use. Please use 'exchange' or 'write")
export const InvalidMaxValue = new Error("Max must be less than 256 and greater than 0")

export function checkIsKeyPair(keypair: any): CryptoKeyPair {
  if (!keypair || keypair === null) {
    throw KeyDoesNotExist
  } else if (keypair.privateKey === undefined) {
    throw NotKeyPair
  }
  return keypair as CryptoKeyPair
}

export function checkIsKey(key: any): CryptoKey {
  if (!key || key === null) {
    throw KeyDoesNotExist
  } else if (key.privateKey !== undefined || key.algorithm === undefined) {
    throw NotKey
  }
  return key
}

export default {
  KeyDoesNotExist,
  NotKeyPair,
  NotKey,
  UnsupportedCrypto,
  InvalidKeyUse,
  checkIsKeyPair,
  checkIsKey,
  InvalidMaxValue,
}
