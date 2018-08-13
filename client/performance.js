
import { config } from './config';
import { info } from './logger';
import { addPayloadBuilder } from './builders'
import { onWindowReady, safeInterval } from './util';

let enablePerformance = window &&
    window.performance &&
    performance.now &&
    performance.timing &&
    performance.timing.connectEnd &&
    performance.timing.navigationStart &&
    (Math.abs(performance.now() - Date.now()) > 1000) &&
    (performance.now() - (performance.timing.connectEnd - performance.timing.navigationStart)) > 0;


export function now() {
    if (enablePerformance) {
        return performance.now();
    } else {
        return Date.now();
    }
}

function timer(startTime) {
    startTime = startTime !== undefined ? startTime : now();

    return {
        startTime,

        elapsed() {
            return parseInt(now() - startTime, 10);
        },

        reset() {
            startTime = now();
        }
    };
}

export function reqStartElapsed() {
    if (enablePerformance) {
        let timing = window.performance.timing;
        return parseInt(timing.connectEnd - timing.navigationStart, 10);
    }
}

export let clientTimer = timer();
export let reqTimer = timer(reqStartElapsed());

export function initHeartBeat() {

    let heartBeatTimer = timer();
    let heartbeatCount = 0;

    safeInterval(() => {

        if (config.heartbeatMaxThreshold && (heartbeatCount > config.heartbeatMaxThreshold)) {
            return;
        }

        heartbeatCount += 1;

        let elapsed = heartBeatTimer.elapsed();
        let lag = elapsed - config.heartbeatInterval;

        let heartbeatPayload = {
            count: heartbeatCount,
            elapsed
        };

        if (config.heartbeatTooBusy) {
            heartbeatPayload.lag = lag;

            if (lag >= config.heartbeatTooBusyThreshold) {
                info('toobusy', heartbeatPayload, {
                    noConsole: !config.heartbeatConsoleLog
                });
            }
        }

        info('heartbeat', heartbeatPayload, {
            noConsole: !config.heartbeatConsoleLog
        });

    }, config.heartbeatInterval);
}

export function initPerformance() {

    if (!enablePerformance) {
        return info('no_performance_data');
    }

    addPayloadBuilder(() => {

        let payload = {};

        payload.client_elapsed = clientTimer.elapsed();

        if (enablePerformance) {
            payload.req_elapsed = reqTimer.elapsed();
        }

        return payload;
    });

    onWindowReady().then(() => {

        let keys = [
            'connectEnd', 'connectStart', 'domComplete', 'domContentLoadedEventEnd',
            'domContentLoadedEventStart', 'domInteractive', 'domLoading', 'domainLookupEnd',
            'domainLookupStart', 'fetchStart', 'loadEventEnd', 'loadEventStart', 'navigationStart',
            'redirectEnd', 'redirectStart', 'requestStart', 'responseEnd', 'responseStart',
            'secureConnectionStart', 'unloadEventEnd', 'unloadEventStart'
        ];

        let timing = {};

        keys.forEach(key => {
            timing[key] = parseInt(window.performance.timing[key], 10) || 0;
        });

        let offset = timing.connectEnd - timing.navigationStart;

        if (timing.connectEnd) {
            Object.keys(timing).forEach(name => {
                let time = timing[name];
                if (time) {
                    info(`timing_${name}`, {
                        client_elapsed: parseInt(time - timing.connectEnd - (clientTimer.startTime - offset), 10),
                        req_elapsed: parseInt(time - timing.connectEnd, 10)
                    });
                }
            });
        }

        info('timing', timing);
        info('memory', window.performance.memory);
        info('navigation', window.performance.navigation);

        if (window.performance.getEntries) {
            window.performance.getEntries().forEach(resource => {
                if (['link', 'script', 'img', 'css'].indexOf(resource.initiatorType) > -1) {
                    info(resource.initiatorType, resource);
                }
            });
        }
    });
}
