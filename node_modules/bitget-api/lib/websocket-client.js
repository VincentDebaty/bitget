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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebsocketClient = void 0;
const events_1 = require("events");
const isomorphic_ws_1 = __importDefault(require("isomorphic-ws"));
const WsStore_1 = __importDefault(require("./util/WsStore"));
const util_1 = require("./util");
const LOGGER_CATEGORY = { category: 'bitget-ws' };
class WebsocketClient extends events_1.EventEmitter {
    constructor(options, logger) {
        super();
        this.logger = logger || util_1.DefaultLogger;
        this.wsStore = new WsStore_1.default(this.logger);
        this.options = Object.assign({ pongTimeout: 1000, pingInterval: 10000, reconnectTimeout: 500, recvWindow: 0 }, options);
    }
    /**
     * Subscribe to topics & track/persist them. They will be automatically resubscribed to if the connection drops/reconnects.
     * @param wsTopics topic or list of topics
     * @param isPrivateTopic optional - the library will try to detect private topics, you can use this to mark a topic as private (if the topic isn't recognised yet)
     */
    subscribe(wsTopics, isPrivateTopic) {
        const topics = Array.isArray(wsTopics) ? wsTopics : [wsTopics];
        topics.forEach((topic) => {
            var _a;
            const wsKey = (0, util_1.getWsKeyForTopic)(topic, isPrivateTopic);
            // Persist this topic to the expected topics list
            this.wsStore.addTopic(wsKey, topic);
            // TODO: tidy up unsubscribe too, also in other connectors
            // if connected, send subscription request
            if (this.wsStore.isConnectionState(wsKey, util_1.WsConnectionStateEnum.CONNECTED)) {
                // if not authenticated, dont sub to private topics yet.
                // This'll happen automatically once authenticated
                const isAuthenticated = (_a = this.wsStore.get(wsKey)) === null || _a === void 0 ? void 0 : _a.isAuthenticated;
                if (!isAuthenticated) {
                    return this.requestSubscribeTopics(wsKey, topics.filter((topic) => !(0, util_1.isPrivateChannel)(topic.channel)));
                }
                return this.requestSubscribeTopics(wsKey, topics);
            }
            // start connection process if it hasn't yet begun. Topics are automatically subscribed to on-connect
            if (!this.wsStore.isConnectionState(wsKey, util_1.WsConnectionStateEnum.CONNECTING) &&
                !this.wsStore.isConnectionState(wsKey, util_1.WsConnectionStateEnum.RECONNECTING)) {
                return this.connect(wsKey);
            }
        });
    }
    /**
     * Unsubscribe from topics & remove them from memory. They won't be re-subscribed to if the connection reconnects.
     * @param wsTopics topic or list of topics
     * @param isPrivateTopic optional - the library will try to detect private topics, you can use this to mark a topic as private (if the topic isn't recognised yet)
     */
    unsubscribe(wsTopics, isPrivateTopic) {
        const topics = Array.isArray(wsTopics) ? wsTopics : [wsTopics];
        topics.forEach((topic) => this.wsStore.deleteTopic((0, util_1.getWsKeyForTopic)(topic, isPrivateTopic), topic));
        // TODO: should this really happen on each wsKey?? seems weird
        this.wsStore.getKeys().forEach((wsKey) => {
            // unsubscribe request only necessary if active connection exists
            if (this.wsStore.isConnectionState(wsKey, util_1.WsConnectionStateEnum.CONNECTED)) {
                this.requestUnsubscribeTopics(wsKey, topics);
            }
        });
    }
    /** Get the WsStore that tracks websockets & topics */
    getWsStore() {
        return this.wsStore;
    }
    close(wsKey, force) {
        this.logger.info('Closing connection', Object.assign(Object.assign({}, LOGGER_CATEGORY), { wsKey }));
        this.setWsState(wsKey, util_1.WsConnectionStateEnum.CLOSING);
        this.clearTimers(wsKey);
        const ws = this.getWs(wsKey);
        ws === null || ws === void 0 ? void 0 : ws.close();
        if (force) {
            ws === null || ws === void 0 ? void 0 : ws.terminate();
        }
    }
    closeAll(force) {
        this.wsStore.getKeys().forEach((key) => {
            this.close(key, force);
        });
    }
    /**
     * Request connection of all dependent (public & private) websockets, instead of waiting for automatic connection by library
     */
    connectAll() {
        return [this.connect(util_1.WS_KEY_MAP.spotv1), this.connect(util_1.WS_KEY_MAP.mixv1)];
    }
    /**
     * Request connection to a specific websocket, instead of waiting for automatic connection.
     */
    connect(wsKey) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (this.wsStore.isWsOpen(wsKey)) {
                    this.logger.error('Refused to connect to ws with existing active connection', Object.assign(Object.assign({}, LOGGER_CATEGORY), { wsKey }));
                    return this.wsStore.getWs(wsKey);
                }
                if (this.wsStore.isConnectionState(wsKey, util_1.WsConnectionStateEnum.CONNECTING)) {
                    this.logger.error('Refused to connect to ws, connection attempt already active', Object.assign(Object.assign({}, LOGGER_CATEGORY), { wsKey }));
                    return;
                }
                if (!this.wsStore.getConnectionState(wsKey) ||
                    this.wsStore.isConnectionState(wsKey, util_1.WsConnectionStateEnum.INITIAL)) {
                    this.setWsState(wsKey, util_1.WsConnectionStateEnum.CONNECTING);
                }
                const url = this.getWsUrl(wsKey); // + authParams;
                const ws = this.connectToWsUrl(url, wsKey);
                return this.wsStore.setWs(wsKey, ws);
            }
            catch (err) {
                this.parseWsError('Connection failed', err, wsKey);
                this.reconnectWithDelay(wsKey, this.options.reconnectTimeout);
            }
        });
    }
    parseWsError(context, error, wsKey) {
        if (!error.message) {
            this.logger.error(`${context} due to unexpected error: `, error);
            this.emit('response', Object.assign(Object.assign({}, error), { wsKey }));
            this.emit('exception', Object.assign(Object.assign({}, error), { wsKey }));
            return;
        }
        switch (error.message) {
            case 'Unexpected server response: 401':
                this.logger.error(`${context} due to 401 authorization failure.`, Object.assign(Object.assign({}, LOGGER_CATEGORY), { wsKey }));
                break;
            default:
                this.logger.error(`${context} due to unexpected response error: "${(error === null || error === void 0 ? void 0 : error.msg) || (error === null || error === void 0 ? void 0 : error.message) || error}"`, Object.assign(Object.assign({}, LOGGER_CATEGORY), { wsKey, error }));
                break;
        }
        this.emit('response', Object.assign(Object.assign({}, error), { wsKey }));
        this.emit('exception', Object.assign(Object.assign({}, error), { wsKey }));
    }
    /** Get a signature, build the auth request and send it */
    sendAuthRequest(wsKey) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { apiKey, apiSecret, apiPass, recvWindow } = this.options;
                const { signature, expiresAt } = yield (0, util_1.getWsAuthSignature)(apiKey, apiSecret, apiPass, recvWindow);
                this.logger.info(`Sending auth request...`, Object.assign(Object.assign({}, LOGGER_CATEGORY), { wsKey }));
                const request = {
                    op: 'login',
                    args: [
                        {
                            apiKey: this.options.apiKey,
                            passphrase: this.options.apiPass,
                            timestamp: expiresAt,
                            sign: signature,
                        },
                    ],
                };
                // console.log('ws auth req', request);
                return this.tryWsSend(wsKey, JSON.stringify(request));
            }
            catch (e) {
                this.logger.silly(e, Object.assign(Object.assign({}, LOGGER_CATEGORY), { wsKey }));
            }
        });
    }
    reconnectWithDelay(wsKey, connectionDelayMs) {
        this.clearTimers(wsKey);
        if (this.wsStore.getConnectionState(wsKey) !==
            util_1.WsConnectionStateEnum.CONNECTING) {
            this.setWsState(wsKey, util_1.WsConnectionStateEnum.RECONNECTING);
        }
        this.wsStore.get(wsKey, true).activeReconnectTimer = setTimeout(() => {
            this.logger.info('Reconnecting to websocket', Object.assign(Object.assign({}, LOGGER_CATEGORY), { wsKey }));
            this.connect(wsKey);
        }, connectionDelayMs);
    }
    ping(wsKey) {
        if (this.wsStore.get(wsKey, true).activePongTimer) {
            return;
        }
        this.clearPongTimer(wsKey);
        this.logger.silly('Sending ping', Object.assign(Object.assign({}, LOGGER_CATEGORY), { wsKey }));
        this.tryWsSend(wsKey, JSON.stringify({ op: 'ping' }));
        this.wsStore.get(wsKey, true).activePongTimer = setTimeout(() => {
            var _a;
            this.logger.info('Pong timeout - closing socket to reconnect', Object.assign(Object.assign({}, LOGGER_CATEGORY), { wsKey }));
            (_a = this.getWs(wsKey)) === null || _a === void 0 ? void 0 : _a.terminate();
            delete this.wsStore.get(wsKey, true).activePongTimer;
        }, this.options.pongTimeout);
    }
    clearTimers(wsKey) {
        this.clearPingTimer(wsKey);
        this.clearPongTimer(wsKey);
        const wsState = this.wsStore.get(wsKey);
        if (wsState === null || wsState === void 0 ? void 0 : wsState.activeReconnectTimer) {
            clearTimeout(wsState.activeReconnectTimer);
        }
    }
    // Send a ping at intervals
    clearPingTimer(wsKey) {
        const wsState = this.wsStore.get(wsKey);
        if (wsState === null || wsState === void 0 ? void 0 : wsState.activePingTimer) {
            clearInterval(wsState.activePingTimer);
            wsState.activePingTimer = undefined;
        }
    }
    // Expect a pong within a time limit
    clearPongTimer(wsKey) {
        const wsState = this.wsStore.get(wsKey);
        if (wsState === null || wsState === void 0 ? void 0 : wsState.activePongTimer) {
            clearTimeout(wsState.activePongTimer);
            wsState.activePongTimer = undefined;
        }
    }
    /**
     * @private Use the `subscribe(topics)` method to subscribe to topics. Send WS message to subscribe to topics.
     */
    requestSubscribeTopics(wsKey, topics) {
        if (!topics.length) {
            return;
        }
        const maxTopicsPerEvent = (0, util_1.getMaxTopicsPerSubscribeEvent)(wsKey);
        if (maxTopicsPerEvent && topics.length > maxTopicsPerEvent) {
            this.logger.silly(`Subscribing to topics in batches of ${maxTopicsPerEvent}`);
            for (var i = 0; i < topics.length; i += maxTopicsPerEvent) {
                const batch = topics.slice(i, i + maxTopicsPerEvent);
                this.logger.silly(`Subscribing to batch of ${batch.length}`);
                this.requestSubscribeTopics(wsKey, batch);
            }
            this.logger.silly(`Finished batch subscribing to ${topics.length} topics`);
            return;
        }
        const wsMessage = JSON.stringify({
            op: 'subscribe',
            args: topics,
        });
        this.tryWsSend(wsKey, wsMessage);
    }
    /**
     * @private Use the `unsubscribe(topics)` method to unsubscribe from topics. Send WS message to unsubscribe from topics.
     */
    requestUnsubscribeTopics(wsKey, topics) {
        if (!topics.length) {
            return;
        }
        const maxTopicsPerEvent = (0, util_1.getMaxTopicsPerSubscribeEvent)(wsKey);
        if (maxTopicsPerEvent && topics.length > maxTopicsPerEvent) {
            this.logger.silly(`Unsubscribing to topics in batches of ${maxTopicsPerEvent}`);
            for (var i = 0; i < topics.length; i += maxTopicsPerEvent) {
                const batch = topics.slice(i, i + maxTopicsPerEvent);
                this.logger.silly(`Unsubscribing to batch of ${batch.length}`);
                this.requestUnsubscribeTopics(wsKey, batch);
            }
            this.logger.silly(`Finished batch unsubscribing to ${topics.length} topics`);
            return;
        }
        const wsMessage = JSON.stringify({
            op: 'unsubscribe',
            args: topics,
        });
        this.tryWsSend(wsKey, wsMessage);
    }
    tryWsSend(wsKey, wsMessage) {
        try {
            this.logger.silly(`Sending upstream ws message: `, Object.assign(Object.assign({}, LOGGER_CATEGORY), { wsMessage,
                wsKey }));
            if (!wsKey) {
                throw new Error('Cannot send message due to no known websocket for this wsKey');
            }
            const ws = this.getWs(wsKey);
            if (!ws) {
                throw new Error(`${wsKey} socket not connected yet, call "connectAll()" first then try again when the "open" event arrives`);
            }
            ws.send(wsMessage);
        }
        catch (e) {
            this.logger.error(`Failed to send WS message`, Object.assign(Object.assign({}, LOGGER_CATEGORY), { wsMessage,
                wsKey, exception: e }));
        }
    }
    connectToWsUrl(url, wsKey) {
        var _a;
        this.logger.silly(`Opening WS connection to URL: ${url}`, Object.assign(Object.assign({}, LOGGER_CATEGORY), { wsKey }));
        const agent = (_a = this.options.requestOptions) === null || _a === void 0 ? void 0 : _a.agent;
        const ws = new isomorphic_ws_1.default(url, undefined, agent ? { agent } : undefined);
        ws.onopen = (event) => this.onWsOpen(event, wsKey);
        ws.onmessage = (event) => this.onWsMessage(event, wsKey);
        ws.onerror = (event) => this.parseWsError('websocket error', event, wsKey);
        ws.onclose = (event) => this.onWsClose(event, wsKey);
        return ws;
    }
    onWsOpen(event, wsKey) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.wsStore.isConnectionState(wsKey, util_1.WsConnectionStateEnum.CONNECTING)) {
                this.logger.info('Websocket connected', Object.assign(Object.assign({}, LOGGER_CATEGORY), { wsKey }));
                this.emit('open', { wsKey, event });
            }
            else if (this.wsStore.isConnectionState(wsKey, util_1.WsConnectionStateEnum.RECONNECTING)) {
                this.logger.info('Websocket reconnected', Object.assign(Object.assign({}, LOGGER_CATEGORY), { wsKey }));
                this.emit('reconnected', { wsKey, event });
            }
            this.setWsState(wsKey, util_1.WsConnectionStateEnum.CONNECTED);
            // Some websockets require an auth packet to be sent after opening the connection
            if (util_1.WS_AUTH_ON_CONNECT_KEYS.includes(wsKey)) {
                yield this.sendAuthRequest(wsKey);
            }
            // Reconnect to topics known before it connected
            // Private topics will be resubscribed to once reconnected
            const topics = [...this.wsStore.getTopics(wsKey)];
            const publicTopics = topics.filter((topic) => !(0, util_1.isPrivateChannel)(topic.channel));
            this.requestSubscribeTopics(wsKey, publicTopics);
            this.wsStore.get(wsKey, true).activePingTimer = setInterval(() => this.ping(wsKey), this.options.pingInterval);
        });
    }
    /** Handle subscription to private topics _after_ authentication successfully completes asynchronously */
    onWsAuthenticated(wsKey) {
        const wsState = this.wsStore.get(wsKey, true);
        wsState.isAuthenticated = true;
        const topics = [...this.wsStore.getTopics(wsKey)];
        const privateTopics = topics.filter((topic) => (0, util_1.isPrivateChannel)(topic.channel));
        if (privateTopics.length) {
            this.subscribe(privateTopics, true);
        }
    }
    onWsMessage(event, wsKey) {
        try {
            // any message can clear the pong timer - wouldn't get a message if the ws wasn't working
            this.clearPongTimer(wsKey);
            if ((0, util_1.isWsPong)(event)) {
                this.logger.silly('Received pong', Object.assign(Object.assign({}, LOGGER_CATEGORY), { wsKey }));
                return;
            }
            const msg = JSON.parse((event && event['data']) || event);
            const emittableEvent = Object.assign(Object.assign({}, msg), { wsKey });
            if (typeof msg === 'object') {
                if (typeof msg['code'] === 'number') {
                    if (msg.event === 'login' && msg.code === 0) {
                        this.logger.info(`Successfully authenticated WS client`, Object.assign(Object.assign({}, LOGGER_CATEGORY), { wsKey }));
                        this.emit('response', emittableEvent);
                        this.emit('authenticated', emittableEvent);
                        this.onWsAuthenticated(wsKey);
                        return;
                    }
                }
                if (msg['event']) {
                    if (msg.event === 'error') {
                        this.logger.error(`WS Error received`, Object.assign(Object.assign({}, LOGGER_CATEGORY), { wsKey, message: msg || 'no message', 
                            // messageType: typeof msg,
                            // messageString: JSON.stringify(msg),
                            event }));
                        this.emit('exception', emittableEvent);
                        this.emit('response', emittableEvent);
                        return;
                    }
                    return this.emit('response', emittableEvent);
                }
                if (msg['arg']) {
                    return this.emit('update', emittableEvent);
                }
            }
            this.logger.warning('Unhandled/unrecognised ws event message', Object.assign(Object.assign({}, LOGGER_CATEGORY), { message: msg || 'no message', 
                // messageType: typeof msg,
                // messageString: JSON.stringify(msg),
                event,
                wsKey }));
            // fallback emit anyway
            return this.emit('update', emittableEvent);
        }
        catch (e) {
            this.logger.error('Failed to parse ws event message', Object.assign(Object.assign({}, LOGGER_CATEGORY), { error: e, event,
                wsKey }));
        }
    }
    onWsClose(event, wsKey) {
        this.logger.info('Websocket connection closed', Object.assign(Object.assign({}, LOGGER_CATEGORY), { wsKey }));
        if (this.wsStore.getConnectionState(wsKey) !== util_1.WsConnectionStateEnum.CLOSING) {
            this.reconnectWithDelay(wsKey, this.options.reconnectTimeout);
            this.emit('reconnect', { wsKey, event });
        }
        else {
            this.setWsState(wsKey, util_1.WsConnectionStateEnum.INITIAL);
            this.emit('close', { wsKey, event });
        }
    }
    getWs(wsKey) {
        return this.wsStore.getWs(wsKey);
    }
    setWsState(wsKey, state) {
        this.wsStore.setConnectionState(wsKey, state);
    }
    getWsUrl(wsKey) {
        if (this.options.wsUrl) {
            return this.options.wsUrl;
        }
        const networkKey = 'livenet';
        switch (wsKey) {
            case util_1.WS_KEY_MAP.spotv1: {
                return util_1.WS_BASE_URL_MAP.spotv1.all[networkKey];
            }
            case util_1.WS_KEY_MAP.mixv1: {
                return util_1.WS_BASE_URL_MAP.mixv1.all[networkKey];
            }
            default: {
                this.logger.error('getWsUrl(): Unhandled wsKey: ', Object.assign(Object.assign({}, LOGGER_CATEGORY), { wsKey }));
                throw (0, util_1.neverGuard)(wsKey, `getWsUrl(): Unhandled wsKey`);
            }
        }
    }
    /**
     * Subscribe to a topic
     * @param instType instrument type (refer to API docs).
     * @param topic topic name (e.g. "ticker").
     * @param instId instrument ID (e.g. "BTCUSDT"). Use "default" for private topics.
     */
    subscribeTopic(instType, topic, instId = 'default') {
        return this.subscribe({
            instType,
            instId,
            channel: topic,
        });
    }
    /**
     * Unsubscribe from a topic
     * @param instType instrument type (refer to API docs).
     * @param topic topic name (e.g. "ticker").
     * @param instId instrument ID (e.g. "BTCUSDT"). Use "default" for private topics to get all symbols.
     */
    unsubscribeTopic(instType, topic, instId = 'default') {
        return this.unsubscribe({
            instType,
            instId,
            channel: topic,
        });
    }
}
exports.WebsocketClient = WebsocketClient;
//# sourceMappingURL=websocket-client.js.map