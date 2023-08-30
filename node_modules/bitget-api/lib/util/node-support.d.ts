/** This is async because the browser version uses a promise (browser-support) */
export declare function signMessage(message: string, secret: string, method: 'hex' | 'base64'): Promise<string>;
