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
                logger[level] = function (event, payload) {
                    return this.log(level, event, payload);
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

                init: function () {
                    var logger = this;
                    this.buffer = [];

                    var previousBeforeUnloadHandler = $window.onbeforeunload;

                    $window.onbeforeunload = function (event) {
                        logger.info('window_unload').flush(true);

                        logger.done();

                        if (previousBeforeUnloadHandler) {
                            previousBeforeUnloadHandler.apply(this, arguments);
                        }
                    };

                    this.daemon();
                },

                done: function() {
                    this.isDone = true;
                },

                log: function (level, event, payload) {

                    //Print to console only in local and stage
                    if (window.config.enableLogs || deploy.isLocal() || deploy.isStage()) {
                        this.print(level, event, payload);
                    }

                    if (this.isDone || this.buffer.length >= this.sizeLimit) {
                        return this;
                    }

                    this.buffer.push({
                        level: level,
                        event: event,
                        timestamp: new Date(),
                        payload: payload || {}
                    });

                    //If the log level is classified as autolog, then flush the data
                    if (~this.autoLog.indexOf(level)) {
                        this.flush();
                    }

                    return this;
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

                        logger.debouncer_resolver();

                        delete logger.debouncer_resolver;
                        delete logger.debouncer_resolver;
                        delete logger.debouncer_timeout;

                    }, this.debounceInterval);

                    if (logger.debouncer_promise) {
                        return logger.debouncer_promise;
                    }

                    return logger.debouncer_promise = $q(function(resolver) {
                        logger.debouncer_resolver = resolver;
                    });
                },

                _flush: function () {
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

                    var req = $http({
                        method: 'post',
                        url:    $window.config.urls.baseUrl + this.uri,
                        data:   {
                            data: {
                                events: logger.buffer
                            },
                            meta: meta
                        },
                        headers: {
                            'X-Requested-With': 'XMLHttpRequest'
                        },
                        requestType: 'json',
                        responseType: 'json'

                    }).then(null, function(err) {

                        logger.buffer.unshift.apply(logger.buffer, buffer);
                        logger.debug("log_publish_fail", {
                            error: err.stack || err.toString()
                        });
                        $log.error('Unable to send logs', err);
                    });

                    logger.buffer = [];

                    return req;
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
