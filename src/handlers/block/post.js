// Our Libraries
import { BlockSizeInvalidError } from '../../errors';
import { JSONResponse, blockKey } from '../../utils';

// IPLD Stuff
import * as Block from 'multiformats/block';
// Our Supported Codecs
import * as json from 'multiformats/codecs/json'
import * as raw from 'multiformats/codecs/raw'
import * as dag_pb from '@ipld/dag-cbor'
import * as dag_cbor from '@ipld/dag-cbor'
import * as dag_json from '@ipld/dag-json'
// Our Supported Hashers
import { sha256 } from 'multiformats/hashes/sha2'
// TODO: Blake3

/**
 * Handle block post request
 *
 * @param {Request} request
 * @param {Env} env
 * @param {import('../../index').Ctx} ctx -- gauranteed to have bucketId
 */
export async function Post(request, env, ctx) {
	const bucketId = ctx.bucketId;
	const params = ctx.params
	const max_block_size = env.MAX_BLOCK_SIZE ?? 1 << 22;  // 4MiB
	const buffer = await request.arrayBuffer();
	const value = new Uint8Array(buffer);

	// If the block exceeds the Max Block Size, Reject the Request
	if (value.byteLength >= max_block_size) {
		throw new BlockSizeInvalidError();
	}

	// Read the CID configuration from the request
	const codec_str = params ? params.get('cid-codec') ?? 'raw' : 'raw';
	const mh_str = params? params.get('mhtype') ?? 'sha2-256' : 'sha2-256';
	let codec, hasher;
	// Configure the CID codec and hasher
	switch (codec_str) {
		case 'raw':
			codec = raw;
			break;
		case 'json':
			codec = json;
			break;
		case 'dag-pb':
			codec = dag_pb;
			break;
		case 'dag-cbor':
			codec = dag_cbor;
			break;
		case 'dag-json':
			codec = dag_json;
			break;
		default:
			throw new Error(`Unsupported CID codec: ${codec_str}`);
	}
	switch (mh_str) {
		case 'sha2-256':
			hasher = sha256;
			break;
		default:
			throw new Error(`Unsupported Multihash Hasher: ${mh_str}`);
	}

	// Generate the CIDv1 from the block, and store the block in the blockstore
	const cid = (await Block.encode({ value, codec, hasher })).cid;
	const key = blockKey(bucketId, cid);
	await env.r2_bucket.put(key, value, {
		// TODO: Scope what Metadata to add
	});
	// console.log(`Stored block ${cid.toString()} in bucket ${bucketId} at key ${key}`);
	return new JSONResponse({
		// TODO: Should this be base58btc encoded?
		Key: cid.toString(), 
		Size: value.byteLength,
		Location: key,
	});
}
