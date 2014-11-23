define([
    'angular',
    'angularMocks',
    'logger'
], function (angular) {

    var INTERVAL = 500;

    describe('Logger :: Tests', function () {
        var $logger,
            $logLevel,
            $consoleLogLevel,
            $rootScope,
            $httpBackend,
            $timeout,
            $interval,
            $window,
            $q,
            $log,
            expectedData;


        function setTestLocals($injector){
            //Core angular services/factories
            $rootScope = $injector.get('$rootScope');
            $httpBackend = $injector.get('$httpBackend');
            $timeout = $injector.get('$timeout');
            $interval = $injector.get('$interval');
            $window = $injector.get('$window');
            $q = $injector.get('$q');
            $log = $injector.get('$log');

            //our custom services
            $logLevel = $injector.get('$logLevel');
            $consoleLogLevel = $injector.get('$consoleLogLevel');
        }


        beforeEach(module('beaver'));

        beforeEach(inject(function ($injector) {

            setTestLocals($injector);

            var $Logger    = $injector.get('$Logger');
            var $LoggerApi = $injector.get('$LoggerApi');


            $logger = new $Logger({
                api: new $LoggerApi({
                    baseURI: '/webapps/test'
                }),
                interval: INTERVAL
            });

            $httpBackend.whenPOST('/webapps/test/api/log', function(data) {
                return Boolean(JSON.parse(data).events.length);
            }).respond({ack: 'success'});


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
            $logger.log($logLevel.INFO, "test");
            angular.element($window).triggerHandler('onbeforeunload');
            $interval.flush(INTERVAL);
            $httpBackend.flush();
            done();
        });


        it('should post the log data on $stateChangeSuccess ', function (done) {

            $logger.log($logLevel.INFO, "test");

            $rootScope.$broadcast('$stateChangeSuccess', { test : 'test' });

            var promise = $q(function(resolve, reject){
                $httpBackend.flush();
                resolve();
            })
            .finally(done);

            $rootScope.$apply();

            return promise;


        });

        it('should print the info logs to console', function (done) {

            $logger.print("somerandom", "INFO_LOG", {info: "test"});
            assert($log.info.logs.length === 1, "Expect to print logs to console");
            done();
        });

        it('should print the error logs to console', function (done) {

            $logger.print($consoleLogLevel.error, "ERROR_LOG" ,{error: "test"});
            assert($log.error.logs.length === 1, "Expect to print logs to console");
            done();
        });

        it('should print the warning logs to console', function (done) {

            $logger.print($consoleLogLevel.warn, "WARNING_LOG" ,{warning: "test"});
            assert($log.warn.logs.length === 1, "Expect to print logs to console");
            done();
        });

    });
});
