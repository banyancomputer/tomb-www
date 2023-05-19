use worker::*;

// #[derive(Debug, Clone)]
// pub enum BlockType {
//     Metadata,
//     Content,
// }

// impl TryInto<String> for BlockType {
//     type Error = Error;
//     fn try_into(self) -> Result<String> {
//         match self {
//             Self::Metadata => Ok("metadata".to_string()),
//             Self::Content => Ok("content".to_string()),
//         }
//     }
// }

// impl From<BlockType> for String {
//     fn from(block_type: BlockType) -> Self {
//         match block_type {
//             BlockType::Metadata => "metadata".to_string(),
//             BlockType::Content => "content".to_string(),
//         }
//     }
// }


// TODO: Much better error handling
// This is essentially a shitty way to do middleware

#[derive(Debug, Clone)]
pub struct SharedData {
    pub bucket_id: String, 
    // pub block_type: BlockType,
}
impl SharedData {
    /// Create a new instance of SharedData from a request
    /// 
    /// # Arguments
    /// req: &Request - The request to create the SharedData from
    /// 
    /// # Returns
    /// Result<SharedData> - The result of creating the SharedData
    /// Should generate an error if the request is missing the required headers
    pub fn new(req: &Request) -> Result<Self> {
        let bucket_id = with_bucket_id(req)?;
        // let block_type = with_block_type(req)?;
        // Ok(Self { bucket_id, block_type })
        Ok(Self { bucket_id })
    }
}

pub fn with_bucket_id(req: &Request) -> Result<String> {
    let bucket_id = req.headers().get("x-bucket-id")?;
    match bucket_id {
        Some(bucket_id) => Ok(bucket_id.to_string()),
        None => Err(Error::RouteNoDataError),
    }
}

// pub fn with_block_type(req: &Request) -> Result<BlockType> {
//     let block_type = req.headers().get("x-block-type")?;
//     match block_type {
//         Some(block_type) => {
//             match block_type.as_str() {
//                 "metadata" => Ok(BlockType::Metadata),
//                 "content" => Ok(BlockType::Content),
//                 _ => Err(Error::RouteNoDataError),
//             }
//         },
//         None => Err(Error::RouteNoDataError),
//     }
// }