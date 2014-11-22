"use strict";

define(['angular', 'squid/index'], function (angular) {
    return angular.module('logger.api', ['squid.class', 'squid.api'])

        .service('$logApi', function($Api, $config) {

            var $logApi = $Api.extend('LogApi', {
                baseURI: $config.urls.baseUrl,
                uri: '/api/log',
                event: false
            });
            return new $logApi;
        })
});
