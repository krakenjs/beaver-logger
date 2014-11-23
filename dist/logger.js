"use strict";

define([
    'angular',
    'squid/index',
    './api',
    './level'
], function (angular) {

    return angular.module('beaver', ['squid', 'beaver.api', 'beaver.level'])

        .factory('$Logger', function($Class,
                                     $window,
                                     $interval,
                                     $timeout,
                                     $log,
                                     $config,
                                     $rootScope,
                                     $logLevel,
                                     $consoleLogLevel) {

            var proto = {};

            angular.forEach($logLevel, function(level) {
                proto[level] = function(event, payload) {
                    return this.log(level, event, payload);
                }
            });

            return $Class.extend('Logger', proto, {

                autoLog: [$logLevel.WARNING, $logLevel.ERROR],
                interval: 30000,

                init: function() {
                    var logger = this;
                    this.buffer = [];

                    $window.onbeforeunload = function(event) {
                        logger.info('window_unload').flush();
                    };

                    $rootScope.$on('$stateChangeSuccess', function() {
                        $timeout(function() {
                            logger.flush();
                        });
                    });

                    this.daemon();
                },

                log: function(level, event, payload) {
                    payload = payload;

                    if ($config.deploy.isLocal() || $config.deploy.isStage()) {
                        this.print(level, event, payload);
                    }

                    this.buffer.push({
                        level: level,
                        event: event,
                        timestamp: new Date(),
                        payload: payload || {}
                    });

                    if (this.autoLog.indexOf(level)) {
                        this.flush();
                    }

                    return this;
                },

                print: function(level, event, payload) {
                    var args = [event];

                    if (payload) {
                        args.push(payload);

                        if (payload.error || payload.warning) {
                            args.push('\n\n', payload.error || payload.warning);
                        }
                    }

                    $log[$consoleLogLevel[level] || 'info'].apply($log, args);
                },

                flush: function() {
                    var logger = this;
                    var buffer = this.buffer;

                    if (!this.buffer.length) {
                        return;
                    }

                    this.api.post({
                        data: {
                            events: this.buffer,
                            meta: {}
                        }
                    }).catch(function(err) {
                        logger.buffer.unshift.apply(logger.buffer, buffer);
                        logger.debug("log_publish_fail", {error: err.stack || err.toString()});
                        $log.error('Unable to send logs', err);
                    });

                    this.buffer = [];

                    this.daemon();
                },

                daemon: function() {
                    this.stop();

                    var logger = this;

                    this.timer = $interval(function() {
                        logger.flush();
                    }, this.interval);
                },

                stop: function() {
                    if (this.timer) {
                        $interval.cancel(this.timer);
                    }
                }
            });
        })

        .service('$logger', function($Logger, $LoggerApi) {

            return new $Logger({
                api: new $LoggerApi
            });
        });
});
