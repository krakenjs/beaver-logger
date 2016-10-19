beaver-logger
------------

Front-end logger, which will:

- Buffer your front-end logs and periodically send them to the server side
- Allow you to log page transitions and gather performance stats
- Automatically log window performance stats, where available, and watch for event loop delays
- Automatically flush logs for any errors or warnings

This is a great tool to use if you want to do logging on the client side in the same way you do on the server, without worrying about sending off a million beacons. You can quickly get an idea of what's going on on your client, including error cases, page transitions, or anything else you care to log!

Overview
---------


## Basic logging

### `$logger.info(<event>, <payload>);`

Queues a log. Options are `debug`, `info`, `warn`, `error`.

For example:

`$logger.error('something_went_wrong', { error: err.toString() })`

### `$logger.track(<payload>);`

Call this to attach general tracking information to the current page. This is useful if the data is not associated with a specific event, and will be sent to the server the next time the logs are flushed.


## Transitions

### `$logger.startTransition();`

Call this when you start an ajax call or some other loading period, with the intention of moving to another page.

### `$logger.endTransition(<nextStateName>);`

Call this when you transition to the next page. beaver-logger will automatically log the transition, and how long it took. The logs will be auto-flushed after this call.

### `$logger.transition(<nextStateName>);`

This is a short-hand for `logger.startTransition(); $logger.endTransition(<nextStateName>);` when there is no loading time, and the transition from one state to another is instant. The logs will be auto-flushed after this call.


## Initialization and configuration

### `$logger.init(<config>);`

Set the logger up with your configuration options. This is optional. Configuration options are listed below.


## Advanced

### `$logger.addMetaBuilder(<function>);`

Attach a method which is called and will attach general information to the logging payload whenever the logs are flushed

```javascript
$logger.addMetaBuilder(function() {
    return {
        current_page: getMyCurrentPage()
    };
});
```

### `$logger.addPayloadBuilder(<function>);`

Attach a method which is called and will attach values to **each individual log's payload** whenever the logs are flushed

```javascript
$logger.addPayloadBuilder(function() {
    return {
        performance_ts: window.performance.now()
    };
});
```

### `$logger.addTrackingBuilder(<function>);`

Attach a method which is called and will attach values to **each individual log's tracking** whenever the logs are flushed

```javascript
$logger.addTrackingBuilder(function() {
    return {
        pageLoadTime: getPageLoadTime()
    };
});
```

### `$logger.addHeaderBuilder(<function>);`

Attach a method which is called and will attach values to **each individual log requests' headers** whenever the logs are flushed

```javascript
$logger.addHeaderBuilder(function() {
    return {
        'x-csrf-token': getCSRFToken()
    };
});
```

### `$logger.flush();`

Flushes the logs to the server side. Recommended you don't call this manually, as it will happen automatically on page transitions, or after a configured interval.


Installing
----------

- Install via npm or bower

`npm install --save beaver-logger` or `bower install --save beaver-logger`

- Include in your project

```html
<script src="/js/beaver-logger.min.js"></script>
```

or

```javascript
let $logger = require('beaver-logger');
```


Front-End Configuration
-----------------------

```javascript
$logger.init({

    // URI to post logs to
    uri: '/api/log',

    // State name to post logs under
    initial_state_name: 'init',

    // Interval at which to automatically flush logs to the server
    flushInterval:    10 * 60 * 1000,

    // Interval at which to debounce $logger.flush calls
    debounceInterval: 10,

    // Limit on number of logs before auto-flush happens
    sizeLimit: 300,

    // Supress `console.log`s when `true`
    // Recommended for production usage
    silent: false,

    // Enable or disable heartbeats, which run on an interval
    heartbeat: true,

    // Heartbeat log interval
    heartbeatInterval: 5000,

    // Maximum number of sequential heartbeat logs
    heartbeatMaxThreshold: 50,

    // Monitors for event loop delays and triggers a toobusy event
    heartbeatTooBusy: false,

    // Event loop delay which triggers a toobusy event
    heartbeatTooBusyThreshold: 10000,

    // Log levels which trigger an auto-flush to the server
    autoLog: ['warn', 'error'],

    // Log window.onunload and window.beforeUnload events?
    logUnload: true,

    // Log unload synchronously, to guarantee the log gets through?
    logUnloadSync: false,

    // Log performance stats from the browser automatically?
    logPerformance:  true
});
```

Server Side
-----------

beaver-logger includes a small node endpoint which will automatically accept the logs sent from the client side. You can mount this really easily:

```javascript
let beaverLogger = require('beaver-logger/server');

myapp.use(beaverLogger.expressEndpoint({

    // URI to recieve logs at
    uri: '/api/log',

    // Custom logger (optional, by default logs to console)
    logger: myLogger,

    // Enable cross-origin requests to your logging endpoint
    enableCors: false
}))
```

Or if you're using kraken, you can add this in your `config.json` as a middleware:

```json
      "beaver-logger": {
          "priority": 106,
          "module": {
              "name": "beaver-logger/server",
              "method": "expressEndpoint",
              "arguments": [
                  {
                      "uri": "/api/log",
                      "logger": "require:my-custom-logger-module"
                  }
              ]
          }
      }
```

Custom backend logger
---------------------

Setting up a custom logger is really easy, if you need to transmit these logs to some backend logging service rather than just logging them to your server console:

```javascript
module.exports = {

    log: function(req, level, event, payload) {

        logSocket.send(JSON.stringify({
            level: level,
            event: event,
            payload: payload
        }));
    }
}
```


Data Flow
---------

![Flow](/flow.png?raw=true)
