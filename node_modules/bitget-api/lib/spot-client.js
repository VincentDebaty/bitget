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
exports.SpotClient = void 0;
const util_1 = require("./util");
const BaseRestClient_1 = __importDefault(require("./util/BaseRestClient"));
/**
 * REST API client
 */
class SpotClient extends BaseRestClient_1.default {
    getClientType() {
        return util_1.REST_CLIENT_TYPE_ENUM.spot;
    }
    fetchServerTime() {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield this.getServerTime();
            return Number(res.data);
        });
    }
    /**
     *
     * Public
     *
     */
    /** Get Server Time */
    getServerTime() {
        return this.get('/api/spot/v1/public/time');
    }
    /** Get Coin List : Get all coins information on the platform */
    getCoins() {
        return this.get('/api/spot/v1/public/currencies');
    }
    /** Get Symbols : Get basic configuration information of all trading pairs (including rules) */
    getSymbols() {
        return this.get('/api/spot/v1/public/products');
    }
    /** Get Single Symbol : Get basic configuration information for one symbol */
    getSymbol(symbol) {
        return this.get('/api/spot/v1/public/product', { symbol });
    }
    /**
     *
     * Market
     *
     */
    /** Get Single Ticker */
    getTicker(symbol) {
        return this.get('/api/spot/v1/market/ticker', { symbol });
    }
    /** Get All Tickers */
    getAllTickers() {
        return this.get('/api/spot/v1/market/tickers');
    }
    /** Get Market Trades */
    getMarketTrades(symbol, limit) {
        return this.get('/api/spot/v1/market/fills', { symbol, limit });
    }
    /** Get Candle Data */
    getCandles(symbol, period, pagination) {
        return this.get('/api/spot/v1/market/candles', Object.assign({ symbol,
            period }, pagination));
    }
    /** Get Depth */
    getDepth(symbol, type, limit) {
        return this.get('/api/spot/v1/market/depth', { symbol, type, limit });
    }
    /**
     *
     * Wallet Endpoints
     *
     */
    /** Initiate wallet transfer */
    transfer(params) {
        return this.postPrivate('/api/spot/v1/wallet/transfer', params);
    }
    /** Get Coin Address */
    getDepositAddress(coin, chain) {
        return this.getPrivate('/api/spot/v1/wallet/deposit-address', {
            coin,
            chain,
        });
    }
    /** Withdraw Coins On Chain*/
    withdraw(params) {
        return this.postPrivate('/api/spot/v1/wallet/withdrawal', params);
    }
    /** Inner Withdraw : Internal withdrawal means that both users are on the Bitget platform */
    innerWithdraw(coin, toUid, amount, clientOid) {
        return this.postPrivate('/api/spot/v1/wallet/withdrawal-inner', {
            coin,
            toUid,
            amount,
            clientOid,
        });
    }
    /** Get Withdraw List */
    getWithdrawals(coin, startTime, endTime, pageSize, pageNo) {
        return this.getPrivate('/api/spot/v1/wallet/withdrawal-list', {
            coin,
            startTime,
            endTime,
            pageSize,
            pageNo,
        });
    }
    /** Get Deposit List */
    getDeposits(coin, startTime, endTime, pageSize, pageNo) {
        return this.getPrivate('/api/spot/v1/wallet/deposit-list', {
            coin,
            startTime,
            endTime,
            pageSize,
            pageNo,
        });
    }
    /**
     *
     * Account Endpoints
     *
     */
    /** Get ApiKey Info */
    getApiKeyInfo() {
        return this.getPrivate('/api/spot/v1/account/getInfo');
    }
    /** Get Account : get account assets */
    getBalance(coin) {
        return this.getPrivate('/api/spot/v1/account/assets', { coin });
    }
    /** Get Bills : get transaction detail flow */
    getTransactionHistory(params) {
        return this.postPrivate('/api/spot/v1/account/bills', params);
    }
    /** Get Transfer List */
    getTransferHistory(params) {
        return this.getPrivate('/api/spot/v1/account/transferRecords', params);
    }
    /**
     *
     * Trade Endpoints
     *
     */
    /** Place order */
    submitOrder(params) {
        return this.postPrivate('/api/spot/v1/trade/orders', params);
    }
    /** Place orders in batches, up to 50 at a time */
    batchSubmitOrder(symbol, orderList) {
        return this.postPrivate('/api/spot/v1/trade/batch-orders', {
            symbol,
            orderList,
        });
    }
    /** Cancel order */
    cancelOrder(symbol, orderId) {
        return this.postPrivate('/api/spot/v1/trade/cancel-order', {
            symbol,
            orderId,
        });
    }
    /** Cancel order in batch (per symbol) */
    batchCancelOrder(symbol, orderIds) {
        return this.postPrivate('/api/spot/v1/trade/cancel-batch-orders', {
            symbol,
            orderIds,
        });
    }
    /** Get order details */
    getOrder(symbol, orderId, clientOrderId) {
        return this.postPrivate('/api/spot/v1/trade/orderInfo', {
            symbol,
            orderId,
            clientOrderId,
        });
    }
    /** Get order list (open orders) */
    getOpenOrders(symbol) {
        return this.postPrivate('/api/spot/v1/trade/open-orders', { symbol });
    }
    /** Get order history for a symbol */
    getOrderHistory(symbol, pagination) {
        return this.postPrivate('/api/spot/v1/trade/history', Object.assign({ symbol }, pagination));
    }
    /** Get transaction details / history (fills) for an order */
    getOrderFills(symbol, orderId, pagination) {
        return this.postPrivate('/api/spot/v1/trade/fills', Object.assign({ symbol,
            orderId }, pagination));
    }
}
exports.SpotClient = SpotClient;
//# sourceMappingURL=spot-client.js.map