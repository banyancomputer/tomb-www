import aes from '../aes/index'
import * as common from '../common'
import idb from '../idb'
import utils from '../utils'
import config from '../config'
import { Config, PublicKey, PrivateKey, ExportKeyFormat } from '../types'
import { checkIsKeyPair, KeyDoesNotExist } from '../errors'
import * as crypto from 'crypto'

export default class KeyStoreBase {

  cfg: Config
  protected store: LocalForage

  constructor(cfg: Config, store: LocalForage) {
    this.cfg = cfg
    this.store = store
  }

  /* Generic Key Management */

  async keyExists(keyName: string): Promise<boolean> {
    const key = await idb.getKey(keyName, this.store)
    return key !== null
  }

  async deleteKey(keyName: string): Promise<void> {
    return idb.rm(keyName, this.store)
  }

  async clear(): Promise<void> {
    return idb.clear(this.store)
  }

  /* Asymmetric Key Management */

  async keyPair(): Promise<CryptoKeyPair> {
    const maybeKey = await idb.getKeypair(this.cfg.keyPairName, this.store)
    return checkIsKeyPair(maybeKey)
  }

  async fingerprintPublicKey(): Promise<string> {
    const keyPair = await this.keyPair()
    const bytes = await common.exportKeyBytes(keyPair.publicKey as PublicKey, ExportKeyFormat.SPKI)
    const hash = crypto.createHash('sha256')
    hash.update(Buffer.from(bytes))
    return hash.digest('base64')
  }

  async exportPublicKey(): Promise<string> {
    const keyPair = await this.keyPair()
    return common.exportKey(
      keyPair.publicKey as PublicKey, ExportKeyFormat.SPKI
    )
  }

  async exportPrivateKey(): Promise<string> {
    const keyPair = await this.keyPair()
    return common.exportKey(
      keyPair.privateKey as PrivateKey, ExportKeyFormat.PKCS8 
    )
  }

  /* Symmetric Key Management */

  async getSymmKey(keyName: string): Promise<CryptoKey> {
    const maybeKey = await idb.getKey(keyName, this.store)
    if(maybeKey !== null) {
      return maybeKey
    }
    throw KeyDoesNotExist
  }

  async genSymmKey(keyName: string, cfg?: Partial<Config>): Promise<CryptoKey> {
    const mergedCfg = config.merge(this.cfg, cfg)
    const key = await aes.makeKey(config.symmKeyOpts(mergedCfg))
    await idb.put(keyName, key, this.store)
    return key
  }

  async deriveSymmKey(
    keyName: string,
    seedphrase: string,
    salt: ArrayBuffer,
    cfg?: Partial<Config>
  ): Promise<CryptoKey> {
    const mergedCfg = config.merge(this.cfg, cfg)
    const key = await aes.deriveKey(
      seedphrase,
      salt,
      mergedCfg.hashAlg,
      config.symmKeyOpts(mergedCfg)
    )
    await idb.put(keyName, key, this.store)
    return key
  }

  async importSymmKey(keyStr: string, keyName: string, cfg?: Partial<Config>): Promise<void> {
    const mergedCfg = config.merge(this.cfg, cfg)
    const key = await aes.importKey(keyStr, config.symmKeyOpts(mergedCfg))
    await idb.put(keyName, key, this.store)
  }

  async exportSymmKey(keyName: string): Promise<string> {
    const key = await this.getSymmKey(keyName)
    return common.exportKey(key, ExportKeyFormat.RAW)
  }

  async encryptWithSymmKey(msg: string, keyName: string, cfg?: Partial<Config>): Promise<string> {
    const mergedCfg = config.merge(this.cfg, cfg)
    const key = await this.getSymmKey(keyName)
    const cipherText = await aes.encryptBytes(
      utils.strToArrBuf(msg, mergedCfg.charSize),
      key,
      config.symmKeyOpts(mergedCfg)
    )
    return utils.arrBufToBase64(cipherText)
  }

  async decryptWithSymmKey(cipherText: string, keyName: string, cfg?: Partial<Config>): Promise<string> {
    const mergedCfg = config.merge(this.cfg, cfg)
    const key = await this.getSymmKey(keyName)
    const msgBytes = await aes.decryptBytes(
      utils.base64ToArrBuf(cipherText),
      key,
      config.symmKeyOpts(mergedCfg)
    )
    return utils.arrBufToStr(msgBytes, mergedCfg.charSize)
  }
}
