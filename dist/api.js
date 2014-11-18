"use strict";

define(['angular', 'squid/index'], function (angular) {
    return angular.module('logging.api', ['squid.class', 'squid.api'])

        .service('$logApi', function($Api) {

            var $logApi = $Api.extend('LogApi', {
                baseURI: '/webapps/helios',
                uri: '/api/log'
            });
            return new $logApi;
        })
});
