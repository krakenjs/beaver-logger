"use strict";

define(['angular'], function (angular) {
    angular.module('beaver.model', [])
        .constant('FptiConstants', {
            // The prototype of buzname data object
            fromBuzname: {
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

            // Additional attributes to be populated depending on the context
            decorators: {
                "businessType": "bztp",
                "correlationId": "calc",
                "countryOfPage": "ccpg",
                "errorCode": "eccd",
                "fieldError": "erfd",
                "locale": "rsta",
                "loggedIn": "lgin",
                "merchantId": "mrid",
                "merchantType": "mbtp",
                "pageError": "erpg",
                "pageGoal": "goal",
                "pageQualifer": "qual",
                "pageStartTime": "pgst",
                "pageTechnologyFlag": "pgtf",
                "paymentFlowId": "pfid",
                "rLogId": "teal",
                "sessionId": "fpti",
                "sourceCi": "s",
                "tealeaf": "teal",
                "templateName": "tmpl",
                "uuid": "csci",
                "visitorId": "vid"
            }
        });

});