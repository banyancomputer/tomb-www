import { base58btc } from 'multiformats/bases/base58'

/*
 * Generate the block key from a Bucket ID and CID
 * @param {string} bucketId
 * @param {CID} cid
 * @returns {string}
 */ 
export function blockKey(bucketId, cid) {
    const cid_codec = cid.code
	const base58_mh = base58btc.encode(cid.multihash.bytes)
	// Index by bucketId/codec/base58_mh
	return `${bucketId}/${cid_codec}/${base58_mh}`
}

