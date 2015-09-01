'use strict';

import Promise from 'promise';
import {extend, promiseDebounce} from './util';


export var config = {

    uri: '/api/log',

    flushInterval:    10 * 60 * 1000,
    debounceInterval: 10,

    sizeLimit: 300,

    heartbeatInterval:    5000,
    hearbeatMaxThreshold: 50,

    autoLog: ['warn', 'error'],

    log_unload:       true,
    log_beforeunload: true,
    log_performance:  true
};


export function init(conf) {
    extend(config, conf);

    if (config.log_beforeunload) {
        window.addEventListener('beforeunload', function() {
            info('window_beforeunload');
            flush();
        });
    }

    if (config.log_unload) {
        window.addEventListener('unload', function () {
            info('window_unload');
            flush();
        });
    }

    if (config.flushInterval) {
        setInterval(flush, config.flushInterval);
    }
}



export var buffer = [];

export function log(level, event, payload) {

    setTimeout(function() {
        payload = payload || {};

        print(level, event, payload);

        if (buffer.length === config.sizeLimit) {
            enqueue('info', 'logger_max_buffer_length');
        }
        else if (buffer.length < config.sizeLimit) {
            enqueue(level, event, payload);
        }
    });
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


function print(level, event, payload) {

    if (!window.console || !window.console.log) {
        return;
    }

    var args = [event];

    if (payload) {
        args.push(payload);

        if (payload.error || payload.warning) {
            args.push('\n\n', payload.error || payload.warning);
        }
    }

    (window.console[level] || window.console.log).apply(window.console, args);
}


function enqueue(level, event, payload) {

    payload = payload || {};

    payload.timestamp = Date.now();

    payloadBuilders.forEach(function(payloadBuilder) {
        try {
            extend(payload, payloadBuilder());
        }
        catch (e) {
            console.error('Error building logger payload', e);
        }
    });

    var data = {
        level: level,
        event: event,
        payload: payload
    };

    buffer.push(data);

    if (config.autoLog.indexOf(level) > -1) {
        flush();
    }
}


export var flush = promiseDebounce(function() {

    if (!buffer.length) {
        return Promise.resolve();
    }

    var req = ajax('post', config.uri, {
        events: buffer
    });

    buffer = [];

    return req;

}, config.debounceInterval);



function ajax(method, url, data) {

    return new Promise(function (resolve) {
        var XRequest = window.XMLHttpRequest || window.ActiveXObject;
        var req = new XRequest('MSXML2.XMLHTTP.3.0');
        req.open(method.toUpperCase(), url, true);
        req.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
        req.setRequestHeader('Content-type', 'application/json');
        req.onreadystatechange = function () {
            if (req.readyState > 3) {
                resolve();
            }
        };
        req.send(JSON.stringify(data).replace(/&/g, '%26'));
    });
}

(window.beaconQueue || []).forEach(function(payload) {
    log(payload.level, payload.event, payload);
});


var payloadBuilders = [];

export function addPayloadBuilder(builder) {
    payloadBuilders.push(builder);
}
