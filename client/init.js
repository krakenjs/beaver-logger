
import { config } from './config';
import { extend } from './util';
import { initPerformance, initHeartBeat } from './performance';
import { log, info, flush, immediateFlush } from './logger';

let initiated = false;

export function init(conf) {
    extend(config, conf || {});

    if (initiated) {
        return;
    }

    initiated = true;

    if (config.logPerformance) {
        initPerformance();
    }

    if (config.heartbeat) {
        initHeartBeat();
    }

    if (config.logUnload) {
        window.addEventListener('beforeunload', () => {
            info('window_beforeunload');
            immediateFlush({ fireAndForget: true });
        });

        window.addEventListener('unload', () => {
            info('window_unload');
            immediateFlush({ fireAndForget: true });
        });
    }

    if (config.flushInterval) {
        setInterval(flush, config.flushInterval);
    }

    if (window.beaverLogQueue) {
        window.beaverLogQueue.forEach(payload => {
            log(payload.level, payload.event, payload);
        });
        delete window.beaverLogQueue;
    }
}
