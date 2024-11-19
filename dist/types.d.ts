import { CHAIN } from "@tonconnect/protocol";
export declare enum ConnectEventErrorMessage {
    UNKNOWN_ERROR = "Unknown error",
    BAD_REQUEST = "Bad request",
    APP_MANIFEST_NOT_FOUND = "App manifest not found",
    APP_MANIFEST_CONTENT_ERROR = "App manifest content error",
    UNKNOWN_APP = "Unknown app",
    USER_DECLINED = "User declined the connection"
}
export interface WalletInfo {
    name: string;
    image: string;
    tondns?: string;
    about_url: string;
}
export declare enum SendTransactionErrorMessage {
    UNKNOWN_ERROR = "Unknown error",
    BAD_REQUEST_ERROR = "Bad request",
    UNKNOWN_APP_ERROR = "Unknown app",
    USER_REJECTS_ERROR = "User rejects",
    METHOD_NOT_SUPPORTED = "Method is not supported"
}
export interface AccountInfo {
    address: string;
    network: CHAIN;
    publicKey: string;
    walletStateInit: string;
}
export interface Message {
    address: string;
    amount: string;
    payload?: string;
    stateInit?: string;
}
export interface TransactionRequest {
    valid_until?: number;
    network?: CHAIN;
    from?: string;
    messages: Message[];
}
export interface SignDataRequest {
    schema_crc: number;
    cell: string;
    publicKey?: string;
}
export interface SignDataResult {
    signature: string;
    timestamp: number;
}
export interface SignProofRequest {
    payload: string;
}
export interface SignProofResult {
    signature: string;
    timestamp: number;
    domain: {
        lengthBytes: number;
        value: string;
    };
}
