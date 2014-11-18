"use strict";

define(['angular',
    'angularMocks',
    'index'], function (angular) {

    function createMockResponse(httpBackend, success, expectedData){
        function validate(data){
           if(!expectedData) return true;
           if (!data) return false;
           var dataJson = JSON.parse(data);
           console.log("Verifying the length of postData");
           return dataJson.length === expectedData.length;
        }

        httpBackend.whenPOST("/webapps/helios/api/log", validate).respond({
            ack: success ? "success": "failure",
            data: {}
        });
    }


    describe('LogCache:: Tests', function () {
        var $scope,
            q,
            httpBackend,
            LogData,
            logCache,
            logLevel,
            interval,
            flushInterval = 20000;


        beforeEach(module('logging'));

        beforeEach(inject(function ($rootScope,
                                    $q,
                                    $logCache,
                                    $LogData,
                                    $logLevel,
                                    $httpBackend,
                                    $interval
            ) {

            q = $q;
            $scope = $rootScope.$new();
            httpBackend = $httpBackend;
            LogData = $LogData;
            logCache = $logCache;
            logLevel = $logLevel;
            interval = $interval;
        }));

        it('should get log data after specified time', function (done) {
            var expectedData = [
                new LogData({level: logLevel.INFO, eventName: "test"}),
                new LogData({level: logLevel.DEBUG, eventName: "test"}),
                new LogData({level: logLevel.WARNING, eventName: "test"}),
                new LogData({level: logLevel.ERROR, eventName: "test"}),
                new LogData({level: logLevel.ALERT, eventName: "test"})
            ];
            angular.forEach(expectedData, function(data){
                logCache.push(data);
            });

            createMockResponse(httpBackend, true, expectedData);
            interval.flush(flushInterval);

            httpBackend.flush();
           done();
        });

        it('should not make a post when there is no data', function (done) {
            interval.flush(flushInterval);
            done();
        });

        it('should make two posts', function (done) {
            var expectedData = [
                new LogData()
            ];
            angular.forEach(expectedData, function(data){
                logCache.push(data);
            });

            createMockResponse(httpBackend, true, expectedData);
            interval.flush(flushInterval);

            httpBackend.flush();

            // Second post
            expectedData = [
                new LogData()
            ];
            angular.forEach(expectedData, function(data){
                logCache.push(data);
            });

            createMockResponse(httpBackend, true, expectedData);
            interval.flush(flushInterval);

            httpBackend.flush();
            done();
        });

    });
});
