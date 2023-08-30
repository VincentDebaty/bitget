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
exports.getWsAuthSignature = exports.neverGuard = exports.WS_ERROR_ENUM = exports.getMaxTopicsPerSubscribeEvent = exports.getWsKeyForTopic = exports.isPrivateChannel = exports.PRIVATE_TOPICS = exports.PUBLIC_WS_KEYS = exports.WS_AUTH_ON_CONNECT_KEYS = exports.WS_KEY_MAP = exports.WS_BASE_URL_MAP = void 0;
const node_support_1 = require("./node-support");
exports.WS_BASE_URL_MAP = {
    mixv1: {
        all: {
            livenet: 'wss://ws.bitget.com/mix/v1/stream',
        },
    },
    spotv1: {
        all: {
            livenet: 'wss://ws.bitget.com/spot/v1/stream',
        },
    },
};
/** Should be one WS key per unique URL */
exports.WS_KEY_MAP = {
    spotv1: 'spotv1',
    mixv1: 'mixv1',
};
/** Any WS keys in this list will trigger auth on connect, if credentials are available */
exports.WS_AUTH_ON_CONNECT_KEYS = [
    exports.WS_KEY_MAP.spotv1,
    exports.WS_KEY_MAP.mixv1,
];
/** Any WS keys in this list will ALWAYS skip the authentication process, even if credentials are available */
exports.PUBLIC_WS_KEYS = [];
/**
 * Used to automatically determine if a sub request should be to a public or private ws (when there's two separate connections).
 * Unnecessary if there's only one connection to handle both public & private topics.
 */
exports.PRIVATE_TOPICS = ['account', 'orders', 'positions', 'ordersAlgo'];
function isPrivateChannel(channel) {
    return exports.PRIVATE_TOPICS.includes(channel);
}
exports.isPrivateChannel = isPrivateChannel;
function getWsKeyForTopic(subscribeEvent, isPrivate) {
    const instType = subscribeEvent.instType.toUpperCase();
    switch (instType) {
        case 'SP':
        case 'SPBL': {
            return exports.WS_KEY_MAP.spotv1;
        }
        case 'MC':
        case 'UMCBL':
        case 'DMCBL': {
            return exports.WS_KEY_MAP.mixv1;
        }
        default: {
            throw neverGuard(instType, `getWsKeyForTopic(): Unhandled market ${'instrumentId'}`);
        }
    }
}
exports.getWsKeyForTopic = getWsKeyForTopic;
/** Force subscription requests to be sent in smaller batches, if a number is returned */
function getMaxTopicsPerSubscribeEvent(wsKey) {
    switch (wsKey) {
        case 'mixv1':
        case 'spotv1': {
            // Technically there doesn't seem to be a documented cap, but there is a size limit per request. Doesn't hurt to batch requests.
            return 15;
        }
        default: {
            throw neverGuard(wsKey, `getWsKeyForTopic(): Unhandled wsKey`);
        }
    }
}
exports.getMaxTopicsPerSubscribeEvent = getMaxTopicsPerSubscribeEvent;
exports.WS_ERROR_ENUM = {
    INVALID_ACCESS_KEY: 30011,
};
function neverGuard(x, msg) {
    return new Error(`Unhandled value exception "${x}", ${msg}`);
}
exports.neverGuard = neverGuard;
function getWsAuthSignature(apiKey, apiSecret, apiPass, recvWindow = 0) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!apiKey || !apiSecret || !apiPass) {
            throw new Error(`Cannot auth - missing api key, secret or passcode in config`);
        }
        const signatureExpiresAt = ((Date.now() + recvWindow) / 1000).toFixed(0);
        const signature = yield (0, node_support_1.signMessage)(signatureExpiresAt + 'GET' + '/user/verify', apiSecret, 'base64');
        return {
            expiresAt: Number(signatureExpiresAt),
            signature,
        };
    });
}
exports.getWsAuthSignature = getWsAuthSignature;
//# sourceMappingURL=websocket-util.js.map