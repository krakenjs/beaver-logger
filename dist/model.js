"use strict";

define(['angular',
        'components/node-uuid/uuid', // Using the same moduel as used in NodeInfra
        'squid/index'], function (angular, uuid) {
    angular.module('beaver.model', ['squid'])
        .constant('$FptiConstants', {
            // The prototype of buzname data object
            buznameMap: {
                country: {
                    placeHolder: "glb",
                    fptiKey: "ccpg"
                },

                flowgatename: {
                    placeHolder: "",
                    fptiKey: "fltp"
                },

                "flowname": {
                    placeHolder: "ec:hermes:",
                    fptiKey: "flnm"
                },
                "hier1": {
                    placeHolder: "main_ec_hermes_",
                    fptiKey: "shir"
                },
                /*
                 * No key defined in FPTI
                 */
                //            "hier2": "",
                //            "hier3": "",
                //            "hier4": "",
                //            "hier5": "",
                "inout": {
                    placeHolder: "inout",
                    fptiKey: "lgin"
                },
                "pagename": {
                    placeHolder: "main:ec:hermes",
                    fptiKey: "pgrp"
                },
                "pagename2": {
                    placeHolder: "main:ec:hermes",
                    fptiKey: "page"
                },
                "version": {
                    placeHolder: "hermes",
                    fptiKey: "vers"
                }
                /*
                 * Deprecated SiteCatalyst keys
                 */
                //            "feature": "ec",
                //            "oldpagename": "",
                //            "product": ";ec",
                //            "subfeature1": "hermes",
                //            "subfeature2": "",            
                //            "website": "main"
            },

            // Full list of FPTI keys indexed by readable names
            // This mapping can also be served as default decorator
            fptiKeys: {
                "businessType": "bztp",
                "correlationId": "calc", // CalDataHelper
                "countryOfPage": "ccpg", // buzname
                "errorCode": "eccd",
                "fieldError": "erfd",
                "flowgatename": "fltp", // buzname
                "flowname": "flnm", // buzname
                "locale": "rsta", // $LocaleModel
                "loggedIn": "lgin", // buzname
                "merchantId": "mrid",
                "merchantType": "mbtp",
                "pageError": "erpg",
                "pageGoal": "goal", //route
                "pageGroup": "pgrp", // buzname
                "pageName": "page", // buzname
                "pageQualifer": "qual", // buzname
                "pageStartTime": "pgst", // FptiBuilder
                "pageTechnologyFlag": "pgtf", // productConfig
                "paymentFlowId": "pfid",
                "rLogId": "teal",
                "sessionId": "fpti",
                "siteHierarchy": "shir", // buzname
                "sourceCi": "s", // productConfig
                "tealeaf": "teal",
                "templateName": "tmpl", // route
                "uuid": "csci", // $CalDataHelper
                "version": "vers", // buzname
                "visitorId": "vid"
            }
        })
        .factory('$FptiDataModel', function ($Class, $FptiConstants) {
            var productConfig = {};
            // TODO to read from config.json
            productConfig[$FptiConstants.fptiKeys.sourceCi] = 'ci';
            productConfig[$FptiConstants.fptiKeys.pageTechnologyFlag] = 'NodeJS';

            /**
             * Utilizing Decorator pattern to allow defining additional logic for specific keys
             */
            return $Class.extend('FptiDataModel', {
                _dataObj: productConfig,
                _decoratorList: [],
                decorators: {
                    buzname: function (trackingData, pageQualifier) {

                        if (!trackingData) return;

                        var buzname = trackingData.buzname;
                        if (!buzname) return;

                        var buznameDiff = buzname[pageQualifier];
                        if (!buznameDiff) return;

                        var dataObj = this._dataObj;
                        var buznameMap = $FptiConstants.buznameMap;
                        Object.keys(buznameMap).forEach(function (key) {
                            var buznameEntry = buznameMap[key],
                                fptiKey = buznameEntry.fptiKey,
                                placeHolder = buznameEntry.placeHolder;
                            dataObj[fptiKey] = (buznameDiff[key]) ?
                                buznameDiff[key].replace('%', placeHolder) : placeHolder;
                        });
                        dataObj[$FptiConstants.fptiKeys.pageQualifer] = pageQualifier;
                    },

                    locale: function (locale) {
                        if (locale && locale.country) {
                            this._dataObj[$FptiConstants.fptiKeys.locale] = locale.country;
                        }
                    },

                    templateName: function (trackingData, pageQualifier) {
                        if (trackingData && trackingData.templateName) {
                            this._dataObj[$FptiConstants.fptiKeys.templateName] =
                                trackingData.templateName + ((pageQualifier) ? (':' + pageQualifier) : '');
                        }
                    }
                },
                decorate: function (name) {
                    this._decoratorList.push({
                        name: name,
                        params: Array.prototype.slice.call(arguments, 1)
                    });
                    return this;
                },
                getDataObject: function () {
                    var i, decorator;

                    for (i = 0; i < this._decoratorList.length; i++) {
                        decorator = this._decoratorList[i];
                        if (!decorator) continue;
                        var name = decorator.name,
                            params = decorator.params;
                        if (angular.isFunction(this.decorators[name])) {
                            // Invoke the decorator and pass in the parameter list
                            this.decorators[name].apply(this, params);
                        } else {
                            var fptiKey = $FptiConstants.fptiKeys[name];
                            // If the fptiKey is defined and value is present, add the k-v pair
                            if (fptiKey && params && params.length > 0) {
                                this._dataObj[fptiKey] = params[0];
                            }
                        }
                    }
                    return this._dataObj;
                }
            })
        }).factory('$CalDataModel', function () {

            var uuid_v4_mask = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx";
            var uuid_v1_mask = "XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX";

            return $Model.extend('CalDataModel', {
                getCorrelationId: function () {
                    var uidRandomArr = (uuid.v4() || uuid_v4_mask).split('-');
                    var uidTime = (uuid.v1() || uuid_v1_mask).split('-');
                    var correlationId = uidTime[0] + uidRandomArr[0].substr(0, 5);
                    return correlationId;
                },
                getUuid: function () {
                    return (uuid.v4() || uuid_v4_mask).replace(/-/g, '');
                }
            });
        });
});