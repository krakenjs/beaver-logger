"use strict";

exports.__esModule = true;
exports.DEFAULT_LOG_LEVEL = exports.FLUSH_INTERVAL = exports.LOG_LEVEL_PRIORITY = exports.AUTO_FLUSH_LEVEL = void 0;

var _constants = require("./constants");

const AUTO_FLUSH_LEVEL = [_constants.LOG_LEVEL.WARN, _constants.LOG_LEVEL.ERROR];
exports.AUTO_FLUSH_LEVEL = AUTO_FLUSH_LEVEL;
const LOG_LEVEL_PRIORITY = [_constants.LOG_LEVEL.ERROR, _constants.LOG_LEVEL.WARN, _constants.LOG_LEVEL.INFO, _constants.LOG_LEVEL.DEBUG];
exports.LOG_LEVEL_PRIORITY = LOG_LEVEL_PRIORITY;
const FLUSH_INTERVAL = 60 * 1000;
exports.FLUSH_INTERVAL = FLUSH_INTERVAL;
const DEFAULT_LOG_LEVEL = __DEBUG__ ? _constants.LOG_LEVEL.DEBUG : _constants.LOG_LEVEL.WARN;
exports.DEFAULT_LOG_LEVEL = DEFAULT_LOG_LEVEL;