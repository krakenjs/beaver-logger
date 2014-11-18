"use strict";

define(['angular', 'squid/index'], function (angular) {
    angular.module('logger.data', ['squid.class'])
        .factory('$LogData', function($Class) {

        var LogData = $Class.extend('LogData', {
            init : function(){
                this.payload = {};
                this.eventName = '';
                this.level = '';
                this.timeStamp = new Date();
            }
        });

        return LogData;
    });
});

