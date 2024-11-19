"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProviderTon = exports.createTonProvider = exports.createTonProviderOpenMask = void 0;
const extension_bridge_injected_1 = require("@chargerwallet/extension-bridge-injected");
const ProviderTonBase_1 = require("./ProviderTonBase");
const protocol_1 = require("@tonconnect/protocol");
const types_1 = require("./types");
const PROVIDER_EVENTS = {
    'disconnect': 'disconnect',
    'accountChanged': 'accountChanged',
    'message_low_level': 'message_low_level',
};
function isWalletEventMethodMatch({ method, name }) {
    return method === `wallet_events_${name}`;
}
function createTonProviderOpenMask(originalProvider) {
    return createTonProvider(originalProvider, {
        appName: 'openmask',
        appVersion: '0.21.1',
    }, {
        name: 'OpenMask',
        image: 'https://raw.githubusercontent.com/OpenProduct/openmask-extension/main/public/openmask-logo-288.png',
        about_url: 'https://www.openmask.app/',
    });
}
exports.createTonProviderOpenMask = createTonProviderOpenMask;
function createTonProvider(originalProvider, customDeviceInfo, customWalletInfo) {
    return new Proxy(originalProvider, {
        get(target, prop, receiver) {
            if (prop === 'deviceInfo') {
                return Object.assign(Object.assign({}, target.deviceInfo), customDeviceInfo);
            }
            if (prop === 'walletInfo') {
                return Object.assign(Object.assign({}, target.walletInfo), customWalletInfo);
            }
            // eslint-disable-next-line @typescript-eslint/no-unsafe-return
            return Reflect.get(target, prop, receiver);
        },
    });
}
exports.createTonProvider = createTonProvider;
class ProviderTon extends ProviderTonBase_1.ProviderTonBase {
    constructor(props) {
        super(Object.assign(Object.assign({}, props), { bridge: props.bridge || (0, extension_bridge_injected_1.getOrCreateExtInjectedJsBridge)({ timeout: props.timeout }) }));
        this._accountInfo = null;
        this.deviceInfo = {
            platform: this._getPlatform(),
            appName: 'chargerwallet',
            appVersion: '0.0.0',
            maxProtocolVersion: 2,
            features: [{ name: 'SendTransaction', maxMessages: 4 }, { name: 'SignData' }],
        };
        this.walletInfo = {
            name: 'ChargerWallet',
            image: 'https://raw.githubusercontent.com/chargerwallet/chargerwallet-assets/refs/heads/main/chargerwallet.png',
            about_url: 'https://chargerwallet.com',
        };
        this.protocolVersion = 2;
        this.isWalletBrowser = false;
        this._id = 0;
        // void this._getDeviceInfo();
        this._registerEvents();
    }
    _getPlatform() {
        const userAgent = window.navigator.userAgent, platform = window.navigator.platform, macosPlatforms = ['Macintosh', 'MacIntel', 'MacPPC', 'Mac68K'], windowsPlatforms = ['Win32', 'Win64', 'Windows', 'WinCE'], iosPlatforms = ['iPhone', 'iPad'];
        let os = 'windows';
        if (macosPlatforms.indexOf(platform) !== -1) {
            os = 'mac';
        }
        else if (iosPlatforms.indexOf(platform) !== -1) {
            if (platform === 'iPhone') {
                os = 'iphone';
            }
            else {
                os = 'ipad';
            }
        }
        else if (windowsPlatforms.indexOf(platform) !== -1) {
            os = 'windows';
        }
        else if (/Android/.test(userAgent)) {
            os = 'android';
        }
        else if (!os && /Linux/.test(platform)) {
            os = 'linux';
        }
        return os;
    }
    _getDeviceInfo() {
        return __awaiter(this, void 0, void 0, function* () {
            const deviceInfo = yield this._callBridge({
                method: 'getDeviceInfo',
                params: [],
            });
            Object.assign(this.deviceInfo, deviceInfo);
        });
    }
    _registerEvents() {
        window.addEventListener('chargerwallet_bridge_disconnect', () => {
            this._handleDisconnected();
        });
        this.on(PROVIDER_EVENTS.message_low_level, (payload) => {
            if (!payload)
                return;
            const { method, params } = payload;
            if (isWalletEventMethodMatch({ method, name: PROVIDER_EVENTS.accountChanged })) {
                this._handleAccountChange(params);
            }
        });
    }
    _callBridge(params) {
        return this.bridgeRequest(params);
    }
    _handleConnected(accountInfo, options = { emit: true }) {
        var _a;
        this._accountInfo = accountInfo;
        if (options.emit && this.isConnectionStatusChanged('connected')) {
            this.connectionStatus = 'connected';
            const address = (_a = accountInfo.address) !== null && _a !== void 0 ? _a : null;
            this.emit('connect', address);
            this.emit('accountChanged', address);
        }
    }
    _handleDisconnected(options = { emit: true }) {
        this._accountInfo = null;
        if (options.emit && this.isConnectionStatusChanged('disconnected')) {
            this.connectionStatus = 'disconnected';
            this.emit('disconnect');
            this.emit('accountChanged', null);
        }
    }
    isAccountsChanged(accountInfo) {
        var _a;
        return (accountInfo === null || accountInfo === void 0 ? void 0 : accountInfo.address) !== ((_a = this._accountInfo) === null || _a === void 0 ? void 0 : _a.address);
    }
    // trigger by bridge account change event
    _handleAccountChange(payload) {
        const accountInfo = payload;
        if (this.isAccountsChanged(accountInfo)) {
            this.emit('accountChanged', (accountInfo === null || accountInfo === void 0 ? void 0 : accountInfo.address) || null);
        }
        if (!accountInfo) {
            this._handleDisconnected();
            return;
        }
        this._handleConnected(accountInfo, { emit: false });
    }
    isNetworkChanged(network) {
        return this._network === undefined || network !== this._network;
    }
    _connect(protocolVersion, message) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = ++this._id;
            const isGetTonAddr = !message || (message && message.items.comme((item) => item.name === 'ton_addr'));
            const proofItem = message &&
                message.items.find((item) => item.name === 'ton_proof');
            const items = [];
            if (isGetTonAddr) {
                if (this._accountInfo) {
                    items.push(Object.assign({ name: 'ton_addr' }, this._accountInfo));
                }
                else {
                    const result = yield this._callBridge({
                        method: 'connect',
                        params: protocolVersion && message ? [protocolVersion, message] : [],
                    });
                    if (!result) {
                        return {
                            event: 'connect_error',
                            id,
                            payload: {
                                code: protocol_1.CONNECT_EVENT_ERROR_CODES.UNKNOWN_ERROR,
                                message: types_1.ConnectEventErrorMessage.UNKNOWN_ERROR,
                            },
                        };
                    }
                    items.push(Object.assign({ name: 'ton_addr' }, result));
                    this._handleConnected(result, { emit: true });
                }
            }
            if (proofItem) {
                const result = yield this._callBridge({
                    method: 'signProof',
                    params: [
                        {
                            payload: proofItem.payload,
                        },
                    ],
                });
                if (!result) {
                    return {
                        event: 'connect_error',
                        id,
                        payload: {
                            code: protocol_1.CONNECT_EVENT_ERROR_CODES.UNKNOWN_ERROR,
                            message: types_1.ConnectEventErrorMessage.UNKNOWN_ERROR,
                        },
                    };
                }
                items.push({
                    name: 'ton_proof',
                    proof: Object.assign(Object.assign({}, result), { payload: proofItem.payload }),
                });
            }
            return {
                event: 'connect',
                id,
                payload: {
                    items,
                    device: this.deviceInfo,
                },
            };
        });
    }
    connect(protocolVersion, message) {
        return this._connect(protocolVersion, message);
    }
    restoreConnection() {
        return this._connect();
    }
    send(message) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = message.id;
            let res;
            const params = message.params.map((p) => {
                if (typeof p === 'string') {
                    return JSON.parse(p);
                }
                return p;
            });
            if (message.method === 'sendTransaction') {
                res = yield this._sendTransaction(params[0]);
            }
            else if (message.method === 'signData') {
                res = yield this._signData(params[0]);
            }
            else if (message.method === 'disconnect') {
                yield this._disconnect();
                res = '';
            }
            else {
                return {
                    id,
                    error: {
                        code: protocol_1.SEND_TRANSACTION_ERROR_CODES.METHOD_NOT_SUPPORTED,
                        message: types_1.SendTransactionErrorMessage.METHOD_NOT_SUPPORTED,
                    },
                };
            }
            if (res === undefined) {
                return {
                    id,
                    error: {
                        code: protocol_1.SEND_TRANSACTION_ERROR_CODES.UNKNOWN_ERROR,
                        message: types_1.SendTransactionErrorMessage.UNKNOWN_ERROR,
                    },
                };
            }
            return {
                id,
                result: res,
            };
        });
    }
    _sendTransaction(request) {
        return __awaiter(this, void 0, void 0, function* () {
            const txid = yield this._callBridge({
                method: 'sendTransaction',
                params: [request],
            });
            return Buffer.from(txid, 'hex');
        });
    }
    _signData(request) {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield this._callBridge({
                method: 'signData',
                params: [request],
            });
            return res;
        });
    }
    _disconnect() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this._callBridge({
                method: 'disconnect',
                params: [],
            });
            this._handleDisconnected();
        });
    }
    listen(callback) {
        super.on('event', callback);
    }
}
exports.ProviderTon = ProviderTon;
