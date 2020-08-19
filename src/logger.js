/* @flow */

import { ZalgoPromise } from 'zalgo-promise/src';
import { request, isBrowser, promiseDebounce, noop, safeInterval, objFilter } from 'belter/src';

import { DEFAULT_LOG_LEVEL, LOG_LEVEL_PRIORITY, AUTO_FLUSH_LEVEL, FLUSH_INTERVAL } from './config';
import { LOG_LEVEL, PROTOCOL } from './constants';

type Payload = { [string] : string | boolean };
type Transport = ({| url : string, method : string, headers : { [string] : string }, json : Object |}) => ZalgoPromise<void>;

type LoggerOptions = {|
    url : string,
    prefix? : string,
    logLevel? : $Values<typeof LOG_LEVEL>,
    transport? : Transport,
    flushInterval? : number
|};

type ClientPayload = { [string] : ?string | ?boolean };
type Log = (name : string, payload? : ClientPayload) => LoggerType; // eslint-disable-line no-use-before-define
type Track = (payload : ClientPayload) => LoggerType; // eslint-disable-line no-use-before-define

type Builder = (Payload) => ClientPayload;
type AddBuilder = (Builder) => LoggerType; // eslint-disable-line no-use-before-define

export type LoggerType = {|
    debug : Log,
    info : Log,
    warn : Log,
    error : Log,

    track : Track,

    flush : () => ZalgoPromise<void>,
    immediateFlush : () => ZalgoPromise<void>,

    addPayloadBuilder : AddBuilder,
    addMetaBuilder : AddBuilder,
    addTrackingBuilder : AddBuilder,
    addHeaderBuilder : AddBuilder,

    setTransport : (Transport) => LoggerType
|};

function httpTransport({ url, method, headers, json } : {| url : string, method : string, headers : { [string] : string }, json : Object |}) : ZalgoPromise<void> {
    if (window.navigator.sendBeacon) {
        return new ZalgoPromise(resolve => {
            resolve(window.navigator.sendBeacon(url, json));
        });
    } else {
        return request({ url, method, headers, json }).then(noop);
    }
}

function extendIfDefined(target : { [string] : string | boolean }, source : { [string] : ?string | ?boolean }) {
    for (const key in source) {
        if (source.hasOwnProperty(key) && source[key] && !target[key]) {
            target[key] = source[key];
        }
    }
}

export function Logger({ url, prefix, logLevel = DEFAULT_LOG_LEVEL, transport = httpTransport, flushInterval = FLUSH_INTERVAL } : LoggerOptions) : LoggerType {

    let events : Array<{| level : $Values<typeof LOG_LEVEL>, event : string, payload : Payload |}> = [];
    let tracking : Array<Payload> = [];

    const payloadBuilders : Array<Builder> = [];
    const metaBuilders : Array<Builder> = [];
    const trackingBuilders : Array<Builder> = [];
    const headerBuilders : Array<Builder> = [];

    function print(level : $Values<typeof LOG_LEVEL>, event : string, payload : Payload) {

        if (!isBrowser() || !window.console || !window.console.log) {
            return;
        }

        if (LOG_LEVEL_PRIORITY.indexOf(level) > LOG_LEVEL_PRIORITY.indexOf(logLevel)) {
            return;
        }

        const args = [ event ];

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

    function immediateFlush() : ZalgoPromise<void> {
        return ZalgoPromise.try(() => {
            if (!isBrowser() || window.location.protocol === PROTOCOL.FILE) {
                return;
            }

            if (!events.length && !tracking.length) {
                return;
            }

            const meta = {};
            for (const builder of metaBuilders) {
                extendIfDefined(meta, builder(meta));
            }

            const headers = {};
            for (const builder of headerBuilders) {
                extendIfDefined(headers, builder(headers));
            }

            const req = transport({
                method: 'POST',
                url,
                headers,
                json:   {
                    events,
                    meta,
                    tracking
                }
            });

            events = [];
            tracking = [];

            return req.then(noop);
        });
    }

    const flush = promiseDebounce(immediateFlush);

    function enqueue(level : $Values<typeof LOG_LEVEL>, event : string, payload : Payload) {

        events.push({
            level,
            event,
            payload
        });

        if (AUTO_FLUSH_LEVEL.indexOf(level) !== -1) {
            flush();
        }
    }

    function log(level : $Values<typeof LOG_LEVEL>, event : string, payload = {}) : LoggerType {

        if (!isBrowser()) {
            return logger; // eslint-disable-line no-use-before-define
        }

        if (prefix) {
            event = `${ prefix }_${ event }`;
        }

        const logPayload : Payload = {
            ...objFilter(payload),
            timestamp: Date.now().toString()
        };

        for (const builder of payloadBuilders) {
            extendIfDefined(logPayload, builder(logPayload));
        }

        enqueue(level, event, logPayload);
        print(level, event, logPayload);

        return logger; // eslint-disable-line no-use-before-define
    }

    function addBuilder(builders, builder) : LoggerType {
        builders.push(builder);
        return logger; // eslint-disable-line no-use-before-define
    }

    function addPayloadBuilder(builder) : LoggerType {
        return addBuilder(payloadBuilders, builder);
    }

    function addMetaBuilder(builder) : LoggerType {
        return addBuilder(metaBuilders, builder);
    }

    function addTrackingBuilder(builder) : LoggerType {
        return addBuilder(trackingBuilders, builder);
    }

    function addHeaderBuilder(builder) : LoggerType {
        return addBuilder(headerBuilders, builder);
    }

    function debug(event, payload) : LoggerType {
        return log(LOG_LEVEL.DEBUG, event, payload);
    }

    function info(event, payload) : LoggerType {
        return log(LOG_LEVEL.INFO, event, payload);
    }

    function warn(event, payload) : LoggerType {
        return log(LOG_LEVEL.WARN, event, payload);
    }

    function error(event, payload) : LoggerType {
        return log(LOG_LEVEL.ERROR, event, payload);
    }

    function track(payload = {}) : LoggerType {
        if (!isBrowser()) {
            return logger; // eslint-disable-line no-use-before-define
        }

        const trackingPayload : Payload = objFilter(payload);

        for (const builder of trackingBuilders) {
            extendIfDefined(trackingPayload, builder(trackingPayload));
        }

        print(LOG_LEVEL.DEBUG, 'track', trackingPayload);
        tracking.push(trackingPayload);

        return logger; // eslint-disable-line no-use-before-define
    }

    function setTransport(newTransport : Transport) : LoggerType {
        transport = newTransport;
        return logger; // eslint-disable-line no-use-before-define
    }

    if (isBrowser()) {
        safeInterval(flush, flushInterval);
    }

    window.addEventListener('beforeunload', () => {
        if (events && events.length) {
            immediateFlush();
        }
    });

    window.addEventListener('unload', () => {
        if (events && events.length) {
            immediateFlush();
        }
    });

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
        addHeaderBuilder,
        setTransport
    };

    return logger;
}
