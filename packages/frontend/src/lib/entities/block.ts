export default interface Block {
    // This is just the CID of the block.
    cid: string
    // The size of the Block in bytes
    size: number,
    // upload timestamp:
    upload: string
}