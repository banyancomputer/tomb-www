// TODO: This should really be a context.
import AccessKey from "@/lib/entities/accessKey";
import Block from "@/lib/entities/block";

export const BLOCKSTORE_API_URI = "block"

export class Client {
    api: string;
    accessKey: AccessKey;
    constructor(api: string, accessKey: AccessKey) {
        this.api = api;
        this.accessKey = accessKey;
    }

    headers(bucketId: string) {
        return {
            "Authorization": `Bearer ${this.accessKey.id}:${this.accessKey.data.value}`,
            "x-bucket-Id": bucketId,
        };
    }
    
    /* Bucket API */
    // Unnecessary for now. We can request this from Firestore.
    // async getRootCid(bucketId: string): Promise<string> {
    //     const resp = await fetch(`${this.api}`, {
    //         headers: {
    //             ...this.headers(bucketId),
    //         },
    //     });
    //     if (!resp.ok) {
    //         throw new Error(`Failed to get root cid: ${resp.status} ${resp.statusText}`);
    //     }
    //     return await resp.json().then(json => json.rootCid);
    // }

    /* Blockstore API */

    async get(bucketId: string, cid: string) {
        const resp = await fetch(`${this.api}/${BLOCKSTORE_API_URI}/get?arg=${cid}`, {
            headers: {
                ...this.headers(bucketId),
            },
        });
        if (!resp.ok) {
            throw new Error(`Failed to get ${cid}: ${resp.status} ${resp.statusText}`);
        }
        return resp.arrayBuffer();
    }

    async ls(bucketId: string): Promise<Block[]> {
        console.log("ls");
        console.log(this.headers(bucketId));
        return await fetch(`${this.api}/${BLOCKSTORE_API_URI}/ls/`, {
            mode: "cors",
            headers: {
                ...this.headers(bucketId),
            },
            method: "GET",
        }).then((resp) => {
            if (!resp.ok) {
                throw new Error(`Failed to ls ${bucketId}: ${resp.status} ${resp.statusText}`);
            }
            console.log(resp);
            return resp.json() as Promise<Block[]>;
        }).catch((err) => {
            console.log(err);
            throw err;
        });
    }
}