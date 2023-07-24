/* @flow */

import { ZalgoPromise } from "@krakenjs/zalgo-promise/src";
import { request, noop } from "@krakenjs/belter/src";
import {
  isSameDomain,
  assertSameDomain,
  type CrossDomainWindowType,
} from "@krakenjs/cross-domain-utils/src";

import { canUseSendBeacon, sendBeacon } from "./util";

export type TransportOptions = {|
  url: string,
  method: string,
  headers: { [string]: string },
  json: Object,
  enableSendBeacon?: boolean,
|};

export type Transport = (TransportOptions) => ZalgoPromise<void>;

export function getHTTPTransport(httpWin?: CrossDomainWindowType): Transport {
  return ({
    url,
    method,
    headers,
    json,
    enableSendBeacon = false,
  }: TransportOptions): ZalgoPromise<void> => {
    return ZalgoPromise.try(() => {
      const httpWindow = httpWin ? httpWin : window;
      const win = isSameDomain(httpWindow)
        ? assertSameDomain(httpWindow)
        : window;
      let beaconResult = false;

      if (canUseSendBeacon({ headers, enableSendBeacon })) {
        beaconResult = sendBeacon({ win, url, data: json, useBlob: true });
      }

      return beaconResult
        ? beaconResult
        : request({ win, url, method, headers, json });
    }).then(noop);
  };
}
