// @ts-ignore
import { ZalgoPromise } from "@krakenjs/zalgo-promise";
// @ts-ignore
import { request, noop } from "@krakenjs/belter/dist/esm"; // eslint-disable-line import/named
import type { CrossDomainWindowType } from "@krakenjs/cross-domain-utils/dist/esm";
import {
  isSameDomain,
  assertSameDomain,
} from "@krakenjs/cross-domain-utils/dist/esm";

import { canUseSendBeacon, isAmplitude, sendBeacon } from "./util";

export type TransportOptions = {
  url: string;
  method: string;
  headers: Record<string, unknown>;
  json: Record<string, unknown>;
  enableSendBeacon?: boolean;
};

export type Transport = (arg0: TransportOptions) => ZalgoPromise<void>;

export function getHTTPTransport(
  httpWin: CrossDomainWindowType = window
): Transport {
  const win = isSameDomain(httpWin) ? assertSameDomain(httpWin) : window;
  return ({
    url,
    method,
    headers,
    json,
    enableSendBeacon = false,
  }: TransportOptions): ZalgoPromise<void> => {
    return ZalgoPromise.try(() => {
      let beaconResult = false;

      if (
        canUseSendBeacon({
          headers,
          enableSendBeacon,
        })
      ) {
        if (isAmplitude(url)) {
          beaconResult = sendBeacon({
            win,
            url,
            data: JSON,
            useBlob: false,
          });
        } else {
          beaconResult = sendBeacon({
            win,
            url,
            data: JSON,
            useBlob: true,
          });
        }
      }

      return beaconResult
        ? beaconResult
        : request({
            win,
            url,
            method,
            // @ts-expect-error idk
            headers,
            json,
          });
    }).then(noop);
  };
}
