"use strict";

define(['angular', 'squid/index', './api'], function (angular) {
    return angular.module('logging.cache',
            ['squid.class',
            'squid.api',
            'logging.api'
            ])
        .service('$logCache', function($Class, $logApi, $interval){
            var LogCache = $Class.extend('LogCache', {

                init: function(){
                    this.cache = [];
                    this.logApi = $logApi;
                    this.flushInterval = 10000; //in milliseconds
                    $interval(function(){
                        this.flush();
                    }.bind(this), this.flushInterval);
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
