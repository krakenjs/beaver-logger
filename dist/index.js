"use strict";

define(['angular',
    './api',
    './level',
    './logCache',
    './logData'], function (angular) {
    return angular.module('logging', [
            'logging.api',
            'logging.level',
            'logging.data',
            'logging.cache'
        ]);
});
