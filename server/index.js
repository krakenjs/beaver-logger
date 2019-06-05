var util = require('./util');
var url = require('url');

var defaultLogger = {
  log: function(req, level, name, payload) {
    var date = payload.timestamp
      ? new Date(payload.timestamp).toString()
      : new Date().toString();

    var str = [
      name,
      '\t[ ',
      date,
      ' ]\n',
      Object.keys(payload)
        .map(function(key) {
          return '\t' + key + ': ' + payload[key];
        })
        .join('\n'),
      '\n'
    ].join('');

    console[level].call(console, str);
  },

  track: function(req, tracking) {
    console.log(
      '[track]\n',
      Object.keys(tracking)
        .map(function(key) {
          return '\t' + key + ': ' + tracking[key];
        })
        .join('\n'),
      '\n'
    );
  },

  meta: function(req, meta) {
    console.log(
      '[meta]\n',
      Object.keys(meta)
        .map(function(key) {
          return '\t' + key + ': ' + meta[key];
        })
        .join('\n'),
      '\n'
    );
  }
};

var log = (module.exports.log = function log(req, logger, logs) {
  var events = logs.events || [];
  var meta = logs.meta || {};
  var tracking = logs.tracking || {};

  if (Array.isArray(events)) {
    events.forEach(function(event) {
      if (!event.event) {
        return;
      }

      event.level = event.level || 'info';
      event.payload = event.payload || {};

      var _log = logger instanceof Function ? logger : logger.log;

      if (_log instanceof Function) {
        return _log(req, event.level, event.event, event.payload);
      }

      var _logLevel = logger[event.level];

      if (_logLevel instanceof Function) {
        return _logLevel(req, event.event, event.payload);
      }

      defaultLogger.log(req, event.level, event.event, event.payload);
    });
  }

  if (logger.meta) {
    logger.meta(req, meta);
  }

  if (logger.track) {
    logger.track(req, tracking);
  }
});

var handleRequest = (module.exports.handleRequest = function handleRequest(
  req,
  logger
) {
  var method = req.method || 'get';
  var query = req.query || {};
  var body = req.body || {};

  if (method.toLowerCase() === 'post') {
    return log(req, logger, body);
  } else {
    var event = query.event;
    var level = query.level || 'info';
    var state = query.state;

    var payload = util.extend({}, query);

    delete payload.event;
    delete payload.level;
    delete payload.state;

    return log(req, logger, {
      events: [
        {
          level: level,
          event: event,
          payload: payload
        }
      ],
      meta: {
        state: state
      }
    });
  }
});

module.exports.expressEndpoint = function expressEndpoint(options) {
  options = options || {};

  options.uri = options.uri || '/';
  options.logger = options.logger || defaultLogger;

  var app = require('express')();

  app.all(options.uri, function(req, res, next) {
    if (options.enableCors) {
      if (req.get('origin')) {
        var parsedUrl = url.parse(req.get('origin')) || {};
        res.header(
          'Access-Control-Allow-Origin',
          parsedUrl.protocol + '//' + parsedUrl.host
        );
      } else {
        res.header('Access-Control-Allow-Origin', '*');
      }

      res.header('content-type', 'application/json');

      var corsRequestHeaders = req.headers['access-control-request-headers'];

      if (corsRequestHeaders) {
        res.header('Access-Control-Allow-Headers', corsRequestHeaders);
      }

      var corsRequestMethod = req.headers['access-control-request-method'];

      if (corsRequestMethod) {
        res.header('Access-Control-Allow-Methods', corsRequestMethod);
      }
    }

    if (req.method.toLowerCase === 'options') {
      return res.status(200).send('{}');
    }

    try {
      handleRequest(req, options.logger);
      res.status(200).send('{}');
    } catch (err) {
      console.error(err.stack || err.toString());
      res.status(500).send('{}');
    }
  });

  return app;
};
