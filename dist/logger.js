"use strict";

define([
    'angular',
    'squid/index',
    './api',
    './level',
    './builder'
], function (angular) {

    return angular.module('beaver', ['squid', 'beaver.api', 'beaver.level', 'beaver.builder'])

        .factory('$Logger', function ($injector,
                                      $Class,
                                      $window,
                                      $interval,
                                      $timeout,
                                      $log,
                                      $config,
                                      $rootScope,
                                      $logLevel,
                                      $consoleLogLevel) {

            var proto = {};

            angular.forEach($logLevel, function (level) {
                proto[level] = function (event, payload) {
                    return this.log(level, event, payload);
                }
            });

            return $Class.extend('Logger', proto, {

                autoLog: [$logLevel.WARNING, $logLevel.ERROR],
                interval: 5 * 60 * 1000, //5 minutes
                sizeLimit: 100,
                debounceInterval: 10,

                init: function () {
                    var logger = this;
                    this.buffer = [];

                    $window.onbeforeunload = function (event) {
                        logger.info('window_unload').flush(true);
                    };

                    this.daemon();
                },

                log: function (level, event, payload) {

                    if (this.buffer.length >= this.sizeLimit) {
                        return this;
                    }

                    //Print to console only in local and stage
                    if ($config.deploy.isLocal() || $config.deploy.isStage()) {
                        this.print(level, event, payload);
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
                        return this._flush();
                    }

                    if (logger.debouncer) {
                        $timeout.cancel(logger.debouncer);
                    }

                    logger.debouncer = $timeout(function () {
                        logger._flush();
                    }, this.debounceInterval);
                },

                _flush: function () {
                    var logger = this;

                    if (!logger.buffer.length) {
                        return;
                    }

                    var buffer = logger.buffer;

                    logger.api.post({
                        data: {
                            events: this.buffer,
                            meta: {}
                        }
                    }).catch(function (err) {
                        logger.buffer.unshift.apply(logger.buffer, buffer);
                        logger.debug("log_publish_fail", {
                            error: err.stack || err.toString()
                        });
                        $log.error('Unable to send logs', err);
                    });

                    logger.buffer = [];
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
        })

        .service('$logger', function ($Logger, $LoggerApi) {

            return new $Logger({
                api: new $LoggerApi
            });
        })

        .service('$fpti', function ($config, $FptiBuilder) {

            var _beaconUrl = $config.fptiBeaconUrl;
            return {
                setupDataString: function (route) {
                    if (typeof PAYPAL.analytics != "undefined") {
                        PAYPAL.core = PAYPAL.core || {};
                        
                        var data = new $FptiBuilder({
                                trackingData: (route || {}).trackingData
                                //... Other flow data pass-in here to resolve page qualifier
                                }).build();

                        PAYPAL.core.pta = PAYPAL.analytics.setup({
                            data: data.toString(),
                            url: _beaconUrl
                        });

                        //Seting pagename data to OpinionLab object
                        PAYPAL.core.OL = data._dataObj;
                    }
                }
            };
        });
});