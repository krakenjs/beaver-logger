define([
    'angular',
    'angularMocks',
    'logger'
], function (angular) {

    describe('FPTI :: Tests', function () {
        var $rootScope, $LocaleModel, $fpti, setupData, expectedData;

        window.PAYPAL = {
            analytics: {
                setup: function (data) {
                    data.data.split('&').forEach(function (x) {
                        var kv = x.split('=');
                        setupData[kv[0]] = kv[1];
                    });

                    Object.keys(expectedData).forEach(function(k){
                        assert.equal(setupData[k], expectedData[k]);
                    })
                }
            }
        };

        beforeEach(module('beaver'));

        beforeEach(inject(function ($injector) {

            $rootScope = $injector.get('$rootScope');
            $LocaleModel = $injector.get('$LocaleModel');
            $fpti = $injector.get('$fpti');

            setupData = {};
            expectedData = {};
        }));


        it('should not post data when there are no logs', function (done) {
            expectedData = {
                s: "ci",
                flnm: "ec:hermes:",
                page: "main:ec:hermes::fullpage-login:member:hermes:",
                tmpl: "hermesnodeweb/public/templates/login.dust:fullpage",
                goal: "Payment start",
                qual: "fullpage"
            };

            $fpti.setupDataString({
                name: 'login',
                directive: 'xo-login-page',
                secured: false,

                trackingData: {
                    templateName: "hermesnodeweb/public/templates/login.dust",
                    pageGoal: "Payment start",
                    buzname: {
                        "fullpage": {
                            "pagename": "%::fullpage-login",
                            "pagename2": "%::fullpage-login:member:hermes:",
                            "version": "member:%:"
                        }
                        // More page qualifiers come here...
                    }
                }
            });
            assert.equal(setupData.calc.length, 13);

            done();
        });
    });
});

