export interface AccessKeyData {
    value: string,
    owner: string
}

export default interface AccessKey {
    id: string,
    data: AccessKeyData
}