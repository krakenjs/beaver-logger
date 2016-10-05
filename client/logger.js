
import { extend, promiseDebounce, ajax } from './util';
import { payloadBuilders, metaBuilders, trackingBuilders, headerBuilders } from './builders';
import { config } from './config';

export let buffer = [];
export let tracking = {};

if (Function.prototype.bind && window.console && typeof console.log === 'object') {
    [ 'log', 'info', 'warn', 'error' ].forEach(function(method) {
        console[method] = this.bind(console[method], console);
    }, Function.prototype.call);
}

export function print(level, event, payload) {

    if (!window.console || !window.console.log) {
        return;
    }

    payload = payload || {};

    let args = [event];

    args.push(payload);

    if (payload.error || payload.warning) {
        args.push('\n\n', payload.error || payload.warning);
    }

    if (window.console) {

        if (window.console[level] && window.console[level].apply) {
            window.console[level].apply(window.console, args);
        } else if (window.console.log && window.console.log.apply) {
            window.console.log.apply(window.console, args);
        }
    }
}

export function immediateFlush(async=true) {

    if (!config.uri) {
        return;
    }

    let hasBuffer = buffer.length;
    let hasTracking = Object.keys(tracking).length;

    if (!hasBuffer && !hasTracking) {
        return;
    }

    if (hasTracking) {
        print('info', 'tracking', tracking);
    }

    let meta = {};

    for (let builder of metaBuilders) {
        try {
            extend(meta, builder(), false);
        } catch (err) {
            console.error('Error in custom meta builder:', err.stack || err.toString());
        }
    }

    for (let builder of trackingBuilders) {
        try {
            extend(tracking, builder(), false);
        } catch (err) {
            console.error('Error in custom tracking builder:', err.stack || err.toString());
        }
    }

    let headers = {};

    for (let builder of headerBuilders) {
        try {
            extend(headers, builder(), false);
        } catch (err) {
            console.error('Error in custom header builder:', err.stack || err.toString());
        }
    }

    let events = buffer;

    let req = ajax('post', config.uri, headers, {
        events,
        meta,
        tracking
    }, async);

    buffer = [];
    tracking = {};

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

    payload.timestamp = Date.now();

    for (let builder of payloadBuilders) {
        try {
            extend(payload, builder(), false);
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
    extend(tracking, payload || {}, false);
}
