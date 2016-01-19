beaver-client
=============

Front-end log buffer, which periodically (or on demand) flushes logs to the server side.

Overview
---------

### `$logger.info(<event>, <payload>)`;

Queues a log. Options are `debug`, `info`, `warn`, `error`.

For example:

`$logger.error('something_went_wrong', { error: err.toString() })`

### `$logger.flush()`;

Flushes the logs to the server side. Best done on page transitions, but will happen automatically after a delay.

Configuration
-------------

    $logger.init({
    
        // URI to post logs to
        uri: '/api/log',
    
        // Interval at which to automatically flush logs to the server 
        flushInterval:    10 * 60 * 1000,
        
        // Interval at which to debounce $logger.flush calls
        debounceInterval: 10,
    
        // Limit on number of logs before auto-flush happens
        sizeLimit: 300,
    
        // Heartbeat log interval
        heartbeatInterval:    5000,
        
        // Maximum number of sequential heartbeat logs
        hearbeatMaxThreshold: 50,
    
        // Log levels which trigger an auto-flush
        autoLog: ['warn', 'error'],
    
        // Log window.onunload?
        log_unload:       true,
        
        // Log window.onbeforeunload?
        log_beforeunload: true,
        
        // Log performance stats?
        log_performance:  true
    });
