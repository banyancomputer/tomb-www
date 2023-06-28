export type Msg = ArrayBuffer | string | Uint8Array

export type CipherText = ArrayBuffer
export type SymmKey = CryptoKey

export type PublicKey = CryptoKey
export type PrivateKey = CryptoKey

export type Config = {
  // Asymmetric Configuration
  type: CryptoSystem
  rsaSize: RsaSize
  asymmAlg: AsymmAlg
  // publicKeyFormat: ExportKeyFormat
  // privateKeyFormat: ExportKeyFormat

  // Symmetric Configuration
  symmAlg: SymmAlg
  symmLen: SymmKeyLength
  saltLen: number
  // symmKeyFormat: ExportKeyFormat

  // Hash Configuration
  hashAlg: HashAlg
  charSize: CharSize

  // Key Store Configuration
  storeName: string
  keyPairName: string
  passKeyName: string
}

export type SymmKeyOpts = {
  alg: SymmAlg
  length: SymmKeyLength
  iv: ArrayBuffer
  // format: ExportKeyFormat
}

// Helper type for exporting keys
export enum ExportKeyFormat {
  PKCS8 = 'pkcs8',
  RAW = 'raw',
}

// The asymmetric crypto systems we support
export enum CryptoSystem {
  RSA = 'rsa',
}

// The asymmetric key algorithms we support
export enum AsymmAlg {
  RSA_OAEP = 'RSA-OAEP',
}

// The RSA sizes we support
export enum RsaSize {
  B3072 = 3072,
  B4096 = 4096
}

// The symmetric key algorithms we support
export enum SymmAlg {
  AES_GCM = 'AES-GCM',
}

// The symmetric key lengths we support
export enum SymmKeyLength {
  B192 = 192,
  B256 = 256,
}

// The hash algorithms we support
export enum HashAlg {
  SHA_1 = 'SHA-1',
  SHA_256 = 'SHA-256',
  SHA_384 = 'SHA-384',
  SHA_512 = 'SHA-512',
}

export enum CharSize {
  B8 = 8,
  B16 = 16,
}

export interface KeyStore {
  cfg: Config

  // General Key Store
  keyExists(keyName: string): Promise<boolean>
  deleteKey(keyName: string): Promise<void>
  clear(): Promise<void>

  /* Asymmetric */
  // Key Management
  keyPair: () => Promise<CryptoKeyPair>
  exportPublicKey(): Promise<string>
  exportPrivateKey(): Promise<string>
  // Key Use
  encrypt(
    msg: string,
    cfg?: Partial<Config>
  ): Promise<string>
  decrypt(
    cipherText: string,
    cfg?: Partial<Config>
  ): Promise<string>

  /* Symmetric */
  // Key Management
  genSymmKey: (keyName: string, cfg?: Partial<Config>) => Promise<CryptoKey>
  getSymmKey: (keyName: string) => Promise<CryptoKey>
  deriveSymmKey: (
    keyName: string,
    seedphrase: string,
    salt: ArrayBuffer,
    cfg?: Partial<Config>
  ) => Promise<CryptoKey>
  importSymmKey(
    keyStr: string,
    keyName: string,
    cfg?: Partial<Config>
  ): Promise<void>
  exportSymmKey(
    keyName: string,
    cfg?: Partial<Config>
  ): Promise<string>
  // Key Use
  encryptWithSymmKey(
    msg: string,
    keyName: string,
    cfg?: Partial<Config>
  ): Promise<string>
  decryptWithSymmKey(
    cipherBytes: string,
    keyName: string,
    cfg?: Partial<Config>
  ): Promise<string>
}
