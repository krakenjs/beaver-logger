'use strict';

import * as logger from './logger';
import * as performance from './performance';

if (logger.config.log_performance) {
    performance.init();
}

window.$logger = logger;