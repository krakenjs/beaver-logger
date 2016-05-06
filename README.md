Sloth Logger
------------

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
    
    
        // Enable or disable heartbeats, which run on an interval and monitor for event loop delays
        heartbeat: true,
    
        // Heartbeat log interval
        heartbeatInterval: 5000,
        
        // Maximum number of sequential heartbeat logs
        hearbeatMaxThreshold: 50,
        
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
