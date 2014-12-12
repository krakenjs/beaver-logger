"use strict";

define(['angular', 'squid/index'], function (angular) {
    return angular.module('beaver.api', ['squid'])

        .factory('$LoggerApi', function($Api, $config) {

            return $Api.extend('LoggerApi', {
                baseURI: $config.urls.baseUrl,
                uri: '/api/log',
                event: false,
		fireAndForget: true
            });
        });
});
