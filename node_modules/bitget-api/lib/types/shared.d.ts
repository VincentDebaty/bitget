import { REST_CLIENT_TYPE_ENUM } from '../util';
export declare type numberInString = string;
export declare type OrderSide = 'Buy' | 'Sell';
export declare type KlineInterval = '1min' | '5min' | '15min' | '30min' | '1h' | '4h' | '6h' | '12h' | '1M' | '1W' | '1week' | '6Hutc' | '12Hutc' | '1Dutc' | '3Dutc' | '1Wutc' | '1Mutc';
export declare type RestClientType = typeof REST_CLIENT_TYPE_ENUM[keyof typeof REST_CLIENT_TYPE_ENUM];
