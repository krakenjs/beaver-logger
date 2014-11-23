define([
    'angular',
    'angularMocks',
    'logger'
], function (angular) {

    var INTERVAL = 500;

    describe('Logger :: Tests', function () {
        var $logger, $logLevel, $httpBackend, $timeout, $interval, $window, expectedData;

        beforeEach(module('beaver'));

        beforeEach(inject(function ($injector) {

            var $Logger    = $injector.get('$Logger');
            var $LoggerApi = $injector.get('$LoggerApi');

            $logger = new $Logger({
                api: new $LoggerApi({
                    baseURI: '/webapps/test'
                }),
                interval: INTERVAL
            });

            $httpBackend = $injector.get('$httpBackend');

            $httpBackend.whenPOST('/webapps/test/api/log', function(data) {
                return Boolean(JSON.parse(data).events.length);
            }).respond({ack: 'success'});

            $logLevel = $injector.get('$logLevel');
            $timeout = $injector.get('$timeout');
            $interval = $injector.get('$interval');
            $window = $injector.get('$window');

            expectedData = [
                {level: $logLevel.INFO,    eventName: "test"},
                {level: $logLevel.DEBUG,   eventName: "test"},
                {level: $logLevel.ALERT,   eventName: "test"}
            ];
        }));

        it('should post data after a specified time', function(done) {

            angular.forEach(expectedData, function(data){
                $logger.log(data.level, data.eventName);
            });

            $interval.flush(INTERVAL);
            $httpBackend.flush();

            done();
        });

        it('should not post data when there are no logs', function(done) {

            $logger.flush();
            $interval.flush(INTERVAL);

            done();
        });

        it('should make two posts', function(done) {

            angular.forEach(expectedData, function(data){
                $logger.log(data.level, data.eventName);
            });

            $interval.flush(INTERVAL);
            $httpBackend.flush();

            angular.forEach(expectedData, function(data){
                $logger.log(data.level, data.eventName);
            });

            $interval.flush(INTERVAL);
            $httpBackend.flush();

            done();
        });


        it('should post the log data on window.onbeforeunload', function (done) {

            angular.forEach(expectedData, function(data){
                $logger.log(data.level, data.eventName);
            });

            angular.element($window).triggerHandler('onbeforeunload');

            $interval.flush(INTERVAL);
            $httpBackend.flush();

            done();
        });

    });
});
