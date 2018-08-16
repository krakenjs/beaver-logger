/* @flow */

import { ZalgoPromise } from 'zalgo-promise/src';
import { request, isBrowser, promiseDebounce, noop, safeInterval, objFilter } from 'belter/src';

import { DEFAULT_LOG_LEVEL, LOG_LEVEL_PRIORITY, AUTO_FLUSH_LEVEL, FLUSH_INTERVAL } from './config';
import { LOG_LEVEL } from './constants';

type Transport = ({ url : string, method : string, headers : Payload, json : Object }) => ZalgoPromise<void>;

type LoggerOptions = {
    url : string,
    prefix? : string,
    logLevel? : $Values<typeof LOG_LEVEL>,
    transport? : Transport,
    flushInterval? : number
};

type ClientPayload = { [string]: ?string };
type Payload = { [string] : string };
type Log = (name : string, payload? : ClientPayload) => void;
type Track = (payload : ClientPayload) => void;

type Builder = (Payload) => ClientPayload;
type AddBuilder = (Builder) => void;

type LoggerType = {
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

    setTransport : (Transport) => void
};

function httpTransport({ url, method, headers, json } : { url : string, method : string, headers : { [string] : string }, json : Object }) : ZalgoPromise<void> {
    return request({ url, method, headers, json }).then(noop);
}

function extendIfDefined(target : { [string] : string }, source : { [string] : ?string }) {
    for (let key in source) {
        if (source.hasOwnProperty(key) && source[key]) {
            target[key] = source[key];
        }
    }
}

export function Logger({ url, prefix, logLevel = DEFAULT_LOG_LEVEL, transport = httpTransport, flushInterval = FLUSH_INTERVAL } : LoggerOptions) : LoggerType {

    let events : Array<{ level : $Values<typeof LOG_LEVEL>, event : string, payload : Payload }> = [];
    let tracking : Array<Payload> = [];

    let payloadBuilders : Array<Builder> = [];
    let metaBuilders : Array<Builder> = [];
    let trackingBuilders : Array<Builder> = [];
    let headerBuilders : Array<Builder> = [];

    function print(level : $Values<typeof LOG_LEVEL>, event : string, payload : Payload) {

        if (!isBrowser() || !window.console || !window.console.log) {
            return;
        }

        let consoleLogLevel = logLevel;

        if (window.LOG_LEVEL && LOG_LEVEL_PRIORITY.indexOf(window.LOG_LEVEL) !== -1) {
            consoleLogLevel = window.LOG_LEVEL;
        }

        if (LOG_LEVEL_PRIORITY.indexOf(level) > LOG_LEVEL_PRIORITY.indexOf(consoleLogLevel)) {
            return;
        }

        let args = [ event ];

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
            if (!isBrowser()) {
                return;
            }

            if (!events.length && !tracking.length) {
                return;
            }

            let meta = {};
            for (let builder of metaBuilders) {
                extendIfDefined(meta, builder(meta));
            }

            let headers = {};
            for (let builder of headerBuilders) {
                extendIfDefined(headers, builder(headers));
            }

            let req = transport({
                method: 'POST',
                url,
                headers,
                json: {
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

    let flush = promiseDebounce(immediateFlush);

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

    function log(level : $Values<typeof LOG_LEVEL>, event : string, payload = {}) {

        if (!isBrowser()) {
            return;
        }

        if (prefix) {
            event = `${ prefix }_${ event }`;
        }

        let logPayload : Payload = {
            ...objFilter(payload),
            timestamp: Date.now().toString()
        };

        for (let builder of payloadBuilders) {
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

    function track(payload = {}) {
        if (!isBrowser()) {
            return;
        }

        let trackingPayload : Payload = objFilter(payload);

        for (let builder of trackingBuilders) {
            extendIfDefined(trackingPayload, builder(trackingPayload));
        }

        print(LOG_LEVEL.DEBUG, 'track', trackingPayload);
        tracking.push(trackingPayload);
    }

    function setTransport(newTransport : Transport) {
        transport = newTransport;
    }

    if (isBrowser()) {
        safeInterval(flush, flushInterval);
    }

    return {
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
}
