/* @flow */

import { ZalgoPromise } from 'zalgo-promise/src';
import { request, noop } from 'belter/src';
import { isSameDomain, assertSameDomain, type CrossDomainWindowType } from 'cross-domain-utils/src';

import { canUseSendBeacon, isAmplitude, sendBeacon } from './util';

export type TransportOptions = {|
    url : string,
    method : string,
    headers : { [string] : string },
    json : Object,
    enableSendBeacon? : boolean
|};

export type Transport = (TransportOptions) => ZalgoPromise<void>;

export function getHTTPTransport(httpWin : CrossDomainWindowType = window) : Transport {
    const win = isSameDomain(httpWin) ? assertSameDomain(httpWin) : window;

    return ({ url, method, headers, json, enableSendBeacon = false } : TransportOptions) : ZalgoPromise<void> => {
        return ZalgoPromise.try(() => {
            let beaconResult = false;

            if (canUseSendBeacon({ headers, enableSendBeacon })) {
                if (isAmplitude(url)) {
                    beaconResult = sendBeacon({ win, url, data: json, useBlob: false });
                } else {
                    beaconResult = sendBeacon({ win, url, data: json, useBlob: true });
                }
            }

            return beaconResult ? beaconResult : request({ win, url, method, headers, json });
        }).then(noop);
    };
}
