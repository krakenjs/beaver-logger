define([
    'angular',
    'angularMocks',
    'logger'
], function (angular) {

    var INTERVAL = 500;
    var SIZE_LIMIT = 100;

    function buildHttpMock($httpBackend, verifier){
        $httpBackend.whenPOST('/webapps/test/api/log', function(data) {
            if(verifier){
                return verifier(data);
            }else{
                return Boolean(JSON.parse(data).events.length);
            }

        }).respond({ack: 'success'});
    }

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
                interval: INTERVAL,
                sizeLimit: SIZE_LIMIT
            });

            expectedData = [
                {level: $logLevel.INFO,    eventName: "test"},
                {level: $logLevel.DEBUG,   eventName: "test"},
                {level: $logLevel.ALERT,   eventName: "test"}
            ];
        }));

        it('should post data after a specified time', function(done) {
            buildHttpMock($httpBackend);
            angular.forEach(expectedData, function(data){
                $logger.log(data.level, data.eventName);
            });

            $interval.flush(INTERVAL);
            $timeout.flush(INTERVAL + 10);
            $httpBackend.flush();

            done();
        });

        it('should not post data when there are no logs', function(done) {
            buildHttpMock($httpBackend);
            $logger.flush();
            $interval.flush(INTERVAL);

            done();
        });

        it('should make two posts', function(done) {
            buildHttpMock($httpBackend);
            angular.forEach(expectedData, function(data){
                $logger.log(data.level, data.eventName);
            });

            $interval.flush(INTERVAL);
            $timeout.flush(10);
            $httpBackend.flush();

            angular.forEach(expectedData, function(data){
                $logger.log(data.level, data.eventName);
            });

            $interval.flush(INTERVAL);
            $timeout.flush(10);
            $httpBackend.flush();

            done();
        });


        it('should STOP accumulating logs after size limit of SIZE_LIMIT', function(done){
            buildHttpMock($httpBackend);
            for(var i =0; i< 200; i++){
                $logger.log($logLevel.INFO, "test");
            }
            assert($logger.buffer.length === SIZE_LIMIT, "Expected the size of the buffer to be SIZE_LIMIT = 100")
            done();
        });

        it('should post the log data on window.onbeforeunload', function (done) {
            buildHttpMock($httpBackend);
            $logger.log($logLevel.INFO, "test");
            angular.element($window).triggerHandler('onbeforeunload');
            $interval.flush(INTERVAL);
            $timeout.flush(10);
            $httpBackend.flush();
            done();
        });

        it('should print the info logs to console', function (done) {
            buildHttpMock($httpBackend);
            $logger.print("somerandom", "INFO_LOG", {info: "test"});
            assert($log.info.logs.length === 1, "Expect to print logs to console");
            done();
        });

        it('should print the error logs to console', function (done) {
            buildHttpMock($httpBackend);
            $logger.print($consoleLogLevel.error, "ERROR_LOG" ,{error: "test"});
            assert($log.error.logs.length === 1, "Expect to print logs to console");
            done();
        });

        it('should print the warning logs to console', function (done) {
            buildHttpMock($httpBackend);
            $logger.print($consoleLogLevel.warn, "WARNING_LOG" ,{warning: "test"});
            assert($log.warn.logs.length === 1, "Expect to print logs to console");
            done();
        });

    });

});
