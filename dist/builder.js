"use strict";

define(['angular',
    'squid/index',
    './model'], function (angular) {
    angular.module('beaver.builder', ['squid', 'beaver.model'])
        .factory('$FptiBuilder', function ($Class, $LocaleModel, $FptiConstants, $FptiDataModel, $CalDataModel) {
            /**
             *  Build the front-end FPTI event from three data sources
             *      1. the per-product configuration
             *      2. the buzname defined per-route
             *      3. the additional attributes that only available at a specific checkpoint
             *
             */

            var locale = $LocaleModel.instance();

            return $Class.extend('FptiBuilder', {
                resolvePageQualifier: function () {
                    // TODO implment page qualifier resolver 
                    // based on flow data passed in
                    return "fullpage";
                },

                build: function () {

                    this._dataObj = (new $FptiDataModel())
                        .decorate('buzname', this.buzname, this.resolvePageQualifier())
                        .decorate('locale', locale)
                        .decorate('pageStartTime', (new Date()).getTime())
                        .getDataObject();

                    return this;
                },

                toString: function () {

                    var dataAry = [];
                    angular.forEach(this._dataObj, function (v, k) {
                        dataAry.push(k + '=' + v);
                    });

                    return dataAry.join('&');
                }
            });
        });
});