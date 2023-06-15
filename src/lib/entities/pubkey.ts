// User data that exists in firestore
export interface PubKeyData {
    // The PKCS8 export of the public key
    spki: string,
    // The uid of the user who owns the key
    owner: string,
}

export default interface PubKey {
    // 8 byte sha1 fingerprint of the public key's pkcs8 export
    id: string,
    data: PubKeyData
}