/* @flow */

import { LOG_LEVEL } from "./constants";

export const AUTO_FLUSH_LEVEL = [LOG_LEVEL.WARN, LOG_LEVEL.ERROR];

export const LOG_LEVEL_PRIORITY = [
  LOG_LEVEL.ERROR,
  LOG_LEVEL.WARN,
  LOG_LEVEL.INFO,
  LOG_LEVEL.DEBUG,
];

export const FLUSH_INTERVAL = 60 * 1000;

export const DEFAULT_LOG_LEVEL: $Values<typeof LOG_LEVEL> = __DEBUG__
  ? LOG_LEVEL.DEBUG
  : LOG_LEVEL.WARN;

export const AMPLITUDE_URL = "https://api2.amplitude.com/2/httpapi";
