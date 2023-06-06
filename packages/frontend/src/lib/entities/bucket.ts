export interface BucketData {
    owner: string
    rootCid: string
}

export default interface Bucket {
    id: string
    data: BucketData
}