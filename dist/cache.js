"use strict";

define(['angular',
    'squid/index',
    './api',
    './data',
    "./level"], function (angular) {
    return angular.module('logger.cache',
            ['squid.class',
            'squid.api',
            'logger.api',
            'logger.data',
            'logger.level'
            ])
        .service('$logCache', function($Class,
                                       $logApi,
                                       $LogData,
                                       $logLevel,
                                       $interval,
                                       $window){
            var LogCache = $Class.extend('LogCache', {

                init: function(){
                    this.cache = [];
                    this.logApi = $logApi;
                    this.flushInterval = 10000; //in milliseconds
                    $interval(function(){
                        this.flush();
                    }.bind(this), this.flushInterval);

                    $window.onbeforeunload = function(event){
                        var logData = new $LogData({
                            name: "Window_onbeforeunload",
                            level: $logLevel.DEBUG
                        });
                        this.push(logData);
                        this.flush();
                    }.bind(this);
                },

                push : function(logData){
                    this.cache.push(logData);
                },

                flush: function(){

                    if(this.cache.length > 0){
                        var that = this;
                        this.logApi.post({
                            data: this.cache
                        });
                        this.cache = [];
                    }
                }


            });

            return new LogCache();
        });
});
