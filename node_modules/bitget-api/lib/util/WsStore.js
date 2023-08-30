"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WsConnectionStateEnum = void 0;
const logger_1 = require("./logger");
var WsConnectionStateEnum;
(function (WsConnectionStateEnum) {
    WsConnectionStateEnum[WsConnectionStateEnum["INITIAL"] = 0] = "INITIAL";
    WsConnectionStateEnum[WsConnectionStateEnum["CONNECTING"] = 1] = "CONNECTING";
    WsConnectionStateEnum[WsConnectionStateEnum["CONNECTED"] = 2] = "CONNECTED";
    WsConnectionStateEnum[WsConnectionStateEnum["CLOSING"] = 3] = "CLOSING";
    WsConnectionStateEnum[WsConnectionStateEnum["RECONNECTING"] = 4] = "RECONNECTING";
    // ERROR = 5,
})(WsConnectionStateEnum = exports.WsConnectionStateEnum || (exports.WsConnectionStateEnum = {}));
function isDeepObjectMatch(object1, object2) {
    for (const key in object1) {
        if (object1[key] !== object2[key]) {
            return false;
        }
    }
    return true;
}
class WsStore {
    constructor(logger) {
        this.wsState = {};
        this.logger = logger || logger_1.DefaultLogger;
    }
    get(key, createIfMissing) {
        if (this.wsState[key]) {
            return this.wsState[key];
        }
        if (createIfMissing) {
            return this.create(key);
        }
    }
    getKeys() {
        return Object.keys(this.wsState);
    }
    create(key) {
        if (this.hasExistingActiveConnection(key)) {
            this.logger.warning('WsStore setConnection() overwriting existing open connection: ', this.getWs(key));
        }
        this.wsState[key] = {
            subscribedTopics: new Set(),
            connectionState: WsConnectionStateEnum.INITIAL,
        };
        return this.get(key);
    }
    delete(key) {
        // TODO: should we allow this at all? Perhaps block this from happening...
        if (this.hasExistingActiveConnection(key)) {
            const ws = this.getWs(key);
            this.logger.warning('WsStore deleting state for connection still open: ', ws);
            ws === null || ws === void 0 ? void 0 : ws.close();
        }
        delete this.wsState[key];
    }
    /* connection websocket */
    hasExistingActiveConnection(key) {
        return this.get(key) && this.isWsOpen(key);
    }
    getWs(key) {
        var _a;
        return (_a = this.get(key)) === null || _a === void 0 ? void 0 : _a.ws;
    }
    setWs(key, wsConnection) {
        if (this.isWsOpen(key)) {
            this.logger.warning('WsStore setConnection() overwriting existing open connection: ', this.getWs(key));
        }
        this.get(key, true).ws = wsConnection;
        return wsConnection;
    }
    /* connection state */
    isWsOpen(key) {
        const existingConnection = this.getWs(key);
        return (!!existingConnection &&
            existingConnection.readyState === existingConnection.OPEN);
    }
    getConnectionState(key) {
        return this.get(key, true).connectionState;
    }
    setConnectionState(key, state) {
        this.get(key, true).connectionState = state;
    }
    isConnectionState(key, state) {
        return this.getConnectionState(key) === state;
    }
    /* subscribed topics */
    getTopics(key) {
        return this.get(key, true).subscribedTopics;
    }
    getTopicsByKey() {
        const result = {};
        for (const refKey in this.wsState) {
            result[refKey] = this.getTopics(refKey);
        }
        return result;
    }
    // Since topics are objects we can't rely on the set to detect duplicates
    getMatchingTopic(key, topic) {
        // if (typeof topic === 'string') {
        //   return this.getMatchingTopic(key, { channel: topic });
        // }
        const allTopics = this.getTopics(key).values();
        for (const storedTopic of allTopics) {
            if (isDeepObjectMatch(topic, storedTopic)) {
                return storedTopic;
            }
        }
    }
    addTopic(key, topic) {
        // if (typeof topic === 'string') {
        //   return this.addTopic(key, {
        //     instType: 'sp',
        //     channel: topic,
        //     instId: 'default',
        //   };
        // }
        // Check for duplicate topic. If already tracked, don't store this one
        const existingTopic = this.getMatchingTopic(key, topic);
        if (existingTopic) {
            return this.getTopics(key);
        }
        return this.getTopics(key).add(topic);
    }
    deleteTopic(key, topic) {
        // Check if we're subscribed to a topic like this
        const storedTopic = this.getMatchingTopic(key, topic);
        if (storedTopic) {
            this.getTopics(key).delete(storedTopic);
        }
        return this.getTopics(key);
    }
}
exports.default = WsStore;
//# sourceMappingURL=WsStore.js.map