import { NewBatchSpotOrder, NewSpotOrder, NewWalletTransfer, Pagination, APIResponse, KlineInterval, CoinBalance, SymbolRules } from './types';
import BaseRestClient from './util/BaseRestClient';
/**
 * REST API client
 */
export declare class SpotClient extends BaseRestClient {
    getClientType(): "spot";
    fetchServerTime(): Promise<number>;
    /**
     *
     * Public
     *
     */
    /** Get Server Time */
    getServerTime(): Promise<APIResponse<string>>;
    /** Get Coin List : Get all coins information on the platform */
    getCoins(): Promise<APIResponse<any[]>>;
    /** Get Symbols : Get basic configuration information of all trading pairs (including rules) */
    getSymbols(): Promise<APIResponse<SymbolRules[]>>;
    /** Get Single Symbol : Get basic configuration information for one symbol */
    getSymbol(symbol: string): Promise<APIResponse<any>>;
    /**
     *
     * Market
     *
     */
    /** Get Single Ticker */
    getTicker(symbol: string): Promise<APIResponse<any>>;
    /** Get All Tickers */
    getAllTickers(): Promise<APIResponse<any>>;
    /** Get Market Trades */
    getMarketTrades(symbol: string, limit?: string): Promise<APIResponse<any>>;
    /** Get Candle Data */
    getCandles(symbol: string, period: KlineInterval, pagination?: Pagination): Promise<APIResponse<any>>;
    /** Get Depth */
    getDepth(symbol: string, type: 'step0' | 'step1' | 'step2' | 'step3' | 'step4' | 'step5', limit?: string): Promise<APIResponse<any>>;
    /**
     *
     * Wallet Endpoints
     *
     */
    /** Initiate wallet transfer */
    transfer(params: NewWalletTransfer): Promise<APIResponse<any>>;
    /** Get Coin Address */
    getDepositAddress(coin: string, chain?: string): Promise<APIResponse<any>>;
    /** Withdraw Coins On Chain*/
    withdraw(params: {
        coin: string;
        address: string;
        chain: string;
        tag?: string;
        amount: string;
        remark?: string;
        clientOid?: string;
    }): Promise<APIResponse<any>>;
    /** Inner Withdraw : Internal withdrawal means that both users are on the Bitget platform */
    innerWithdraw(coin: string, toUid: string, amount: string, clientOid?: string): Promise<APIResponse<any>>;
    /** Get Withdraw List */
    getWithdrawals(coin: string, startTime: string, endTime: string, pageSize?: string, pageNo?: string): Promise<APIResponse<any>>;
    /** Get Deposit List */
    getDeposits(coin: string, startTime: string, endTime: string, pageSize?: string, pageNo?: string): Promise<APIResponse<any>>;
    /**
     *
     * Account Endpoints
     *
     */
    /** Get ApiKey Info */
    getApiKeyInfo(): Promise<APIResponse<any>>;
    /** Get Account : get account assets */
    getBalance(coin?: string): Promise<APIResponse<CoinBalance[]>>;
    /** Get Bills : get transaction detail flow */
    getTransactionHistory(params?: {
        coinId?: number;
        groupType?: string;
        bizType?: string;
        after?: string;
        before?: string;
        limit?: number;
    }): Promise<APIResponse<any>>;
    /** Get Transfer List */
    getTransferHistory(params?: {
        coinId?: number;
        fromType?: string;
        after?: string;
        before?: string;
        limit?: number;
    }): Promise<APIResponse<any>>;
    /**
     *
     * Trade Endpoints
     *
     */
    /** Place order */
    submitOrder(params: NewSpotOrder): Promise<APIResponse<any>>;
    /** Place orders in batches, up to 50 at a time */
    batchSubmitOrder(symbol: string, orderList: NewBatchSpotOrder[]): Promise<APIResponse<any>>;
    /** Cancel order */
    cancelOrder(symbol: string, orderId: string): Promise<APIResponse<any>>;
    /** Cancel order in batch (per symbol) */
    batchCancelOrder(symbol: string, orderIds: string[]): Promise<APIResponse<any>>;
    /** Get order details */
    getOrder(symbol: string, orderId: string, clientOrderId?: string): Promise<APIResponse<any>>;
    /** Get order list (open orders) */
    getOpenOrders(symbol?: string): Promise<APIResponse<any>>;
    /** Get order history for a symbol */
    getOrderHistory(symbol: string, pagination?: Pagination): Promise<APIResponse<any>>;
    /** Get transaction details / history (fills) for an order */
    getOrderFills(symbol: string, orderId: string, pagination?: Pagination): Promise<APIResponse<any>>;
}
