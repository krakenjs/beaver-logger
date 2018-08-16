var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

import { ZalgoPromise } from 'zalgo-promise/src';
import { request, isBrowser, promiseDebounce, noop, safeInterval, objFilter } from 'belter/src';

import { DEFAULT_LOG_LEVEL, LOG_LEVEL_PRIORITY, AUTO_FLUSH_LEVEL, FLUSH_INTERVAL } from './config';
import { LOG_LEVEL } from './constants';

function httpTransport(_ref) {
    var url = _ref.url,
        method = _ref.method,
        headers = _ref.headers,
        json = _ref.json;

    return request({ url: url, method: method, headers: headers, json: json }).then(noop);
}

function extendIfDefined(target, source) {
    for (var key in source) {
        if (source.hasOwnProperty(key) && source[key]) {
            target[key] = source[key];
        }
    }
}

export function Logger(_ref2) {
    var url = _ref2.url,
        prefix = _ref2.prefix,
        _ref2$logLevel = _ref2.logLevel,
        logLevel = _ref2$logLevel === undefined ? DEFAULT_LOG_LEVEL : _ref2$logLevel,
        _ref2$transport = _ref2.transport,
        transport = _ref2$transport === undefined ? httpTransport : _ref2$transport,
        _ref2$flushInterval = _ref2.flushInterval,
        flushInterval = _ref2$flushInterval === undefined ? FLUSH_INTERVAL : _ref2$flushInterval;


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

        var consoleLogLevel = logLevel;

        if (window.LOG_LEVEL && LOG_LEVEL_PRIORITY.indexOf(window.LOG_LEVEL) !== -1) {
            consoleLogLevel = window.LOG_LEVEL;
        }

        if (LOG_LEVEL_PRIORITY.indexOf(level) > LOG_LEVEL_PRIORITY.indexOf(consoleLogLevel)) {
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
        } catch (err) {
            // pass
        }
    }

    function immediateFlush() {
        return ZalgoPromise['try'](function () {
            if (!isBrowser()) {
                return;
            }

            if (!events.length && !tracking.length) {
                return;
            }

            var meta = {};

            for (var _i2 = 0, _length2 = metaBuilders == null ? 0 : metaBuilders.length; _i2 < _length2; _i2++) {
                var builder = metaBuilders[_i2];
                extendIfDefined(meta, builder(meta));
            }

            var headers = {};

            for (var _i4 = 0, _length4 = headerBuilders == null ? 0 : headerBuilders.length; _i4 < _length4; _i4++) {
                var _builder = headerBuilders[_i4];
                extendIfDefined(headers, _builder(headers));
            }

            var req = transport({
                method: 'POST',
                url: url,
                headers: headers,
                json: {
                    events: events,
                    meta: meta,
                    tracking: tracking
                }
            });

            events = [];
            tracking = [];

            return req.then(noop);
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

    function log(level, event) {
        var payload = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};


        if (!isBrowser()) {
            return;
        }

        if (prefix) {
            event = prefix + '_' + event;
        }

        var logPayload = _extends({}, objFilter(payload), {
            timestamp: Date.now().toString()
        });

        for (var _i6 = 0, _length6 = payloadBuilders == null ? 0 : payloadBuilders.length; _i6 < _length6; _i6++) {
            var builder = payloadBuilders[_i6];
            extendIfDefined(logPayload, builder(logPayload));
        }

        enqueue(level, event, logPayload);
        print(level, event, logPayload);
    }

    function addPayloadBuilder(builder) {
        payloadBuilders.push(builder);
    }

    function addMetaBuilder(builder) {
        metaBuilders.push(builder);
    }

    function addTrackingBuilder(builder) {
        trackingBuilders.push(builder);
    }

    function addHeaderBuilder(builder) {
        headerBuilders.push(builder);
    }

    function debug(event, payload) {
        log(LOG_LEVEL.DEBUG, event, payload);
    }

    function info(event, payload) {
        log(LOG_LEVEL.INFO, event, payload);
    }

    function warn(event, payload) {
        log(LOG_LEVEL.WARN, event, payload);
    }

    function error(event, payload) {
        log(LOG_LEVEL.ERROR, event, payload);
    }

    function track() {
        var payload = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

        if (!isBrowser()) {
            return;
        }

        var trackingPayload = objFilter(payload);

        for (var _i8 = 0, _length8 = trackingBuilders == null ? 0 : trackingBuilders.length; _i8 < _length8; _i8++) {
            var builder = trackingBuilders[_i8];
            extendIfDefined(trackingPayload, builder(trackingPayload));
        }

        print(LOG_LEVEL.DEBUG, 'track', trackingPayload);
        tracking.push(trackingPayload);
    }

    function setTransport(newTransport) {
        transport = newTransport;
    }

    safeInterval(flush, flushInterval);

    return {
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
}