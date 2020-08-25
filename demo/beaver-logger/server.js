"use strict";

exports.__esModule = true;
exports.log = log;
exports.handleRequest = handleRequest;
exports.expressEndpoint = expressEndpoint;
exports.defaultLogger = void 0;

var _url = _interopRequireDefault(require("url"));

var _constants = require("./constants");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* eslint no-console: 0 */
const defaultLogger = {
  log(req, level, name, payload) {
    const date = payload.timestamp ? new Date(payload.timestamp).toString() : new Date().toString();
    const str = [name, '\t[ ', date, ' ]\n', Object.keys(payload).map(key => {
      return `\t${key}: ${payload[key]}`;
    }).join('\n'), '\n'].join('');
    console[level](str);
  },

  track(req, tracking) {
    console.log('[track]\n', Object.keys(tracking).map(key => {
      return `\t${key}: ${tracking[key]}`;
    }).join('\n'), '\n');
  },

  meta(req, meta) {
    console.log('[meta]\n', Object.keys(meta).map(key => {
      return `\t${key}: ${meta[key]}`;
    }).join('\n'), '\n');
  }

};
exports.defaultLogger = defaultLogger;

function log(req, logger, logs) {
  const events = logs.events || [];
  const tracking = logs.tracking || [];
  const meta = logs.meta || {};

  if (logger.log) {
    events.forEach(event => {
      if (!event.event) {
        return;
      }

      const name = event.event.replace(/_*[^a-zA-Z0-9_]+_*/g, '_');
      const level = event.level || _constants.LOG_LEVEL.INFO;
      const payload = event.payload || {};
      return logger.log(req, level, name, payload);
    });
  }

  if (logger.meta) {
    logger.meta(req, meta);
  }

  if (logger.track) {
    tracking.forEach(track => {
      logger.track(req, track);
    });
  }
}

function handleRequest(req, logger) {
  // $FlowFixMe
  const method = req.method || _constants.HTTP_METHOD.GET; // $FlowFixMe

  const query = req.query; // $FlowFixMe

  const body = req.body;

  if (method.toLowerCase() === 'post') {
    const {
      events,
      tracking,
      meta
    } = body;
    log(req, logger, {
      events,
      tracking,
      meta
    });
  } else {
    const {
      event,
      level = _constants.LOG_LEVEL.INFO,
      ...payload
    } = query;
    log(req, logger, {
      events: [{
        level,
        event,
        payload
      }]
    });
  }
}

function sendCorsHeaders(req, res) {
  const origin = req.get(_constants.HTTP_HEADER.ORIGIN);

  if (origin) {
    const parsedUrl = _url.default.parse(origin) || {};

    if (!parsedUrl.protocol || !parsedUrl.host) {
      res.header(_constants.HTTP_HEADER.ACCESS_CONTROL_ALLOW_ORIGIN, _constants.WILDCARD);
    } else {
      res.header(_constants.HTTP_HEADER.ACCESS_CONTROL_ALLOW_ORIGIN, `${parsedUrl.protocol}//${parsedUrl.host}`);
    }
  } else {
    res.header(_constants.HTTP_HEADER.ACCESS_CONTROL_ALLOW_ORIGIN, _constants.WILDCARD);
  }

  const corsRequestHeaders = req.headers[_constants.HTTP_HEADER.ACCESS_CONTROL_REQUEST_HEADERS];

  if (corsRequestHeaders) {
    res.header(_constants.HTTP_HEADER.ACCESS_CONTROL_ALLOW_HEADERS, corsRequestHeaders);
  }

  const corsRequestMethod = req.headers[_constants.HTTP_HEADER.ACCESS_CONTROL_REQUEST_METHOD];

  if (corsRequestMethod) {
    res.header(_constants.HTTP_HEADER.ACCESS_CONTROL_ALLOW_METHODS, corsRequestMethod);
  }

  res.header(_constants.HTTP_HEADER.ACCESS_CONTROL_ALLOW_CREDENTIALS, 'true');
}

function expressEndpoint({
  uri = '/',
  logger = defaultLogger,
  enableCors = false
} = {}) {
  // $FlowFixMe
  const app = require('express')();

  const bodyParser = require('body-parser');

  app.use(bodyParser.text({
    type: 'text/plain'
  }));
  app.use(bodyParser.json());
  app.all(uri, (req, res) => {
    if (enableCors) {
      sendCorsHeaders(req, res);
    }

    if (req.method.toLowerCase() === _constants.HTTP_METHOD.OPTIONS) {
      return res.status(200).send();
    }

    if (req.method.toLowerCase() === _constants.HTTP_METHOD.POST && !req.body) {
      return res.status(400).send(req);
    }

    try {
      handleRequest(req, logger);
      res.status(200).header('content-type', 'application/json').json({});
    } catch (err) {
      console.error(err.stack || err.toString());
      res.status(500).header('content-type', 'application/json').json({});
    }
  });
  return app;
}