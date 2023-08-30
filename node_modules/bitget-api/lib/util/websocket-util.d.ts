import { WsKey } from '../types';
import { WsTopicSubscribeEventArgs } from './WsStore';
/**
 * Some exchanges have two livenet environments, some have test environments, some dont. This allows easy flexibility for different exchanges.
 * Examples:
 *  - One livenet and one testnet: NetworkMap<'livenet' | 'testnet'>
 *  - One livenet, sometimes two, one testnet: NetworkMap<'livenet' | 'testnet', 'livenet2'>
 *  - Only one livenet, no other networks: NetworkMap<'livenet'>
 */
declare type NetworkMap<TRequiredKeys extends string, TOptionalKeys extends string | undefined = undefined> = Record<TRequiredKeys, string> & (TOptionalKeys extends string ? Record<TOptionalKeys, string | undefined> : Record<TRequiredKeys, string>);
export declare const WS_BASE_URL_MAP: Record<WsKey, Record<'all', NetworkMap<'livenet'>>>;
/** Should be one WS key per unique URL */
export declare const WS_KEY_MAP: {
    readonly spotv1: "spotv1";
    readonly mixv1: "mixv1";
};
/** Any WS keys in this list will trigger auth on connect, if credentials are available */
export declare const WS_AUTH_ON_CONNECT_KEYS: WsKey[];
/** Any WS keys in this list will ALWAYS skip the authentication process, even if credentials are available */
export declare const PUBLIC_WS_KEYS: WsKey[];
/**
 * Used to automatically determine if a sub request should be to a public or private ws (when there's two separate connections).
 * Unnecessary if there's only one connection to handle both public & private topics.
 */
export declare const PRIVATE_TOPICS: string[];
export declare function isPrivateChannel<TChannel extends string>(channel: TChannel): boolean;
export declare function getWsKeyForTopic(subscribeEvent: WsTopicSubscribeEventArgs, isPrivate?: boolean): WsKey;
/** Force subscription requests to be sent in smaller batches, if a number is returned */
export declare function getMaxTopicsPerSubscribeEvent(wsKey: WsKey): number | null;
export declare const WS_ERROR_ENUM: {
    INVALID_ACCESS_KEY: number;
};
export declare function neverGuard(x: never, msg: string): Error;
export declare function getWsAuthSignature(apiKey: string | undefined, apiSecret: string | undefined, apiPass: string | undefined, recvWindow?: number): Promise<{
    expiresAt: number;
    signature: string;
}>;
export {};
