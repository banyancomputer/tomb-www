// import IDB from '../idb'
// import keys from './keys'
// import operations from './operations'
// import config from '../config'
// import utils from '../utils'
// import KeyStoreBase from '../keystore/base'
// // import { KeyStore, Config, KeyUse, CryptoSystem, PrivateKey } from '../types'
// import { KeyStore, Config, CryptoSystem, PrivateKey } from '../types'

// export class ECCKeyStore extends KeyStoreBase implements KeyStore {

//   static async init(maybeCfg?: Partial<Config>): Promise<ECCKeyStore> {
//     const cfg = config.normalize({
//       ...(maybeCfg || {}),
//       type: CryptoSystem.ECC
//     })
//     // const { curve, storeName, exchangeKeyName, writeKeyName } = cfg
//     // const { curve, storeName, exchangeKeyName } = cfg
//     const { storeName } = cfg

//     const store = IDB.createStore(storeName)
//     // await IDB.createIfDoesNotExist(exchangeKeyName, () => (
//     //   // keys.makeKeypair(curve, KeyUse.Exchange)
//     //   keys.deriveKeyPair(passphrase)
//     // ), store)
//     // await IDB.createIfDoesNotExist(writeKeyName, () => (
//     //   keys.makeKeypair(curve, KeyUse.Write)
//     // ), store)

//     return new ECCKeyStore(cfg, store)
//   }

//   /* Key management interface */

//   /**
//    * Generate a new keypair and store it in IndexedDB
//    */
//   async makeKeyPair(): Promise<void> {
    

//   /**
//    * Derive a known keypair from a passphrase and optional salt. Store the result in IndexedDB.
//    */
//   // async deriveExchangeKey(passphrase: string, salt?: Uint8Array): Promise<void> {
//   //   await IDB.createIfDoesNotExist(this.cfg.exchangeKeyName, () => (
//   //     keys.deriveKeyPair(passphrase)
//   //   ), this.store)
//   // }

//   /**
//    * Read the public portion of the exchange key as a string
//    */
//   async publicExchangeKey(): Promise<string> {
//     const exchangeKey = await this.exchangeKey()
//     return operations.getPublicKey(exchangeKey)
//   }

//   // async publicWriteKey(): Promise<string> {
//   //   const writeKey = await this.writeKey()
//   //   return operations.getPublicKey(writeKey)
//   // }

//   /* Operations Interface */

//   // async sign(msg: string, cfg?: Partial<Config>): Promise<string> {
//   //   const mergedCfg = config.merge(this.cfg, cfg)
//   //   // const writeKey = await this.writeKey()

//   //   return utils.arrBufToBase64(await operations.sign(
//   //     msg,
//   //     writeKey.privateKey as PrivateKey,
//   //     mergedCfg.charSize,
//   //     mergedCfg.hashAlg
//   //   ))
//   // }

//   // async verify(
//   //   msg: string,
//   //   sig: string,
//   //   publicKey: string,
//   //   cfg?: Partial<Config>
//   // ): Promise<boolean> {
//   //   const mergedCfg = config.merge(this.cfg, cfg)

//   //   return operations.verify(
//   //     msg,
//   //     sig,
//   //     publicKey,
//   //     mergedCfg.charSize,
//   //     mergedCfg.curve,
//   //     mergedCfg.hashAlg
//   //   )
//   // }

//   async encrypt(
//     msg: string,
//     publicKey: string,
//     cfg?: Partial<Config>
//   ): Promise<string> {
//     const mergedCfg = config.merge(this.cfg, cfg)
//     const exchangeKey = await this.exchangeKey()

//     return utils.arrBufToBase64(await operations.encrypt(
//       msg,
//       exchangeKey.privateKey as PrivateKey,
//       publicKey,
//       mergedCfg.charSize,
//       mergedCfg.curve
//     ))
//   }

//   async decrypt(
//     cipherText: string,
//     publicKey: string,
//     cfg?: Partial<Config>
//   ): Promise<string> {
//     const mergedCfg = config.merge(this.cfg, cfg)
//     const exchangeKey = await this.exchangeKey()

//     return utils.arrBufToStr(
//       await operations.decrypt(
//         cipherText,
//         exchangeKey.privateKey as PrivateKey,
//         publicKey,
//         mergedCfg.curve
//       ),
//       mergedCfg.charSize
//     )
//   }
// }

// export default ECCKeyStore
