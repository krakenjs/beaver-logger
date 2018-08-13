
import { extend, promiseDebounce, ajax, isIE } from './util';
import { payloadBuilders, metaBuilders, trackingBuilders, headerBuilders } from './builders';
import { config, logLevels } from './config';

export let buffer = [];
export let tracking = [];

let transport = (headers, data, options) => {
    return ajax('post', config.uri, headers, data, options);
}

export function getTransport() {
    return transport;
}

export function setTransport(newTransport) {
    transport = newTransport;
}

let loaded = false;

setTimeout(() => {
    loaded = true;
}, 1);

export function print(level, event, payload) {

    if (typeof window === 'undefined' || !window.console || !window.console.log) {
        return;
    }

    if (!loaded) {
        return setTimeout(() => print(level, event, payload), 1);
    }

    let logLevel = config.logLevel;

    if (window.LOG_LEVEL) {
        logLevel = window.LOG_LEVEL;
    }

    if (logLevels.indexOf(level) > logLevels.indexOf(logLevel)) {
        return;
    }

    payload = payload || {};

    let args = [event];

    if(isIE()){
        payload = JSON.stringify(payload);
    }

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

export function immediateFlush({ fireAndForget = false } = {}) {

    if (typeof window === 'undefined') {
        return;
    }

    if (!config.uri) {
        return;
    }

    let hasBuffer = buffer.length;
    let hasTracking = tracking.length;

    if (!hasBuffer && !hasTracking) {
        return;
    }

    let meta = {};

    for (let builder of metaBuilders) {
        try {
            extend(meta, builder(meta), false);
        } catch (err) {
            console.error('Error in custom meta builder:', err.stack || err.toString());
        }
    }

    let headers = {};

    for (let builder of headerBuilders) {
        try {
            extend(headers, builder(headers), false);
        } catch (err) {
            console.error('Error in custom header builder:', err.stack || err.toString());
        }
    }

    let events = buffer;

    let req = transport(headers, {
        events,
        meta,
        tracking
    }, {
        fireAndForget
    });

    buffer = [];
    tracking = [];

    return req;
}

export let flush = promiseDebounce(immediateFlush, config.debounceInterval);


function enqueue(level, event, payload) {

    buffer.push({
        level,
        event,
        payload
    });

    if (config.autoLog.indexOf(level) > -1) {
        flush();
    }
}


export function log(level, event, payload) {

    if (typeof window === 'undefined') {
        return;
    }

    if (config.prefix) {
        event = `${config.prefix}_${event}`;
    }

    payload = payload || {};

    if (typeof payload === 'string') {
        payload = {
            message: payload
        };
    } else if (payload instanceof Error) {
        payload = {
            error: payload.stack || payload.toString()
        }
    }

    try {
        JSON.stringify(payload);
    } catch (err) {
        return;
    }

    payload.timestamp = Date.now();

    for (let builder of payloadBuilders) {
        try {
            extend(payload, builder(payload), false);
        } catch (err) {
            console.error('Error in custom payload builder:', err.stack || err.toString());
        }
    }

    if (!config.silent) {
        print(level, event, payload);
    }

    if (buffer.length === config.sizeLimit) {
        enqueue('info', 'logger_max_buffer_length');
    }
    else if (buffer.length < config.sizeLimit) {
        enqueue(level, event, payload);
    }
}

export function prefix(name) {

    return {
        debug(event, payload) {
            return log('debug', `${name}_${event}`, payload);
        },

        info(event, payload) {
            return log('info', `${name}_${event}`, payload);
        },

        warn(event, payload) {
            return log('warn', `${name}_${event}`, payload);
        },

        error(event, payload) {
            return log('error', `${name}_${event}`, payload);
        },

        track(payload) {
            return track(payload);
        },

        flush() {
            return flush();
        }
    };
}

export function debug(event, payload) {
    return log('debug', event, payload);
}

export function info(event, payload) {
    return log('info', event, payload);
}

export function warn(event, payload) {
    return log('warn', event, payload);
}

export function error(event, payload) {
    return log('error', event, payload);
}

export function track(payload) {

    if (typeof window === 'undefined') {
        return;
    }

    if (payload) {

        try {
            JSON.stringify(payload);
        } catch (err) {
            return;
        }

        for (let builder of trackingBuilders) {
            try {
                extend(payload, builder(payload), false);
            } catch (err) {
                console.error('Error in custom tracking builder:', err.stack || err.toString());
            }
        }

        print('debug', 'tracking', payload);

        tracking.push(payload);
    }
}
