"use strict";

define(['angular',
    'squid/index',
    './model'], function (angular) {
    angular.module('beaver.builder', ['squid', 'beaver.model'])
        .factory('FptiBuilder', function ($Class, FptiConstants) {

            function _buildDataString(buzname, pageQualifier) {

                if (!buzname) return;

                var buznameDiff = buzname[pageQualifier];
                if (!buznameDiff) return;

                var dataObj = {};
                var fromBuzname = FptiConstants.fromBuzname;
                Object.keys(fromBuzname).forEach(function (key) {
                    var buznameEntry = fromBuzname[key],
                        fptiKey = buznameEntry.fptiKey,
                        placeHolder = buznameEntry.placeHolder;
                    dataObj[fptiKey] = (buznameDiff[key]) ?
                        buznameDiff[key].replace('%', placeHolder) : placeHolder;
                });
                return dataObj;
            };

            return $Class.extend('FptiBuilder', {
                _dataObj: {},
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
                    this._dataObj = _buildDataString(this._buzname, this._pageQualifier);
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