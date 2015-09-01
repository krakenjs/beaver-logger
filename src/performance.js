
import * as logger from './logger';
import Promise from 'promise';
import {windowReady} from './util';

var enablePerformance =
    window.performance &&
    performance.now &&
    performance.timing &&
    performance.timing.connectEnd &&
    performance.timing.navigationStart &&
    (Math.abs(performance.now() - Date.now()) > 1000) &&
    (performance.now() - (performance.timing.connectEnd - performance.timing.navigationStart)) > 0;


if (enablePerformance) {
    window.clientStartTime = window.clientStartTime || parseInt(window.performance.now());

    function timestamp() {
        var perf = window.performance;
        return parseInt(perf.now() - (perf.timing.connectEnd - perf.timing.navigationStart), 10);
    }

    var howBusy = {
        lastSampledTime: timestamp(),
        lastLag: 0,
        maxLag: 0,
        dampendedLag: 0
    };

    var count = 0;

    setInterval(function () {

        if (!logger.buffer.length || logger.buffer[logger.buffer.length - 1].event !== 'heartbeat') {
            count = 0;
        }

        if (!logger.buffer.length || count > logger.config.hearbeatMaxThreshold) {
            return;
        }

        count += 1;

        var payload = {
            count: count
        };

        var now = timestamp();

        howBusy.lastLag = now - howBusy.lastSampledTime - logger.config.heartbeatInterval;
        howBusy.maxLag = howBusy.lastLag > howBusy.maxLag ? howBusy.lastLag : howBusy.maxLag;
        howBusy.dampendedLag = (howBusy.lastLag + howBusy.dampendedLag * 2) / 3;
        howBusy.lastSampledTime = now;

        payload.lastLag = howBusy.lastLag.toFixed(4);
        payload.maxLag = howBusy.maxLag.toFixed(4);
        payload.dampendedLag = howBusy.dampendedLag.toFixed(4);
        payload.lastSampledTime = howBusy.lastSampledTime.toFixed(4);

        if (howBusy.lastLag > 10000) {
            logger.info('toobusy', {}, {
                noConsole: true,
                unique: true
            });
        }

        logger.info('heartbeat', payload, {
            noConsole: true
        });

    }, logger.config.heartbeatInterval);


    logger.addPayloadBuilder(function() {

        var performance = window.performance;
        var timing      = performance.timing || {};
        var now         = performance.now();

        var payload = {};

        if (payload.client_elapsed === undefined) {
            payload.client_elapsed = parseInt(now - window.clientStartTime, 10);
        }

        if (timing.connectEnd && timing.navigationStart && payload.req_elapsed === undefined) {
            payload.req_elapsed = parseInt(now - (timing.connectEnd - timing.navigationStart), 10);
        }

        return payload;
    });

    if (logger.config.log_performance) {
        windowReady.then(function() {

            var keys = [
                'connectEnd', 'connectStart', 'domComplete', 'domContentLoadedEventEnd',
                'domContentLoadedEventStart', 'domInteractive', 'domLoading', 'domainLookupEnd',
                'domainLookupStart', 'fetchStart', 'loadEventEnd', 'loadEventStart', 'navigationStart',
                'redirectEnd', 'redirectStart', 'requestStart', 'responseEnd', 'responseStart',
                'secureConnectionStart', 'unloadEventEnd', 'unloadEventStart'
            ];

            var timing = {};

            keys.forEach(function(key) {
                timing[key] = parseInt(window.performance.timing[key], 10) || 0;
            });

            var offset = timing.connectEnd - timing.navigationStart;

            if (timing.connectEnd) {
                Object.keys(timing).forEach(function(name) {
                    var time = timing[name];
                    if (time) {
                        logger.info('timing_' + name, {
                            client_elapsed: time - timing.connectEnd - (window.clientStartTime - offset),
                            req_elapsed: time - timing.connectEnd
                        });
                    }
                });
            }

            logger.info('timing', timing);
            logger.info('memory', window.performance.memory);
            logger.info('navigation', window.performance.navigation);

            if (window.performance.getEntries) {
                angular.forEach(window.performance.getEntries(), function(resource) {
                    if (['link', 'script', 'img', 'css'].indexOf(resource.initiatorType) > -1) {
                        logger.info(resource.initiatorType, resource);
                    }
                });
            }

            if (timing.connectEnd && timing.navigationStart) {
                logger.info('js_init', {
                    client_elapsed: 0,
                    req_elapsed: window.clientStartTime - offset
                });
            }
        });
    }
}
else {
    logger.info('no_performance_data');
}