use worker::*;
use serde_json::json;
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

const IPFS_API: &str = "/ipfs/api/v0";

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
                .get_async(format!("{}/block/get", IPFS_API).as_str(), block::get_async)
                .post_async(format!("{}/block/put", IPFS_API).as_str(), block::post_async)
                .delete_async(format!("{}/block/rm", IPFS_API).as_str(), block::delete_async)
                /* S3 API Routes */
                // TODO: @laudiacay, add S3 API routes
                .run(req, env)
                .await
            },
        Err(e) => {
            // If the data is not successfully read, return an error
            Response::error(e.to_string(), 400)
        }
    }
    
} 
