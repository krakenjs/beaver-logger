import { ZalgoPromise } from '@krakenjs/zalgo-promise/src';
import { request, noop } from '@krakenjs/belter/src';
import { isSameDomain, assertSameDomain } from '@krakenjs/cross-domain-utils/src';
import { canUseSendBeacon, isAmplitude, sendBeacon } from './util';
export function getHTTPTransport(httpWin) {
  if (httpWin === void 0) {
    httpWin = window;
  }

  var win = isSameDomain(httpWin) ? assertSameDomain(httpWin) : window;
  return function (_ref) {
    var url = _ref.url,
        method = _ref.method,
        headers = _ref.headers,
        json = _ref.json,
        _ref$enableSendBeacon = _ref.enableSendBeacon,
        enableSendBeacon = _ref$enableSendBeacon === void 0 ? false : _ref$enableSendBeacon;
    return ZalgoPromise.try(function () {
      var beaconResult = false;

      if (canUseSendBeacon({
        headers: headers,
        enableSendBeacon: enableSendBeacon
      })) {
        if (isAmplitude(url)) {
          beaconResult = sendBeacon({
            win: win,
            url: url,
            data: json,
            useBlob: false
          });
        } else {
          beaconResult = sendBeacon({
            win: win,
            url: url,
            data: json,
            useBlob: true
          });
        }
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