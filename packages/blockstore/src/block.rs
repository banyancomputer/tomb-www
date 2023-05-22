use std::{
    convert::TryInto,
    str::FromStr
};
use worker::*;
use serde_json::json;
use cid::{
    Cid,
    multihash::{Code, MultihashDigest},
 };
use crate::types::{SharedData};

const MAX_BLOCK_SIZE: usize = 1 << 20;
// TODO: We should read this from the config
const BLOCKSTORE_BINDING: &str = "blucket_blockstore_bucket";
const DEFAULT_HASH_FUNCTION: Code = Code::Sha2_256;
const DEFAULT_CID_CODEC: u64 = 0x55;

// TODO: Cleanup stream and bytes handling. You should Tee the streams, and then get the bytes from the tee for the CID, and write the bytes to the blockstore

pub async fn post_async(
    req: Request,
    ctx: RouteContext<SharedData>,
) -> Result<Response> {
    console_log!("POST /put");
    // Clone the SharedData
    let shared_data: SharedData = ctx.data.clone();
    let bucket_id: String = shared_data.bucket_id;
    // Get the blockstore
    let blockstore = ctx.bucket(BLOCKSTORE_BINDING)?;
    // Get the params from the request
    let cid_codec: Option<&String> = ctx.param("cid-codec");
    let mhtype: Option<&String> = ctx.param("mhtype");

    console_log!("cid-codec: {:?}", cid_codec);
    console_log!("mhtype: {:?}", mhtype);
    
    // TODO: This is garbage, fix it.
    // Get the bytes from the request
    let mut req_clone1 = req.clone()?;
    let mut req_clone2 = req.clone()?;
    let bytes = req_clone1.bytes().await?;
    let stream = req_clone2.stream()?;
    let fl_stream = FixedLengthStream::wrap(stream, bytes.len().try_into().unwrap());

    // Get the CID from the bytes
    // Return an error if the bytes are too large
    if bytes.len() > MAX_BLOCK_SIZE {
        return Response::error("Block exceeds max block size", 403)
    }

    // TODO: Determine hash, codec, and version from params
    let mh = match mhtype {
        Some(mhtype) => match mhtype.as_str() {
            "sha2-256" => Code::Sha2_256.digest(&bytes),
            _ => DEFAULT_HASH_FUNCTION.digest(&bytes),
        },
        _ => DEFAULT_HASH_FUNCTION.digest(&bytes),
    };
    // We support dag-cbor or raw blocks
    let codec = match cid_codec {
        Some(cid_codec) => match cid_codec.as_str() {
            // "dag-pb" => Cid::new_v1(0x70, hash),
            "dag-cbor" => 0x71,
            _ => DEFAULT_CID_CODEC
        },
        _ => DEFAULT_CID_CODEC
    };
    let cid = Cid::new_v1(codec, mh);

    // concat the bucket id and cid to get the block id
    let block_id = format!("{}/{:x}/{:?}", bucket_id, codec, mh);
    // Write the bytes to the blockstore, at the bucket id and cid
    blockstore.put(block_id, fl_stream).execute().await?;
    // Return a response
    Response::from_json(&json!({
        "Key": cid.to_string(),
        "Size": bytes.len(),
    }))
}

pub async fn get_async(
    req: Request,
    ctx: RouteContext<SharedData>,
) -> Result<Response> {
    console_log!("GET /get");
    // Clone the SharedData
    let shared_data: SharedData = ctx.data.clone();
    let bucket_id: String = shared_data.bucket_id;
    // Get the blockstore
    let blockstore = ctx.bucket(BLOCKSTORE_BINDING)?;

    // Get the params from the request 
    let req_clone = req.clone()?;
    let req_url = req_clone.url()?;
    let mut query_pairs = req_url.query_pairs();

    // See if the CID is in the query params
    let cid_string = match query_pairs.next() {
        Some((_, value)) => value.into_owned(),
        None => return Response::error("No CID provided", 403),
    };
    // Get the CID from the string
    let cid = match Cid::from_str(&cid_string) {
        Ok(cid) => cid,
        Err(e) => return Response::error(e.to_string(), 403),
    };

    // Just get the hash from the CID
    let mh = cid.hash();
    // But for the codec, turn the codec into a string
    let codec = cid.codec();
    
    // Get the block id from the bucket id, codec, and hash
    let block_id = format!("{}/{:x}/{:?}", bucket_id, codec, mh);
    // Get the block from the blockstore
    let block = blockstore.get(block_id).execute().await?;
    // Return the block
    if let Some(block) = block {
        if let Some(body) = block.body() {
            // Get the stream from the block
            let stream = body.stream()?;
            // Respond with the stream
            Response::from_stream(stream)
        } else {
            Response::error("Block not found", 404)
        }
    } else {
        Response::error("Block not found", 404)
    }
}

pub async fn delete_async(
    req: Request,
    ctx: RouteContext<SharedData>,
) -> Result<Response> {
    console_log!("DELETE /rm");
    // Clone the SharedData
    let shared_data: SharedData = ctx.data.clone();
    let bucket_id: String = shared_data.bucket_id;
    // Get the blockstore
    let blockstore = ctx.bucket(BLOCKSTORE_BINDING)?;
    // Get the params from the request
    let req_clone = req.clone()?;
    let req_url = req_clone.url()?;
    let mut query_pairs = req_url.query_pairs();

     // See if the CID is in the query params
     let cid_string = match query_pairs.next() {
        Some((_, value)) => value.into_owned(),
        None => return Response::error("No CID provided", 403),
    };
    // Get the CID from the string
    let cid = match Cid::from_str(&cid_string) {
        Ok(cid) => cid,
        Err(e) => return Response::error(e.to_string(), 403),
    };

    // Just get the hash from the CID
    let mh = cid.hash();
    // But for the codec, turn the codec into a string
    let codec = cid.codec();
    
    // Get the block id from the bucket id, codec, and hash
    let block_id = format!("{}/{:x}/{:?}", bucket_id, codec, mh);
    // Delete the block from the blockstore
    blockstore.delete(block_id).await?;
    // Return a response -- why are the responses different in the Kubo RPC?
    Response::from_json(&json!({
        "Error": "",
        "Hash": cid_string,
    }))
}

// TODO: Head is not implemented in the blockstore
// pub async fn head_async()
