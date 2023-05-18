pub enum BucketError {
    BucketNotSpecified,
    BucketNotFound,
}

pub enum BlockError {
    BlockTypeNotSpecified,
    BlockExceedsMaxSize,
    BlockNotFound
}