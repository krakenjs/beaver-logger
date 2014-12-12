"use strict";

define(['angular',
    'squid/index',
    './model'], function (angular) {
    angular.module('beaver.builder', ['squid', 'beaver.model'])
        .factory('FptiBuilder', function ($Class, $LocaleModel, FptiConstants, fptiDataModel) {
            /**
             *  Build the front-end FPTI event from three data sources
             *      1. the per-product configuration
             *      2. the buzname defined per-route
             *      3. the additional attributes that only available at a specific checkpoint
             *
             */

            var locale = $LocaleModel.instance();

            return $Class.extend('FptiBuilder', {
                // default to "fullpage" before more pageQualifier is defined for various flows
                _pageQualifier: "fullpage"
            }, {
                setBuzname: function (buzname) {
                    this._buzname = buzname;
                    return this;
                },

                setPageQualifier: function (pageQualifier) {
                    this._pageQualifier = pageQualifier;
                    return this;
                },

                build: function () {

                    this._dataObj = fptiDataModel
                        .decorate('buzname', this._buzname, this._pageQualifier)
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
        })
        .service('fptiBuilder', function (FptiBuilder) {
            return new FptiBuilder();
        });
});