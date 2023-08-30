"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BrokerClient = void 0;
const util_1 = require("./util");
const BaseRestClient_1 = __importDefault(require("./util/BaseRestClient"));
/**
 * REST API client for broker APIs
 */
class BrokerClient extends BaseRestClient_1.default {
    getClientType() {
        return util_1.REST_CLIENT_TYPE_ENUM.broker;
    }
    /**
     *
     * Sub Account Interface
     *
     */
    /** Get Broker Info */
    getBrokerInfo() {
        return this.getPrivate('/api/broker/v1/account/info');
    }
    /** Create Sub Account */
    createSubAccount(subName, remark) {
        return this.postPrivate('/api/broker/v1/account/sub-create', {
            subName,
            remark,
        });
    }
    /** Get Sub List */
    getSubAccounts(params) {
        return this.getPrivate('/api/broker/v1/account/sub-list', params);
    }
    /** Modify Sub Account */
    modifySubAccount(subUid, perm, status) {
        return this.postPrivate('/api/broker/v1/account/sub-modify', {
            subUid,
            perm,
            status,
        });
    }
    /** Modify Sub Email */
    modifySubEmail(subUid, subEmail) {
        return this.postPrivate('/api/broker/v1/account/sub-modify-email', {
            subUid,
            subEmail,
        });
    }
    /** Get Sub Email */
    getSubEmail(subUid) {
        return this.getPrivate('/api/broker/v1/account/sub-email', { subUid });
    }
    /** Get Sub Spot Assets */
    getSubSpotAssets(subUid) {
        return this.getPrivate('/api/broker/v1/account/sub-spot-assets', {
            subUid,
        });
    }
    /** Get Sub Future Assets */
    getSubFutureAssets(subUid, productType) {
        return this.getPrivate('/api/broker/v1/account/sub-future-assets', {
            subUid,
            productType,
        });
    }
    /** Get Sub Deposit Address (Only Broker) */
    getSubDepositAddress(subUid, coin, chain) {
        return this.postPrivate('/api/broker/v1/account/sub-address', {
            subUid,
            coin,
            chain,
        });
    }
    /** Sub Withdrawal (Only Broker) */
    subWithdrawal(params) {
        return this.postPrivate('/api/broker/v1/account/sub-withdrawal', params);
    }
    /** Sub Deposit Auto Transfer (Only Broker) */
    setSubDepositAutoTransfer(subUid, coin, toAccountType) {
        return this.postPrivate('/api/broker/v1/account/sub-auto-transfer', {
            subUid,
            coin,
            toAccountType,
        });
    }
    /**
     *
     * Sub API Interface
     *
     */
    /** Create Sub ApiKey (Only Broker) */
    createSubAPIKey(subUid, passphrase, remark, ip, perm) {
        return this.postPrivate('/api/broker/v1/manage/sub-api-create', {
            subUid,
            passphrase,
            remark,
            ip,
            perm,
        });
    }
    /** Get Sub ApiKey List */
    getSubAPIKeys(subUid) {
        return this.getPrivate('/api/broker/v1/manage/sub-api-list', { subUid });
    }
    /** Modify Sub ApiKey (Only Broker) */
    modifySubAPIKey(params) {
        return this.postPrivate('/api/broker/v1/manage/sub-api-modify', params);
    }
}
exports.BrokerClient = BrokerClient;
//# sourceMappingURL=broker-client.js.map