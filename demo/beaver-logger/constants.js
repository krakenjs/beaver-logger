"use strict";

exports.__esModule = true;
exports.WILDCARD = exports.HTTP_METHOD = exports.HTTP_HEADER = exports.LOG_LEVEL = void 0;
const LOG_LEVEL = {
  DEBUG: 'debug',
  INFO: 'info',
  WARN: 'warn',
  ERROR: 'error'
};
exports.LOG_LEVEL = LOG_LEVEL;
const HTTP_HEADER = {
  ORIGIN: 'origin',
  ACCESS_CONTROL_ALLOW_ORIGIN: 'access-control-allow-origin',
  ACCESS_CONTROL_ALLOW_HEADERS: 'access-control-allow-headers',
  ACCESS_CONTROL_ALLOW_METHODS: 'access-control-allow-methods',
  ACCESS_CONTROL_ALLOW_CREDENTIALS: 'access-control-allow-credentials',
  ACCESS_CONTROL_REQUEST_HEADERS: 'access-control-request-headers',
  ACCESS_CONTROL_REQUEST_METHOD: 'access-control-request-method'
};
exports.HTTP_HEADER = HTTP_HEADER;
const HTTP_METHOD = {
  GET: 'get',
  POST: 'post',
  OPTIONS: 'options'
};
exports.HTTP_METHOD = HTTP_METHOD;
const WILDCARD = '*';
exports.WILDCARD = WILDCARD;