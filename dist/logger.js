'use strict';

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
            flushInterval: 10 * 60 * 1000,
            heartbeatInterval: 5000,
            sizeLimit: 300,
            debounceInterval: 10,
            uri: '/api/log',
            hearbeatMaxThreshold: 50,

            deploy: {
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
                var self = this;
                this.buffer = [];

                var previousBeforeUnloadHandler = $window.onbeforeunload;

                $window.onbeforeunload = function (event) {

                    if (self.isDone) {
                        return;
                    }

                    self.info('window_beforeunload');

                    if (previousBeforeUnloadHandler) {
                        return previousBeforeUnloadHandler.apply(this, arguments);
                    }
                };

                var previousUnloadHandler = $window.onunload;

                $window.onunload = function (event) {

                    if (self.isDone) {
                        return;
                    }

                    self.info('window_unload')._flush(true);

                    self.done();

                    if (previousUnloadHandler) {
                        return previousUnloadHandler.apply(this, arguments);
                    }
                };

                this.heartbeat();
                this.daemon();
            },


            heartbeat: function() {
                var self = this;

                if (!window.enablePerformance) {
                    return;
                }

                function timestamp() {
                    var perf = window.performance;
                    return parseInt(perf.now() - (perf.timing.connectEnd - perf.timing.navigationStart), 10);
                }

                var howBusy = {
                    lastSampledTime: timestamp(),
                    lastLag: 0,
                    maxLag: 0,
                    dampendedLag: 0
                };

                var count = 0;

                $interval(function () {

                    if (!self.buffer.length || self.buffer[self.buffer.length - 1].event !== 'heartbeat') {
                        count = 0;
                    }

                    if (!self.buffer.length || count > self.hearbeatMaxThreshold) {
                        return;
                    }

                    count += 1;

                    var payload = {
                        count: count
                    };

                    var now = timestamp();

                    howBusy.lastLag = now - howBusy.lastSampledTime - self.heartbeatInterval;
                    howBusy.maxLag = howBusy.lastLag > howBusy.maxLag ? howBusy.lastLag : howBusy.maxLag;
                    howBusy.dampendedLag = (howBusy.lastLag + howBusy.dampendedLag * 2) / 3;
                    howBusy.lastSampledTime = now;

                    payload.lastLag = howBusy.lastLag.toFixed(4);
                    payload.maxLag = howBusy.maxLag.toFixed(4);
                    payload.dampendedLag = howBusy.dampendedLag.toFixed(4);
                    payload.lastSampledTime = howBusy.lastSampledTime.toFixed(4);

                    if (howBusy.lastLag > 10000) {
                        self.info('toobusy', {}, {
                            noConsole: true,
                            unique: true
                        });
                    }

                    self.info('heartbeat', payload, {
                        noConsole: true
                    });

                }, this.heartbeatInterval);
            },

            done: function () {
                this.isDone = true;
            },

            addPerformanceData: function(payload) {

                if (window.enablePerformance) {
                    var performance = window.performance;
                    var timing = window.performance.timing || {};
                    var now = performance.now();

                    if (window.clientStartTime && angular.isUndefined(payload.client_elapsed)) {
                        payload.client_elapsed = parseInt(now - window.clientStartTime, 10);
                    }

                    if (timing.connectEnd && timing.navigationStart && angular.isUndefined(payload.req_elapsed)) {
                        payload.req_elapsed = parseInt(now - (timing.connectEnd - timing.navigationStart), 10);
                    }
                }
            },

            /* jslint maxcomplexity: false */
            log: function (level, event, payload, settings) {

                var self = this;

                payload = payload || {};

                if (angular.isArray(payload) || !angular.isObject(payload)) {
                    payload = {
                        payload: payload
                    };
                }
                settings = settings || {};

                if (settings.unique) {
                    var hash = event + ':' + angular.toJson(payload);
                    if (uniqueEvents.indexOf(hash) > -1) {
                        return self;
                    }
                    uniqueEvents.push(hash);
                }

                payload.pageID = window.meta && window.meta.pageID;

                this.addPerformanceData(payload);

                self.print(level, event, payload, settings);

                if (this.buffer.length >= this.sizeLimit) {
                    if (this.buffer.length === this.sizeLimit) {
                        return self.enqueue('info', 'logger_max_buffer_length');
                    }
                    return self;
                }

                return self.enqueue(level, event, payload, settings);
            },

            enqueue: function (level, event, payload, settings) {

                payload = payload || {};
                settings = settings || {};

                var data = {
                    level: level,
                    event: event,
                    timestamp: Date.now(),
                    payload: payload
                };

                this.buffer.push(data);

                // If the log level is classified as autolog, then flush the data
                if (this.autoLog.indexOf(level) > -1) {
                    this.flush();
                }

                return this;
            },

            shouldPrintLogsToConsole: function(settings) {

                if (settings.noConsole) {
                    return false;
                }

                if (window.meta && window.meta.corp) {
                    return true;
                }

                if (this.deploy.isLocal() || this.deploy.isStage()) {
                    return true;
                }

                var cookies = window.cookies || {};
                if (cookies[HERMES_DEV_COOKIE] && cookies[HERMES_DEV_COOKIE] === '1') {
                    return true;
                }

                return false;
            },

            print: function (level, event, payload, settings) {

                if (!this.shouldPrintLogsToConsole(settings)) {
                    return;
                }

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
                var self = this;

                if (!this.buffer.length) {
                    return $q.when();
                }

                if (immediate) {
                    return $q.when(this._flush());
                }

                if (self.debouncer_timeout) {
                    $timeout.cancel(self.debouncer_timeout);
                }

                self.debouncer_timeout = $timeout(function () {

                    var resolver = self.debouncer_resolver;

                    delete self.debouncer_promise;
                    delete self.debouncer_resolver;
                    delete self.debouncer_timeout;

                    self._flush().then(function () {
                        resolver();
                    });

                }, this.debounceInterval);

                self.debouncer_promise = self.debouncer_promise || $q(function (resolver) {
                    self.debouncer_resolver = resolver;
                });

                return self.debouncer_promise;
            },

            _flush: function (sync) {
                var self = this;

                if (!self.buffer.length) {
                    return $q.when();
                }

                var meta = {};

                try {
                    meta = $injector.get('$metaBuilder').build();
                } catch (err) {
                    // @TODO - Log error
                }

                var req = this.ajax('post', $window.config.urls.baseUrl + this.uri, {
                    data: {
                        events: self.buffer
                    },
                    meta: meta
                }, sync);

                self.buffer = [];

                return req;
            },

            ajax: function (method, url, json, sync) {

                return $q(function (resolve) {
                    var XRequest = window.XMLHttpRequest || ActiveXObject; // eslint-disable-line no-undef, block-scoped-var
                    var req = new XRequest('MSXML2.XMLHTTP.3.0');
                    req.open(method.toUpperCase(), url, !sync);
                    req.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
                    req.setRequestHeader('Content-type', 'application/json');
                    req.onreadystatechange = function () {
                        if (req.readyState > 3) {
                            resolve();
                        }
                    };
                    req.send(JSON.stringify(json).replace(/&/g, '%26')); // eslint-disable-line angular/ng_json_functions
                });
            },

            daemon: function () {
                this.stop();

                var self = this;

                this.timer = $interval(function () {
                    self.flush();
                }, this.flushInterval);
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

    }).run(function($logger) {
        angular.forEach(window.beaconQueue, function(payload) {
            $logger.log(payload.level, payload.event, payload);
        });
    });

});


