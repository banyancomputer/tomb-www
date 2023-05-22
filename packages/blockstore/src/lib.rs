use worker::*;
mod utils;
mod block;

pub mod types;
use crate::types::SharedData;

fn log_request(req: &Request) {
    console_log!(
        "{} - [{}], located at: {:?}, within: {}",
        Date::now().to_string(),
        req.path(),
        req.cf().coordinates().unwrap_or_default(),
        req.cf().region().unwrap_or_else(|| "unknown region".into())
    );
}

// One time setup code, that runs at startup.
#[event(start)]
pub fn start() {
    utils::set_panic_hook();
}

// TODO: We should read this from the config
const BLOCKSTORE_BINDING: &str = "blucket_blockstore_bucket";

// The main entry point for requests.
#[event(fetch)]
pub async fn main(req: Request, env: Env, _ctx: worker::Context) -> Result<Response> {
    log_request(&req);
    utils::set_panic_hook();
    // Try readin the shared data from the request. Return an error if it fails
    let data = SharedData::new(&req);
    match data {
        Ok(data) => {
            let router = Router::with_data(data);
            router
                /* IPFS API V0 Routes */
                .get_async("/block/get", block::get_async)
                // .head_async("/block/stat", block::head_async)
                .post_async("/block/put", block::post_async)
                .delete_async("/block/rm", block::delete_async)
                /* Misc */
                // TODO: Think of a better way to do this. This just makes it very easy to pass the request
                // from DELETE / from the api worker to the blockstore worker
                .delete_async("/", |_req , ctx| async move {
                    // Clone the SharedData
                    let shared_data: SharedData = ctx.data.clone();
                    let bucket_id: String = shared_data.bucket_id;
                    // Get the blockstore
                    let blockstore = ctx.bucket(BLOCKSTORE_BINDING)?;
                    // Get the list of blocks
                    let blocks = blockstore.list()
                        .prefix(bucket_id)
                        .limit(1)
                        .execute().await?;
                    // If the list of blocks is empty, return Ok, otherwise return an error
                    if blocks.objects().is_empty() {
                        Response::ok("true")
                    } else {
                        Response::error("false", 400)
                    }
                })
                .run(req, env)
                .await
            },
        Err(e) => {
            // If the data is not successfully read, return an error
            Response::error(e.to_string(), 400)
        }
    }
    
} 
