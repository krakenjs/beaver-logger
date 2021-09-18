import { AMPLITUDE_URL } from './config';

var canUseSendBeacon = function canUseSendBeacon(_ref) {
  var headers = _ref.headers,
      enableSendBeacon = _ref.enableSendBeacon;
  var hasHeaders = headers && Object.keys(headers).length;

  if (window && window.navigator.sendBeacon && !hasHeaders && enableSendBeacon && window.Blob) {
    return true;
  }

  return false;
};

var isAmplitude = function isAmplitude(url) {
  if (url === AMPLITUDE_URL) {
    return true;
  }

  return false;
};

var sendBeacon = function sendBeacon(_ref2) {
  var url = _ref2.url,
      data = _ref2.data,
      _ref2$useBlob = _ref2.useBlob,
      useBlob = _ref2$useBlob === void 0 ? true : _ref2$useBlob;

  try {
    var json = JSON.stringify(data);

    if (useBlob) {
      var blob = new Blob([json], {
        type: 'application/json'
      });
      return window.navigator.sendBeacon(url, blob);
    } // eslint-disable-next-line compat/compat


    return window.navigator.sendBeacon(url, json);
  } catch (e) {
    return false;
  }
};

var extendIfDefined = function extendIfDefined(target, source) {
  for (var key in source) {
    if (source.hasOwnProperty(key)) {
      target[key] = source[key];
    }
  }
};

export { canUseSendBeacon, extendIfDefined, isAmplitude, sendBeacon };