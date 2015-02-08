"use strict";

define([
    'angular',
    './level'
], function (angular) {

    return angular.module('beaver', ['beaver.level'])

        .factory('$Logger', function ($injector,
                                      $http,
                                      $window,
                                      $interval,
                                      $timeout,
                                      $log,
                                      $q,
                                      $rootScope,
                                      $logLevel,
                                      $consoleLogLevel) {

            var logger = {};

            angular.forEach($logLevel, function (level) {
                logger[level] = function (event, payload, settings) {
                    return this.log(level, event, payload, settings);
                }
            });

            var hostname = $window.location && $window.location.hostname || '';

            var deploy = {
                isLocal: function() {
                    return $window.location.hostname === 'localhost' ||
                        hostname === 'localhost.paypal.com';
                },

                isStage: function() {
                    return Boolean(hostname.match(/^.*\.qa\.paypal\.com$/));
                },

                isLive: function() {
                    return hostname === 'www.paypal.com';
                }
            };

            angular.extend(logger, {

                autoLog: [$logLevel.WARNING, $logLevel.ERROR],
                interval: 5 * 60 * 1000, //5 minutes
                sizeLimit: 100,
                debounceInterval: 10,
                uri: '/api/log',
                debounceCache: {},

                init: function () {
                    var logger = this;
                    this.buffer = [];

                    var previousBeforeUnloadHandler = $window.onbeforeunload;

                    $window.onbeforeunload = function (event) {

                        if (logger.isDone) {
                            return;
                        }

                        logger.info('window_beforeunload')._flush(true);

                        if (previousBeforeUnloadHandler) {
                            return previousBeforeUnloadHandler.apply(this, arguments);
                        }
                    };

                    var previousUnloadHandler = $window.onbeforeunload;

                    $window.onunload = function (event) {

                        if (logger.isDone) {
                            return;
                        }

                        logger.info('window_unload')._flush(true);

                        logger.done();

                        if (previousUnloadHandler) {
                            return previousUnloadHandler.apply(this, arguments);
                        }
                    };

                    this.daemon();
                },

                done: function() {
                    this.isDone = true;
                },

                enqueue: function(level, event, payload){

                    var data = {
                        level: level,
                        event: event,
                        timestamp: new Date(),
                        payload: payload || {}
                    };

                    try {
                        JSON.stringify(data);
                    }
                    catch (e) {
                        return this.error('log_serialize_failed', {
                            event: event.toString()
                        });
                    }

                    this.buffer.push(data);

                    //If the log level is classified as autolog, then flush the data
                    if (~this.autoLog.indexOf(level)) {
                        this.flush();
                    }

                    return this;
                },

                log: function (level, event, payload, settings) {

                    var self = this;

                    payload  = payload  || {};
                    settings = settings || {};

                    //Print to console only in local and stage
                    if (window.config.enableLogs || deploy.isLocal() || deploy.isStage()) {
                        self.print(level, event, payload);
                    }

                    if (this.isDone || this.buffer.length >= this.sizeLimit) {
                        return self;
                    }

                    if (!settings.debounceFactor) {
                        return self.enqueue(level, event, payload);
                    }

                    var eventName = event + '_' + settings.debounceFactor;

                    // First check the debounceCache to see if we have same event+message
                    var debouncedEvent = self.debounceCache[eventName];

                    if(debouncedEvent){
                        debouncedEvent.payload.count += 1;
                    }

                    // If not already present create an entry for this event+message in debounce cache.
                    else {
                        payload.count = 1;

                        debouncedEvent = self.debounceCache[eventName] = {
                            level: level,
                            event: event,
                            payload: payload
                        };

                        //Add to the log buffer after a interval specified by settings
                        $timeout(function(){
                            self.enqueue(debouncedEvent.level, debouncedEvent.event, debouncedEvent.payload);
                            delete self.debounceCache[eventName];
                        }, settings.debounceInterval || 1000);
                    }

                    return self;
                },


                print: function (level, event, payload) {
                    var args = [event];

                    if (payload) {
                        args.push(payload);

                        if (payload.error || payload.warning) {
                            args.push('\n\n', payload.error || payload.warning);
                        }
                    }

                    $log[$consoleLogLevel[level] || 'info'].apply($log, args);
                },

                flush: function (immediate) {
                    var logger = this;

                    if (immediate) {
                        return $q.when(this._flush());
                    }

                    if (logger.debouncer_timeout) {
                        $timeout.cancel(logger.debouncer_timeout);
                    }

                    logger.debouncer_timeout = $timeout(function() {

                        var resolver = logger.debouncer_resolver;

                        delete logger.debouncer_promise;
                        delete logger.debouncer_resolver;
                        delete logger.debouncer_timeout;

                        logger._flush().then(function() {
                            resolver();
                        });

                    }, this.debounceInterval);

                    return logger.debouncer_promise = logger.debouncer_promise || $q(function(resolver) {
                        logger.debouncer_resolver = resolver;
                    });
                },

                _flush: function (sync) {
                    var logger = this;

                    if (!logger.buffer.length) {
                        return $q.when();
                    }

                    var buffer = logger.buffer;

                    var meta = {};

                    try {
                        meta = $injector.get('$metaBuilder').build();
                    }
                    catch(err) {}

                    var req = this.ajax('post', $window.config.urls.baseUrl + this.uri, {
                        data: {
                            events: logger.buffer
                        },
                        meta: meta
                    }, sync);

                    logger.buffer = [];

                    return req;
                },

                ajax: function(method, url, json, sync) {

                    return $q(function(resolve) {

                        var req = new(this.XMLHttpRequest || ActiveXObject)('MSXML2.XMLHTTP.3.0');
                        req.open(method.toUpperCase(), url, !sync);
                        req.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
                        req.setRequestHeader('Content-type', 'application/json');
                        req.onreadystatechange = function () {
                            if (req.readyState > 3) {
                                resolve();
                            }
                        };
                        req.send(JSON.stringify(json));
                    });
                },

                daemon: function () {
                    this.stop();

                    var logger = this;

                    this.timer = $interval(function () {
                        logger.flush();
                    }, this.interval);
                },

                stop: function () {
                    if (this.timer) {
                        $interval.cancel(this.timer);
                    }
                }
            });

            function Logger(val) {
                angular.extend(this, val);
                this.init();
            }

            Logger.prototype = logger;
            Logger.prototype.constructor = Logger;

            return Logger;

        }).factory('$logger', function($Logger) {
            return new $Logger();
        })

});
