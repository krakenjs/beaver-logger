import _extends from "@babel/runtime/helpers/esm/extends";
import { ZalgoPromise } from 'zalgo-promise/src';
import { request, isBrowser, promiseDebounce, noop, safeInterval, objFilter } from 'belter/src';
import { DEFAULT_LOG_LEVEL, LOG_LEVEL_PRIORITY, AUTO_FLUSH_LEVEL, FLUSH_INTERVAL } from './config';
import { LOG_LEVEL, PROTOCOL } from './constants';

function httpTransport(_ref) {
  var url = _ref.url,
      method = _ref.method,
      headers = _ref.headers,
      json = _ref.json,
      _ref$enableSendBeacon = _ref.enableSendBeacon,
      enableSendBeacon = _ref$enableSendBeacon === void 0 ? false : _ref$enableSendBeacon;
  var hasHeaders = headers && Object.keys(headers).length;

  if (window && window.navigator.sendBeacon && !hasHeaders && enableSendBeacon && window.Blob) {
    return new ZalgoPromise(function (resolve) {
      var blob = new Blob([JSON.stringify(json)], {
        type: 'application/json'
      });
      resolve(window.navigator.sendBeacon(url, blob));
    });
  } else {
    return request({
      url: url,
      method: method,
      headers: headers,
      json: json
    }).then(noop);
  }
}

function extendIfDefined(target, source) {
  for (var key in source) {
    if (source.hasOwnProperty(key) && source[key] && !target[key]) {
      target[key] = source[key];
    }
  }
}

export function Logger(_ref2) {
  var url = _ref2.url,
      prefix = _ref2.prefix,
      _ref2$logLevel = _ref2.logLevel,
      logLevel = _ref2$logLevel === void 0 ? DEFAULT_LOG_LEVEL : _ref2$logLevel,
      _ref2$transport = _ref2.transport,
      transport = _ref2$transport === void 0 ? httpTransport : _ref2$transport,
      _ref2$flushInterval = _ref2.flushInterval,
      flushInterval = _ref2$flushInterval === void 0 ? FLUSH_INTERVAL : _ref2$flushInterval,
      _ref2$enableSendBeaco = _ref2.enableSendBeacon,
      enableSendBeacon = _ref2$enableSendBeaco === void 0 ? false : _ref2$enableSendBeaco;
  var events = [];
  var tracking = [];
  var payloadBuilders = [];
  var metaBuilders = [];
  var trackingBuilders = [];
  var headerBuilders = [];

  function print(level, event, payload) {
    if (!isBrowser() || !window.console || !window.console.log) {
      return;
    }

    if (LOG_LEVEL_PRIORITY.indexOf(level) > LOG_LEVEL_PRIORITY.indexOf(logLevel)) {
      return;
    }

    var args = [event];
    args.push(payload);

    if (payload.error || payload.warning) {
      args.push('\n\n', payload.error || payload.warning);
    }

    try {
      if (window.console[level] && window.console[level].apply) {
        window.console[level].apply(window.console, args);
      } else if (window.console.log && window.console.log.apply) {
        window.console.log.apply(window.console, args);
      }
    } catch (err) {// pass
    }
  }

  function immediateFlush() {
    return ZalgoPromise.try(function () {
      if (!isBrowser() || window.location.protocol === PROTOCOL.FILE) {
        return;
      }

      if (!events.length && !tracking.length) {
        return;
      }

      var meta = {};

      for (var _i2 = 0; _i2 < metaBuilders.length; _i2++) {
        var builder = metaBuilders[_i2];
        extendIfDefined(meta, builder(meta));
      }

      var headers = {};

      for (var _i4 = 0; _i4 < headerBuilders.length; _i4++) {
        var _builder = headerBuilders[_i4];
        extendIfDefined(headers, _builder(headers));
      }

      var res = transport({
        method: 'POST',
        url: url,
        headers: headers,
        json: {
          events: events,
          meta: meta,
          tracking: tracking
        },
        enableSendBeacon: enableSendBeacon
      });
      events = [];
      tracking = [];
      return res.then(noop);
    });
  }

  var flush = promiseDebounce(immediateFlush);

  function enqueue(level, event, payload) {
    events.push({
      level: level,
      event: event,
      payload: payload
    });

    if (AUTO_FLUSH_LEVEL.indexOf(level) !== -1) {
      flush();
    }
  }

  function log(level, event, payload) {
    if (payload === void 0) {
      payload = {};
    }

    if (!isBrowser()) {
      return logger; // eslint-disable-line no-use-before-define
    }

    if (prefix) {
      event = prefix + "_" + event;
    }

    var logPayload = _extends({}, objFilter(payload), {
      timestamp: Date.now().toString()
    });

    for (var _i6 = 0; _i6 < payloadBuilders.length; _i6++) {
      var builder = payloadBuilders[_i6];
      extendIfDefined(logPayload, builder(logPayload));
    }

    enqueue(level, event, logPayload);
    print(level, event, logPayload);
    return logger; // eslint-disable-line no-use-before-define
  }

  function addBuilder(builders, builder) {
    builders.push(builder);
    return logger; // eslint-disable-line no-use-before-define
  }

  function addPayloadBuilder(builder) {
    return addBuilder(payloadBuilders, builder);
  }

  function addMetaBuilder(builder) {
    return addBuilder(metaBuilders, builder);
  }

  function addTrackingBuilder(builder) {
    return addBuilder(trackingBuilders, builder);
  }

  function addHeaderBuilder(builder) {
    return addBuilder(headerBuilders, builder);
  }

  function debug(event, payload) {
    return log(LOG_LEVEL.DEBUG, event, payload);
  }

  function info(event, payload) {
    return log(LOG_LEVEL.INFO, event, payload);
  }

  function warn(event, payload) {
    return log(LOG_LEVEL.WARN, event, payload);
  }

  function error(event, payload) {
    return log(LOG_LEVEL.ERROR, event, payload);
  }

  function track(payload) {
    if (payload === void 0) {
      payload = {};
    }

    if (!isBrowser()) {
      return logger; // eslint-disable-line no-use-before-define
    }

    var trackingPayload = objFilter(payload);

    for (var _i8 = 0; _i8 < trackingBuilders.length; _i8++) {
      var builder = trackingBuilders[_i8];
      extendIfDefined(trackingPayload, builder(trackingPayload));
    }

    print(LOG_LEVEL.DEBUG, 'track', trackingPayload);
    tracking.push(trackingPayload);
    return logger; // eslint-disable-line no-use-before-define
  }

  function setTransport(newTransport) {
    transport = newTransport;
    return logger; // eslint-disable-line no-use-before-define
  }

  if (isBrowser()) {
    safeInterval(flush, flushInterval);
  }

  if (typeof window === 'object') {
    window.addEventListener('beforeunload', function () {
      immediateFlush();
    });
    window.addEventListener('unload', function () {
      immediateFlush();
    });
  }

  var logger = {
    debug: debug,
    info: info,
    warn: warn,
    error: error,
    track: track,
    flush: flush,
    immediateFlush: immediateFlush,
    addPayloadBuilder: addPayloadBuilder,
    addMetaBuilder: addMetaBuilder,
    addTrackingBuilder: addTrackingBuilder,
    addHeaderBuilder: addHeaderBuilder,
    setTransport: setTransport
  };
  return logger;
}