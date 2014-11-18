"use strict";

define(['angular',
    './api',
    './level',
    './cache',
    './data'], function (angular) {
    return angular.module('logger', [
            'logger.api',
            'logger.level',
            'logger.data',
            'logger.cache'
        ]);
});
