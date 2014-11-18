"use strict";

define(['angular', 'squid/index'], function (angular) {
    angular.module('logger.data', ['squid.class', 'logger.level'])
        .factory('$LogData', function($Class,
                                      $logLevel) {

            var LogData = $Class.extend('LogData', {
                init : function(){
                    this.payload = {};
                    this.level = this.level || $logLevel.INFO;
                    this.timeStamp = new Date();
                }
            });

            return LogData;
        });
});

