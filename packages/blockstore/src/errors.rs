pub enum BucketError {
    BucketNotSpecified,
    BucketNotFound,
}

pub enum BlockError {
    BlockCodecNotSupported,
    BlockExceedsMaxSize,
    BlockNotFound
}