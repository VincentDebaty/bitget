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
const axios_1 = __importDefault(require("axios"));
const node_support_1 = require("./node-support");
const requestUtils_1 = require("./requestUtils");
const websocket_util_1 = require("./websocket-util");
class BaseRestClient {
    /**
     * Create an instance of the REST client. Pass API credentials in the object in the first parameter.
     * @param {RestClientOptions} [restClientOptions={}] options to configure REST API connectivity
     * @param {AxiosRequestConfig} [networkOptions={}] HTTP networking options for axios
     */
    constructor(restOptions = {}, networkOptions = {}) {
        this.options = Object.assign({ recvWindow: 5000, 
            /** Throw errors if any request params are empty */
            strictParamValidation: false }, restOptions);
        this.globalRequestOptions = Object.assign(Object.assign({ 
            /** in ms == 5 minutes by default */
            timeout: 1000 * 60 * 5 }, networkOptions), { headers: {
                'X-CHANNEL-API-CODE': 'hbnni',
                'Content-Type': 'application/json',
                locale: 'en-US',
            } });
        this.baseUrl = (0, requestUtils_1.getRestBaseUrl)(false, restOptions);
        this.apiKey = this.options.apiKey;
        this.apiSecret = this.options.apiSecret;
        this.apiPass = this.options.apiPass;
        // Throw if one of the 3 values is missing, but at least one of them is set
        const credentials = [this.apiKey, this.apiSecret, this.apiPass];
        if (credentials.includes(undefined) &&
            credentials.some((v) => typeof v === 'string')) {
            throw new Error('API Key, Secret & Passphrase are ALL required to use the authenticated REST client');
        }
    }
    get(endpoint, params) {
        return this._call('GET', endpoint, params, true);
    }
    getPrivate(endpoint, params) {
        return this._call('GET', endpoint, params, false);
    }
    post(endpoint, params) {
        return this._call('POST', endpoint, params, true);
    }
    postPrivate(endpoint, params) {
        return this._call('POST', endpoint, params, false);
    }
    deletePrivate(endpoint, params) {
        return this._call('DELETE', endpoint, params, false);
    }
    /**
     * @private Make a HTTP request to a specific endpoint. Private endpoint API calls are automatically signed.
     */
    _call(method, endpoint, params, isPublicApi) {
        return __awaiter(this, void 0, void 0, function* () {
            // Sanity check to make sure it's only ever prefixed by one forward slash
            const requestUrl = [this.baseUrl, endpoint].join(endpoint.startsWith('/') ? '' : '/');
            // Build a request and handle signature process
            const options = yield this.buildRequest(method, endpoint, requestUrl, params, isPublicApi);
            // console.log('full request: ', options);
            // Dispatch request
            return (0, axios_1.default)(options)
                .then((response) => {
                var _a, _b;
                if (response.status == 200) {
                    if (typeof ((_a = response.data) === null || _a === void 0 ? void 0 : _a.code) === 'string' &&
                        ((_b = response.data) === null || _b === void 0 ? void 0 : _b.code) !== '00000') {
                        throw { response };
                    }
                    return response.data;
                }
                throw { response };
            })
                .catch((e) => this.parseException(e));
        });
    }
    /**
     * @private generic handler to parse request exceptions
     */
    parseException(e) {
        if (this.options.parseExceptions === false) {
            throw e;
        }
        // Something happened in setting up the request that triggered an error
        if (!e.response) {
            if (!e.request) {
                throw e.message;
            }
            // request made but no response received
            throw e;
        }
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        const response = e.response;
        // console.error('err: ', response?.data);
        throw {
            code: response.status,
            message: response.statusText,
            body: response.data,
            headers: response.headers,
            requestOptions: Object.assign(Object.assign({}, this.options), { 
                // Prevent credentials from leaking into error messages
                apiPass: 'omittedFromError', apiSecret: 'omittedFromError' }),
        };
    }
    /**
     * @private sign request and set recv window
     */
    signRequest(data, endpoint, method, signMethod) {
        return __awaiter(this, void 0, void 0, function* () {
            const timestamp = Date.now();
            const res = {
                originalParams: Object.assign({}, data),
                sign: '',
                timestamp,
                recvWindow: 0,
                serializedParams: '',
                queryParamsWithSign: '',
            };
            if (!this.apiKey || !this.apiSecret) {
                return res;
            }
            // It's possible to override the recv window on a per rquest level
            const strictParamValidation = this.options.strictParamValidation;
            if (signMethod === 'bitget') {
                const signRequestParams = method === 'GET'
                    ? (0, requestUtils_1.serializeParams)(data, strictParamValidation, '?')
                    : JSON.stringify(data) || '';
                const paramsStr = timestamp + method.toUpperCase() + endpoint + signRequestParams;
                // console.log('sign params: ', paramsStr);
                res.sign = yield (0, node_support_1.signMessage)(paramsStr, this.apiSecret, 'base64');
                res.queryParamsWithSign = signRequestParams;
                return res;
            }
            console.error(new Date(), (0, websocket_util_1.neverGuard)(signMethod, `Unhandled sign method: "${node_support_1.signMessage}"`));
            return res;
        });
    }
    prepareSignParams(method, endpoint, signMethod, params, isPublicApi) {
        return __awaiter(this, void 0, void 0, function* () {
            if (isPublicApi) {
                return {
                    originalParams: params,
                    paramsWithSign: params,
                };
            }
            if (!this.apiKey || !this.apiSecret) {
                throw new Error('Private endpoints require api and private keys set');
            }
            return this.signRequest(params, endpoint, method, signMethod);
        });
    }
    /** Returns an axios request object. Handles signing process automatically if this is a private API call */
    buildRequest(method, endpoint, url, params, isPublicApi) {
        return __awaiter(this, void 0, void 0, function* () {
            const options = Object.assign(Object.assign({}, this.globalRequestOptions), { url: url, method: method });
            for (const key in params) {
                if (typeof params[key] === 'undefined') {
                    delete params[key];
                }
            }
            if (isPublicApi || !this.apiKey || !this.apiPass) {
                return Object.assign(Object.assign({}, options), { params: params });
            }
            const signResult = yield this.prepareSignParams(method, endpoint, 'bitget', params, isPublicApi);
            if (!options.headers) {
                options.headers = {};
            }
            options.headers['ACCESS-KEY'] = this.apiKey;
            options.headers['ACCESS-PASSPHRASE'] = this.apiPass;
            options.headers['ACCESS-TIMESTAMP'] = signResult.timestamp;
            options.headers['ACCESS-SIGN'] = signResult.sign;
            options.headers['Content-Type'] = 'application/json';
            if (method === 'GET') {
                return Object.assign(Object.assign({}, options), { url: options.url + signResult.queryParamsWithSign });
            }
            return Object.assign(Object.assign({}, options), { data: params });
        });
    }
}
exports.default = BaseRestClient;
//# sourceMappingURL=BaseRestClient.js.map