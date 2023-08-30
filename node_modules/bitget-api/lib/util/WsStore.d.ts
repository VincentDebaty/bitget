import WebSocket from 'isomorphic-ws';
import { WsTopic } from '../types';
import { DefaultLogger } from './logger';
export declare enum WsConnectionStateEnum {
    INITIAL = 0,
    CONNECTING = 1,
    CONNECTED = 2,
    CLOSING = 3,
    RECONNECTING = 4
}
/** A "topic" is always a string */
export declare type BitgetInstType = 'SP' | 'SPBL' | 'MC' | 'UMCBL' | 'DMCBL';
export interface WsTopicSubscribeEventArgs {
    instType: BitgetInstType;
    channel: WsTopic;
    /** The symbol, e.g. "BTCUSDT" */
    instId: string;
}
declare type WsTopicList = Set<WsTopicSubscribeEventArgs>;
interface WsStoredState {
    /** The currently active websocket connection */
    ws?: WebSocket;
    /** The current lifecycle state of the connection (enum) */
    connectionState?: WsConnectionStateEnum;
    /** A timer that will send an upstream heartbeat (ping) when it expires */
    activePingTimer?: ReturnType<typeof setTimeout> | undefined;
    /** A timer tracking that an upstream heartbeat was sent, expecting a reply before it expires */
    activePongTimer?: ReturnType<typeof setTimeout> | undefined;
    /** If a reconnection is in progress, this will have the timer for the delayed reconnect */
    activeReconnectTimer?: ReturnType<typeof setTimeout> | undefined;
    /**
     * All the topics we are expected to be subscribed to (and we automatically resubscribe to if the connection drops)
     *
     * A "Set" and a deep object match are used to ensure we only subscribe to a topic once (tracking a list of unique topics we're expected to be connected to)
     */
    subscribedTopics: WsTopicList;
    isAuthenticated?: boolean;
}
export default class WsStore<WsKey extends string> {
    private wsState;
    private logger;
    constructor(logger: typeof DefaultLogger);
    /** Get WS stored state for key, optionally create if missing */
    get(key: WsKey, createIfMissing?: true): WsStoredState;
    get(key: WsKey, createIfMissing?: false): WsStoredState | undefined;
    getKeys(): WsKey[];
    create(key: WsKey): WsStoredState | undefined;
    delete(key: WsKey): void;
    hasExistingActiveConnection(key: WsKey): boolean;
    getWs(key: WsKey): WebSocket | undefined;
    setWs(key: WsKey, wsConnection: WebSocket): WebSocket;
    isWsOpen(key: WsKey): boolean;
    getConnectionState(key: WsKey): WsConnectionStateEnum;
    setConnectionState(key: WsKey, state: WsConnectionStateEnum): void;
    isConnectionState(key: WsKey, state: WsConnectionStateEnum): boolean;
    getTopics(key: WsKey): WsTopicList;
    getTopicsByKey(): Record<string, WsTopicList>;
    getMatchingTopic(key: WsKey, topic: WsTopicSubscribeEventArgs): WsTopicSubscribeEventArgs | undefined;
    addTopic(key: WsKey, topic: WsTopicSubscribeEventArgs): WsTopicList;
    deleteTopic(key: WsKey, topic: WsTopicSubscribeEventArgs): WsTopicList;
}
export {};
