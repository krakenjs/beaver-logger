"use strict";

define(['angular'], function (angular) {
    return angular.module('logger.level', [])
        .service('$logLevel', function() {
            return {
                INFO: 'info',
                DEBUG: 'debug',
                ERROR: 'error',
                WARNING: 'warning',
                ALERT: 'alert'
            };
        });
});
