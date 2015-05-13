"use strict";

define([
    'angular',
    './level'
], function (angular) {

    return angular.module('beaver', [
        'beaver.level'
    ]).factory('$Logger', function ($injector,
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
        var HERMES_DEV_COOKIE = 'hermesdev';

        angular.forEach($logLevel, function (level) {
            logger[level] = function (event, payload, settings) {
                return this.log(level, event, payload, settings);
            };
        });

        var hostname = $window.location && $window.location.hostname || '';

        var uniqueEvents = [];

        angular.extend(logger, {

            autoLog: [$logLevel.WARNING, $logLevel.ERROR],
            interval: 5 * 60 * 1000, //5 minutes
            sizeLimit: 100,
            debounceInterval: 10,
            uri: '/api/log',
            debounceCache: {},
            lastLogTime: Date.now(),
            lastFlushTime:  Date.now(),
            contHeartBeatCount: 0,
            contHeartBeatCountThreshold: 100,
            howBusy:{
                lastSampledTime: Date.now(),
                lastLag: 0,
                maxLag: 0,
                dampendedLag: 0
            },

            deploy : {
                isLocal: function () {
                    return hostname === 'localhost' || hostname === 'localhost.paypal.com';
                },

                isStage: function () {
                    return Boolean(hostname.match(/^.*\.qa\.paypal\.com$/));
                },

                isLive: function () {
                    return hostname === 'www.paypal.com';
                }
            },

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

                var previousUnloadHandler = $window.onunload;

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

                this.set_heartbeat();
                this.daemon();
            },


            set_heartbeat: function(){
                var self = this;


                setHeartBeat();
                setLoadingHeartBeat();

                //Sets a interval for logging heatbeats
                function setHeartBeat(){
                    var heartbeat, interval = 5 * 1000;

                    heartbeat =  $interval(function () {

                        //If we have max number of continuous heartbeats logged, then do nothing.
                        if(self.contHeartBeatCount >= self.contHeartBeatCountThreshold){
                            return;
                        }

                        //Update the continuous heartbeat count
                        self.contHeartBeatCount += 1;

                        //Log a heartbeat event
                        self.info('heartbeat',
                            //payload
                            {
                                'sequenceNum': self.contHeartBeatCount
                            },
                            //settings/options
                            {
                                noConsole : true,
                                heartbeat: true
                            }
                        );

                        var now = Date.now();
                        var timeSinceLastFlush = now - self.lastFlushTime;

                        //If there is no flush in last minute then flush the logs, to make sure we capture heartbeats
                        if (timeSinceLastFlush >= 60 * 1000) {
                            self.flush();
                        }

                    }, interval);

                }

                //Sets a interval for loading spinner heart beats
                function setLoadingHeartBeat(){
                    var loadingHeartbeat, interval = 200;

                    $rootScope.$on('startLoad', function(){

                        loadingHeartbeat =  $interval(function () {

                            var now = Date.now();

                            var howBusy = self.howBusy;
                            if (howBusy) {
                                howBusy.lastLag = now - howBusy.lastSampledTime - interval;
                                if (howBusy.lastLag < 0) {
                                    howBusy.lastLag = 0;
                                }
                                howBusy.maxLag = (howBusy.lastLag > howBusy.maxLag) ?
                                                 howBusy.lastLag : howBusy.maxLag;
                                howBusy.dampendedLag = (howBusy.lastLag + howBusy.dampendedLag * 2) / 3;
                                howBusy.lastSampledTime = now;
                            }

                            var timeSinceLastLog = now - self.lastLogTime;
                            if (timeSinceLastLog < interval) {
                                return;
                            }

                            self.info('loading_heartbeat', {}, {
                                noConsole : true,
                                heartbeat: true
                            });

                        }, interval);
                    });

                    $rootScope.$on('allLoaded', function() {
                        $interval.cancel(loadingHeartbeat);
                        self.howBusy = undefined;
                    });
                }

            },

            done: function () {
                this.isDone = true;
            },

            enqueue: function (level, event, payload) {

                var data = {
                    level: level,
                    event: event,
                    timestamp: new Date(),
                    payload: payload || {}
                };

                this.buffer.push(data);

                //If the log level is classified as autolog, then flush the data
                if (~this.autoLog.indexOf(level)) {
                    this.flush();
                }

                return this;
            },

            /* jslint maxcomplexity: false */
            log: function (level, event, payload, settings) {

                var self = this;

                if (angular.isArray(payload) || !angular.isObject(payload)) {
                    payload = {payload: payload};
                }
                settings = settings || {};

                //If the event is NOT a heartbeat then
                // 1. update lastLogTime to current time
                // 2. Reset the counter for continuous heartbeat events
                if(!settings.heartbeat){
                    self.lastLogTime = Date.now();
                    self.contHeartBeatCount = 0;
                }

                if (settings.unique) {
                    var hash = event + ':' + JSON.stringify(payload);
                    if (~uniqueEvents.indexOf(hash)) {
                        return self;
                    }
                    uniqueEvents.push(hash);
                }

                payload.pageID = window.meta && window.meta.pageID;

                if (window.performance) {
                    var performance = window.performance;
                    var timing      = window.performance.timing || {};

                    if (performance.now && Math.abs(performance.now() - Date.now()) > 1000) {
                        if (window.clientStartTime && payload.client_elapsed === undefined) {
                            payload.client_elapsed = performance.now() - window.clientStartTime;
                        }

                        if (timing.requestStart && timing.navigationStart && payload.req_elapsed === undefined) {
                            payload.req_elapsed = performance.now() - (timing.requestStart - timing.navigationStart);
                        }
                    }
                }

                if(self.howBusy){
                    angular.extend(payload, self.howBusy);
                }

                function shouldPrintLogsToConsole(){

                    if(settings.noConsole){
                        return false;
                    }

                    if(window.meta && window.meta.corp) {
                        return true;
                    }

                    if(self.deploy.isLocal() || self.deploy.isStage()) {
                        return true;
                    }

                    var cookies = window.cookies || {};
                    if(cookies[HERMES_DEV_COOKIE] && cookies[HERMES_DEV_COOKIE] === '1') {
                        return true;
                    }

                    return false;
                }

                //Print to console only in local and stage
                if (shouldPrintLogsToConsole()) {
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

                if (debouncedEvent) {
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
                    $timeout(function () {
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

                logger.debouncer_timeout = $timeout(function () {

                    var resolver = logger.debouncer_resolver;

                    delete logger.debouncer_promise;
                    delete logger.debouncer_resolver;
                    delete logger.debouncer_timeout;

                    logger._flush().then(function () {
                        resolver();
                    });

                }, this.debounceInterval);

                return logger.debouncer_promise = logger.debouncer_promise || $q(function (resolver) {
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
                catch (err) {}

                logger.lastFlushTime = Date.now();

                var req = this.ajax('post', $window.config.urls.baseUrl + this.uri, {
                    data: {
                        events: logger.buffer
                    },
                    meta: meta
                }, sync);

                logger.buffer = [];

                return req;
            },

            ajax: function (method, url, json, sync) {

                return $q(function (resolve) {
                    var XRequest = window.XMLHttpRequest || ActiveXObject;
                    var req = new XRequest('MSXML2.XMLHTTP.3.0');
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

    }).factory('$logger', function ($Logger) {
        return new $Logger();
    });

});


