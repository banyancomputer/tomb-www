export enum PrivNodeType {
    File = "file",
    Directory = "directory",
    // Symlink = "symlink",
}

export default interface PrivNode {
    cid: string;
    name: string;
    type: PrivNodeType;
}
