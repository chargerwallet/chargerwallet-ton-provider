import { IInpageProviderConfig } from '@chargerwallet/cross-inpage-provider-core';
import { ProviderTonBase } from './ProviderTonBase';
import { AppRequest, ConnectEvent, ConnectRequest, DeviceInfo, RpcMethod, WalletEvent, WalletResponse } from '@tonconnect/protocol';
import { AccountInfo, SignDataRequest, SignDataResult, SignProofRequest, SignProofResult, TransactionRequest, WalletInfo } from './types';
declare const PROVIDER_EVENTS: {
    readonly disconnect: "disconnect";
    readonly accountChanged: "accountChanged";
    readonly message_low_level: "message_low_level";
};
export type TonRequest = {
    'connect': (protocolVersion?: number, message?: ConnectRequest) => Promise<AccountInfo>;
    'disconnect': () => Promise<void>;
    'sendTransaction': (payload: TransactionRequest) => Promise<string>;
    'signData': (payload: SignDataRequest) => Promise<SignDataResult>;
    'signProof': (request: SignProofRequest) => Promise<SignProofResult>;
    'getDeviceInfo': () => Promise<Partial<DeviceInfo>>;
};
export type PROVIDER_EVENTS_STRINGS = keyof typeof PROVIDER_EVENTS;
export interface IProviderTon extends ProviderTonBase {
    deviceInfo: DeviceInfo;
    walletInfo?: WalletInfo;
    protocolVersion: number;
    isWalletBrowser: boolean;
    connect(protocolVersion: number, message: ConnectRequest): Promise<ConnectEvent>;
    restoreConnection(): Promise<ConnectEvent>;
    send<T extends RpcMethod>(message: AppRequest<T>): Promise<WalletResponse<T>>;
    listen(callback: (event: WalletEvent) => void): void;
}
type ChargerWalletTonProviderProps = IInpageProviderConfig & {
    timeout?: number;
};
export declare function createTonProviderOpenMask(originalProvider: ProviderTon): ProviderTon;
export declare function createTonProvider(originalProvider: ProviderTon, customDeviceInfo: Partial<DeviceInfo>, customWalletInfo: Partial<WalletInfo>): ProviderTon;
export declare class ProviderTon extends ProviderTonBase implements IProviderTon {
    private _accountInfo;
    deviceInfo: DeviceInfo;
    walletInfo?: WalletInfo;
    protocolVersion: number;
    isWalletBrowser: boolean;
    constructor(props: ChargerWalletTonProviderProps);
    private _getPlatform;
    private _getDeviceInfo;
    private _registerEvents;
    private _callBridge;
    private _handleConnected;
    private _handleDisconnected;
    isAccountsChanged(accountInfo: AccountInfo | undefined): boolean;
    private _handleAccountChange;
    private _network;
    isNetworkChanged(network: string): boolean;
    private _id;
    _connect(protocolVersion?: number, message?: ConnectRequest): Promise<ConnectEvent>;
    connect(protocolVersion?: number, message?: ConnectRequest): Promise<ConnectEvent>;
    restoreConnection(): Promise<ConnectEvent>;
    send<T extends RpcMethod>(message: AppRequest<T>): Promise<WalletResponse<T>>;
    private _sendTransaction;
    private _signData;
    private _disconnect;
    listen(callback: (event: WalletEvent) => void): void;
}
export {};
