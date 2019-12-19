"use strict";

exports.__esModule = true;
exports.Logger = Logger;

var _src = require("zalgo-promise/src");

var _src2 = require("belter/src");

var _config = require("./config");

var _constants = require("./constants");

var _util = require("./util");

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

function extendIfDefined(target, source) {
  for (const key in source) {
    if (source.hasOwnProperty(key) && source[key] && !target[key]) {
      target[key] = source[key];
    }
  }
}

function Logger({
  url,
  prefix,
  logLevel = _config.DEFAULT_LOG_LEVEL,
  flushInterval = _config.FLUSH_INTERVAL
}) {
  let events = [];
  let tracking = [];
  const payloadBuilders = [];
  const metaBuilders = [];
  const trackingBuilders = [];
  const headerBuilders = [];

  function print(level, event, payload) {
    if (__BEAVER_LOGGER__.__LITE_MODE__ || !(0, _src2.isBrowser)() || !window.console || !window.console.log) {
      return;
    }

    if (_config.LOG_LEVEL_PRIORITY.indexOf(level) > _config.LOG_LEVEL_PRIORITY.indexOf(logLevel)) {
      return;
    }

    const args = [event];
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

  function buildPayloads() {
    const meta = {};

    for (const builder of metaBuilders) {
      extendIfDefined(meta, builder(meta));
    }

    const headers = {};

    for (const builder of headerBuilders) {
      extendIfDefined(headers, builder(headers));
    }

    return {
      meta,
      headers
    };
  }

  function immediateFlush() {
    if (!(0, _src2.isBrowser)() || window.location.protocol === _constants.PROTOCOL.FILE || !events.length && !tracking.length) {
      if (__BEAVER_LOGGER__.__LITE_MODE__) {
        return;
      } else {
        return _src.ZalgoPromise.resolve();
      }
    }

    const {
      meta,
      headers
    } = buildPayloads();
    const json = {
      events,
      meta,
      tracking
    };
    const method = 'POST';
    events = [];
    tracking = [];

    if (__BEAVER_LOGGER__.__LITE_MODE__) {
      (0, _util.simpleRequest)({
        method,
        url,
        headers,
        json
      });
    } else {
      return (0, _src2.request)({
        method,
        url,
        headers,
        json
      }).then(_src2.noop);
    }
  }

  const flush = __BEAVER_LOGGER__.__LITE_MODE__ ? immediateFlush : (0, _src2.promiseDebounce)(immediateFlush);

  function enqueue(level, event, payload) {
    events.push({
      level,
      event,
      payload
    });

    if (_config.AUTO_FLUSH_LEVEL.indexOf(level) !== -1) {
      flush();
    }
  }

  function log(level, event, payload = {}) {
    if (!(0, _src2.isBrowser)()) {
      return logger; // eslint-disable-line no-use-before-define
    }

    if (prefix) {
      event = `${prefix}_${event}`;
    }

    const logPayload = _extends({}, (0, _src2.objFilter)(payload), {
      timestamp: Date.now().toString()
    });

    for (const builder of payloadBuilders) {
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
    return log(_constants.LOG_LEVEL.DEBUG, event, payload);
  }

  function info(event, payload) {
    return log(_constants.LOG_LEVEL.INFO, event, payload);
  }

  function warn(event, payload) {
    return log(_constants.LOG_LEVEL.WARN, event, payload);
  }

  function error(event, payload) {
    return log(_constants.LOG_LEVEL.ERROR, event, payload);
  }

  function track(payload = {}) {
    if (!(0, _src2.isBrowser)()) {
      return logger; // eslint-disable-line no-use-before-define
    }

    const trackingPayload = (0, _src2.objFilter)(payload);

    for (const builder of trackingBuilders) {
      extendIfDefined(trackingPayload, builder(trackingPayload));
    }

    print(_constants.LOG_LEVEL.DEBUG, 'track', trackingPayload);
    tracking.push(trackingPayload);
    return logger; // eslint-disable-line no-use-before-define
  }

  if ((0, _src2.isBrowser)()) {
    (0, _src2.safeInterval)(flush, flushInterval);
  }

  const logger = {
    debug,
    info,
    warn,
    error,
    track,
    flush,
    immediateFlush,
    addPayloadBuilder,
    addMetaBuilder,
    addTrackingBuilder,
    addHeaderBuilder
  };
  return logger;
}