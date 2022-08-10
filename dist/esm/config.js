import { LOG_LEVEL } from "./constants";
export var AUTO_FLUSH_LEVEL = [LOG_LEVEL.WARN, LOG_LEVEL.ERROR];
export var LOG_LEVEL_PRIORITY = [LOG_LEVEL.ERROR, LOG_LEVEL.WARN, LOG_LEVEL.INFO, LOG_LEVEL.DEBUG];
export var FLUSH_INTERVAL = 60 * 1000; // eslint-disable-next-line no-constant-condition

export var DEFAULT_LOG_LEVEL = "__DEBUG__" ? LOG_LEVEL.DEBUG : LOG_LEVEL.WARN;
export var AMPLITUDE_URL = "https://api2.amplitude.com/2/httpapi";