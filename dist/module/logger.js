import _extends from "@babel/runtime/helpers/esm/extends";
import { ZalgoPromise } from "@krakenjs/zalgo-promise/src";
import { isBrowser, promiseDebounce, noop, safeInterval, objFilter } from "@krakenjs/belter/src";
import { DEFAULT_LOG_LEVEL, LOG_LEVEL_PRIORITY, AUTO_FLUSH_LEVEL, FLUSH_INTERVAL, AMPLITUDE_URL } from "./config";
import { LOG_LEVEL, PROTOCOL } from "./constants";
import { extendIfDefined } from "./util";
import { getHTTPTransport } from "./http";
export function Logger(_ref) {
  var url = _ref.url,
    prefix = _ref.prefix,
    _ref$logLevel = _ref.logLevel,
    logLevel = _ref$logLevel === void 0 ? DEFAULT_LOG_LEVEL : _ref$logLevel,
    _ref$transport = _ref.transport,
    transport = _ref$transport === void 0 ? getHTTPTransport() : _ref$transport,
    amplitudeApiKey = _ref.amplitudeApiKey,
    _ref$flushInterval = _ref.flushInterval,
    flushInterval = _ref$flushInterval === void 0 ? FLUSH_INTERVAL : _ref$flushInterval,
    _ref$enableSendBeacon = _ref.enableSendBeacon,
    enableSendBeacon = _ref$enableSendBeacon === void 0 ? false : _ref$enableSendBeacon;
  var events = [];
  var tracking = [];
  var metrics = [];
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
      args.push("\n\n", payload.error || payload.warning);
    }
    try {
      if (window.console[level] && window.console[level].apply) {
        window.console[level].apply(window.console, args);
      } else if (window.console.log && window.console.log.apply) {
        window.console.log.apply(window.console, args);
      }
    } catch (err) {}
  }
  function immediateFlush() {
    return ZalgoPromise.try(function () {
      if (!isBrowser() || window.location.protocol === PROTOCOL.FILE) {
        return;
      }
      if (!events.length && !tracking.length && !metrics.length) {
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
      var res;
      if (url) {
        res = transport({
          method: "POST",
          url: url,
          headers: headers,
          json: {
            events: events,
            meta: meta,
            tracking: tracking,
            metrics: metrics
          },
          enableSendBeacon: enableSendBeacon
        }).catch(noop);
      }
      if (amplitudeApiKey) {
        transport({
          method: "POST",
          url: AMPLITUDE_URL,
          headers: {},
          json: {
            api_key: amplitudeApiKey,
            events: tracking.map(function (payload) {
              return _extends({
                event_type: payload.transition_name || "event",
                event_properties: payload
              }, payload);
            })
          },
          enableSendBeacon: enableSendBeacon
        }).catch(noop);
      }
      events = [];
      tracking = [];
      metrics = [];
      return ZalgoPromise.resolve(res).then(noop);
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
      return logger;
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
    return logger;
  }
  function addBuilder(builders, builder) {
    builders.push(builder);
    return logger;
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
      return logger;
    }
    var trackingPayload = objFilter(payload);
    for (var _i8 = 0; _i8 < trackingBuilders.length; _i8++) {
      var builder = trackingBuilders[_i8];
      extendIfDefined(trackingPayload, builder(trackingPayload));
    }
    print(LOG_LEVEL.DEBUG, "track", trackingPayload);
    tracking.push(trackingPayload);
    return logger;
  }
  function metric(metricPayload) {
    if (!isBrowser()) {
      return logger;
    }
    print(LOG_LEVEL.DEBUG, "metric." + metricPayload.name, metricPayload.dimensions);
    metrics.push(metricPayload);
    return logger;
  }
  function setTransport(newTransport) {
    transport = newTransport;
    return logger;
  }
  function configure(opts) {
    if (opts.url) {
      url = opts.url;
    }
    if (opts.prefix) {
      prefix = opts.prefix;
    }
    if (opts.logLevel) {
      logLevel = opts.logLevel;
    }
    if (opts.transport) {
      transport = opts.transport;
    }
    if (opts.amplitudeApiKey) {
      amplitudeApiKey = opts.amplitudeApiKey;
    }
    if (opts.flushInterval) {
      flushInterval = opts.flushInterval;
    }
    if (opts.enableSendBeacon) {
      enableSendBeacon = opts.enableSendBeacon;
    }
    return logger;
  }
  if (isBrowser()) {
    safeInterval(flush, flushInterval);
  }
  if (typeof window === "object") {
    window.addEventListener("beforeunload", function () {
      immediateFlush();
    });
    window.addEventListener("unload", function () {
      immediateFlush();
    });
    window.addEventListener("pagehide", function () {
      immediateFlush();
    });
  }
  var logger = {
    debug: debug,
    info: info,
    warn: warn,
    error: error,
    track: track,
    metric: metric,
    flush: flush,
    immediateFlush: immediateFlush,
    addPayloadBuilder: addPayloadBuilder,
    addMetaBuilder: addMetaBuilder,
    addTrackingBuilder: addTrackingBuilder,
    addHeaderBuilder: addHeaderBuilder,
    setTransport: setTransport,
    configure: configure
  };
  return logger;
}