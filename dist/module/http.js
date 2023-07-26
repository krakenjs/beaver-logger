import { ZalgoPromise } from "@krakenjs/zalgo-promise/src";
import { request, noop } from "@krakenjs/belter/src";
import { isSameDomain, assertSameDomain } from "@krakenjs/cross-domain-utils/src";
import { canUseSendBeacon, sendBeacon } from "./util";
export function getHTTPTransport(httpWin) {
  return function (_ref) {
    var url = _ref.url,
      method = _ref.method,
      headers = _ref.headers,
      json = _ref.json,
      _ref$enableSendBeacon = _ref.enableSendBeacon,
      enableSendBeacon = _ref$enableSendBeacon === void 0 ? false : _ref$enableSendBeacon;
    return ZalgoPromise.try(function () {
      var httpWindow = httpWin ? httpWin : window;
      var win = isSameDomain(httpWindow) ? assertSameDomain(httpWindow) : window;
      var beaconResult = false;
      if (canUseSendBeacon({
        headers: headers,
        enableSendBeacon: enableSendBeacon
      })) {
        beaconResult = sendBeacon({
          win: win,
          url: url,
          data: json,
          useBlob: true
        });
      }
      return beaconResult ? beaconResult : request({
        win: win,
        url: url,
        method: method,
        headers: headers,
        json: json
      });
    }).then(noop);
  };
}