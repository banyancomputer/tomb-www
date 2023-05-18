use std::{
    convert::TryInto,
};
use worker::*;
use serde_json::json;
use cid::{
    Cid,
    multihash::{Code, MultihashDigest},
 };
use crate::types::{SharedData};

const MAX_BLOCK_SIZE: usize = 1 << 20;
const BLOCKSTORE_BINDING: &str = "BLOCKSTORE";
const DEFAULT_HASH_FUNCTION: Code = Code::Sha2_256;
const DEFAULT_CID_CODEC: u64 = 0x55;

pub async fn delete_async(
    req: Request,
    ctx: RouteContext<SharedData>,
) -> Result<Response> {
    console_log!("DELETE /rm");
    // Clone the SharedData
    let shared_data: SharedData = ctx.data.clone();
    let bucket_id: String = shared_data.bucket_id;
    let block_type: String = String::from(shared_data.block_type);
    // Get the blockstore
    let blockstore = ctx.bucket(BLOCKSTORE_BINDING)?;
    // Get the params from the request
    let req_clone = req.clone()?;
    let req_url = req_clone.url()?;
    let mut query_pairs = req_url.query_pairs();
    let cid_string = match query_pairs.next() {
        Some((_, value)) => value.into_owned(),
        None => return Response::error("No CID provided", 403),
    };
    console_log!("cid_string: {:?}", cid_string);
    // Get the block id
    let block_id = format!("{}/{}/{}", bucket_id, block_type, cid_string);
    // Delete the block from the blockstore
    blockstore.delete(block_id).await?;
    // Return a response
    Response::from_json(&json!({
        "Key": cid_string,
    }))
}

pub async fn post_async(
    req: Request,
    ctx: RouteContext<SharedData>,
) -> Result<Response> {
    console_log!("POST /put");
    // Clone the SharedData
    let shared_data: SharedData = ctx.data.clone();
    let bucket_id: String = shared_data.bucket_id;
    let block_type: String = String::from(shared_data.block_type);
    // Get the blockstore
    let blockstore = ctx.bucket(BLOCKSTORE_BINDING)?;
    // Get the params from the request
    let cid_codec: Option<&String> = ctx.param("cid-codec");
    let mhtype: Option<&String> = ctx.param("mhtype");
    console_log!("cid-codec: {:?}", cid_codec);
    console_log!("mhtype: {:?}", mhtype);
    
    // TODO: This is garbage, fix it. You should Tee the stream, and then get the bytes from the tee for the CID, and write the bytes to the blockstore
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
    let hash = match mhtype {
        Some(mhtype) => match mhtype.as_str() {
            "sha2-256" => Code::Sha2_256.digest(&bytes),
            _ => DEFAULT_HASH_FUNCTION.digest(&bytes),
        },
        _ => DEFAULT_HASH_FUNCTION.digest(&bytes),
    };
    let cid = match cid_codec {
        Some(cid_codec) => match cid_codec.as_str() {
            "dag-pb" => Cid::new_v1(0x70, hash),
            _ => Cid::new_v1(DEFAULT_CID_CODEC, hash),
        },
        _ => Cid::new_v1(DEFAULT_CID_CODEC, hash),
    };

    // concat the bucket id and cid to get the block id
    let block_id = format!("{}/{}/{}", bucket_id, block_type, cid.to_string());
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
    let block_type: String = String::from(shared_data.block_type); 
    // Get the blockstore
    let blockstore = ctx.bucket(BLOCKSTORE_BINDING)?;
    // Get the params from the request 
    let req_clone = req.clone()?;
    let req_url = req_clone.url()?;
    let mut query_pairs = req_url.query_pairs();
    let cid_string = match query_pairs.next() {
        Some((_, value)) => value.into_owned(),
        None => return Response::error("No CID provided", 403),
    };
    console_log!("cid_string: {:?}", cid_string);
    // Get the block id
    let block_id = format!("{}/{}/{}", bucket_id, block_type, cid_string);
    // Get the block from the blockstore
    let block = blockstore.get(block_id).execute().await?;
    // Return the block
    if let Some(block) = block {
        if let Some(body) = block.body() {
            // GEt the stream from the block
            let stream = body.stream()?;
            // Response::from_stream(body)
            // Respond with the stream
            Response::from_stream(stream)
        } else {
            Response::error("Block not found", 404)
        }
    } else {
        Response::error("Block not found", 404)
    }
}