import { APIResponse, BrokerProductType, BrokerSubWithdrawalRequest, BrokerSubAPIKeyModifyRequest, BrokerSubListRequest } from './types';
import BaseRestClient from './util/BaseRestClient';
/**
 * REST API client for broker APIs
 */
export declare class BrokerClient extends BaseRestClient {
    getClientType(): "broker";
    /**
     *
     * Sub Account Interface
     *
     */
    /** Get Broker Info */
    getBrokerInfo(): Promise<APIResponse<any>>;
    /** Create Sub Account */
    createSubAccount(subName: string, remark?: string): Promise<APIResponse<any>>;
    /** Get Sub List */
    getSubAccounts(params?: BrokerSubListRequest): Promise<APIResponse<any>>;
    /** Modify Sub Account */
    modifySubAccount(subUid: string, perm: string, status: 'normal' | 'freeze' | 'del'): Promise<APIResponse<any>>;
    /** Modify Sub Email */
    modifySubEmail(subUid: string, subEmail: string): Promise<APIResponse<any>>;
    /** Get Sub Email */
    getSubEmail(subUid: string): Promise<APIResponse<any>>;
    /** Get Sub Spot Assets */
    getSubSpotAssets(subUid: string): Promise<APIResponse<any>>;
    /** Get Sub Future Assets */
    getSubFutureAssets(subUid: string, productType: BrokerProductType): Promise<APIResponse<any>>;
    /** Get Sub Deposit Address (Only Broker) */
    getSubDepositAddress(subUid: string, coin: string, chain?: string): Promise<APIResponse<any>>;
    /** Sub Withdrawal (Only Broker) */
    subWithdrawal(params: BrokerSubWithdrawalRequest): Promise<APIResponse<any>>;
    /** Sub Deposit Auto Transfer (Only Broker) */
    setSubDepositAutoTransfer(subUid: string, coin: string, toAccountType: 'spot' | 'mix_usdt' | 'mix_usd' | 'mix_usdc'): Promise<APIResponse<any>>;
    /**
     *
     * Sub API Interface
     *
     */
    /** Create Sub ApiKey (Only Broker) */
    createSubAPIKey(subUid: string, passphrase: string, remark: string, ip: string, perm?: string): Promise<APIResponse<any>>;
    /** Get Sub ApiKey List */
    getSubAPIKeys(subUid: string): Promise<APIResponse<any>>;
    /** Modify Sub ApiKey (Only Broker) */
    modifySubAPIKey(params: BrokerSubAPIKeyModifyRequest): Promise<APIResponse<any>>;
}
