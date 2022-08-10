import { ZalgoPromise } from "@krakenjs/zalgo-promise";
import type { CrossDomainWindowType } from "@krakenjs/cross-domain-utils/dist/esm";
export declare type TransportOptions = {
    url: string;
    method: string;
    headers: Record<string, unknown>;
    json: Record<string, unknown>;
    enableSendBeacon?: boolean;
};
export declare type Transport = (arg0: TransportOptions) => ZalgoPromise<void>;
export declare function getHTTPTransport(httpWin?: CrossDomainWindowType): Transport;
