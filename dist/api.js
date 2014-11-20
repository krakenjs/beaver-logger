"use strict";

define(['angular', 'squid/index'], function (angular) {
    return angular.module('logger.api', ['squid.class', 'squid.api'])

        .service('$logApi', function($Api, $window) {

            var $logApi = $Api.extend('LogApi', {
                baseURI: $window.config.urls.baseUrl,
                uri: '/api/log'
            });
            return new $logApi;
        })
});
