"use strict";

define(['angular'], function (angular) {
    return angular.module('beaver.level', [])

        .factory('$logLevel', function($Api, $config) {

            return {
                INFO:    'info',
                DEBUG:   'debug',
                ERROR:   'error',
                WARNING: 'warning',
                ALERT:   'alert'
            }
        })

        .factory('$consoleLogLevel', function($Api, $config, $log) {

            return {
                info:    'info',
                debug:   'debug',
                error:   'error',
                warning: 'warn',
                alert:   'info'
            };
        });
});
