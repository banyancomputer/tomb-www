// import { ECCNotEnabled, checkValidCryptoSystem } from '../errors'
// import { Config, KeyStore } from '../types'

import IDB from '../idb'
import keys from '../rsa/keys'
import operations from '../rsa/operations'
import config from '../config'
import utils from '../utils'
import KeyStoreBase from '../keystore/base'
// import { KeyStore, Config, KeyUse, CryptoSystem, PrivateKey } from '../types'
import { IKeyStore, Config, CryptoSystem, PrivateKey } from '../types'

export default class KeyStore extends KeyStoreBase implements IKeyStore {

  static async init(maybeCfg?: Partial<Config>): Promise<KeyStore> {
    // const eccEnabled = await config.eccEnabled()
    // if(!eccEnabled){
    //   throw ECCNotEnabled
    // }
    const cfg = config.normalize({
      ...(maybeCfg || {}),
      type: CryptoSystem.RSA
    })
    const { storeName } = cfg
    const store = IDB.createStore(storeName)
    return new KeyStore(cfg, store)
  }

  /* Key management interface */

  /**
   * Generate a new keypair and store it in IndexedDB
   */
  async makeKeyPair(): Promise<void> {
    await IDB.createIfDoesNotExist(this.cfg.keyPairName, () => (
      keys.makeKeypair(this.cfg.rsaSize, this.cfg.hashAlg)
    ), this.store)
  }

  /**
   * Import an ecnrypted keypair and store it in IndexedDB
   * @param publicKey The public key
   * @param encPrivateKey The encrypted private key string
   * @param passphrase The passphrase to decrypt the private key
   * @param salt? The salt used to derive the encryption key
   */
  async importEncryptedKeyPair(
    publicKey: string,
    encPrivateKey: string,
    passphrase: string,
    salt?: Uint8Array
  ): Promise<void> {
    await IDB.createIfDoesNotExist(this.cfg.keyPairName, () => (
      keys.importEncryptedKeyPair(
        publicKey,
        encPrivateKey,
        passphrase,
        salt
      )
    ), this.store)
  }

  /**
   * Export the keypair, where the private key is encrypted with a passphrase
   */
  async exportEncryptedKeyPair(
    passphrase: string,
    salt?: Uint8Array
  ): Promise<{ publicKey: string, encPrivateKey: string }> {
    const keypair = await this.keyPair()
    return keys.exportEncryptedKeyPair(
      keypair,
      passphrase,
      salt
    )
  }
  
  /**
   * Read the public portion of the exchange key as a string
   */
  async publicKey(): Promise<string> {
    const keyPair: CryptoKeyPair = await this.keyPair()
    return operations.getPublicKey(keyPair)
  }

  // /**
  //  * Read the private portion of the exchange key as a string
  //  */
  // async privateKey(): Promise<string> {
  //   const keyPair: CryptoKeyPair = await this.keyPair()
  //   return operations.getPrivateKey(keyPair)
  // }

  /* Operations Interface */

  async encrypt(
    msg: string,
    cfg?: Partial<Config>
  ): Promise<string> {
    const mergedCfg = config.merge(this.cfg, cfg)
    const keyPair = await this.keyPair()
    return utils.arrBufToBase64(await operations.encrypt(
      msg,
      keyPair.publicKey,
      mergedCfg.charSize,
      mergedCfg.hashAlg,
    ))
  }

  async decrypt(
    cipherText: string,
    cfg?: Partial<Config>
  ): Promise<string> {
    const mergedCfg = config.merge(this.cfg, cfg)
    const keyPair = await this.keyPair()

    return utils.arrBufToStr(
      await operations.decrypt(
        cipherText,
        keyPair.privateKey,
      ),
      mergedCfg.charSize
    )
  }
}

export async function clear(): Promise<void> {
  return IDB.clear()
}

// Note: Original base implementation -- but we only support ECC for now
// import ECCKeyStore from '../ecc/keystore'
// // import RSAKeyStore from '../rsa/keystore'
// import config from '../config'
// import IDB from '../idb'
// import { ECCNotEnabled, checkValidCryptoSystem } from '../errors'
// import { Config, KeyStore } from '../types'

// export async function init(maybeCfg?: Partial<Config>): Promise<KeyStore>{
//   const eccEnabled = await config.eccEnabled()
//   // if(!eccEnabled && maybeCfg?.type === 'ecc'){
//   //   throw ECCNotEnabled
//   // }
//   // We only support ECC for now
//   if(!eccEnabled){
//     throw ECCNotEnabled
//   }

//   const cfg = config.normalize(maybeCfg) //, eccEnabled)

//   checkValidCryptoSystem(cfg.type)

//   return ECCKeyStore.init(cfg)
// }

// export async function clear(): Promise<void> {
//   return IDB.clear()
// }

// export default {
//   init,
//   clear,
// }

