window.config = {
    urls: {
        baseUrl: '/webapps/test'
    }
};

define([
    'angular',
    'angularMocks',
    'logger'
], function (angular) {

    var INTERVAL = 500;
    var SIZE_LIMIT = 100;
    var DEBOUNCE_INTERVAL = 10;


    describe('Logger :: Tests', function () {
        var $logger,
            injector,
            $logLevel,
            $consoleLogLevel,
            $window,
            $rootScope,
            $timeout,
            $interval,
            $q,
            $log,
            expectedData,
            $scope,
            requests = [];

        function setXMLHttpRequest(){
            window.XMLHttpRequest = function(){
                this.readyState = 0;
                this.onreadystatechange = function(){};
                this.open = sinon.spy();
                this.setRequestHeader = sinon.spy();
                this.send = function(json){
                    requests.push(json);
                    this.readyState = 4;
                    this.onreadystatechange();
                }
            };
        }

        function setTestLocals($injector){
            //Core angular services/factories
            $rootScope = $injector.get('$rootScope');
            $scope = $rootScope.$new();
            $timeout = $injector.get('$timeout');
            $interval = $injector.get('$interval');
            $window = $injector.get('$window');
            $q = $injector.get('$q');
            $log = $injector.get('$log');

            //our custom services
            $logLevel = $injector.get('$logLevel');
            $consoleLogLevel = $injector.get('$consoleLogLevel');
            requests = [];
            setXMLHttpRequest();
        }


        beforeEach(module('beaver'));

        beforeEach(inject(function ($injector) {

            setTestLocals($injector);

            $logger    = $injector.get('$logger');
            injector = $injector;

            $logger.interval = INTERVAL;
            $logger.sizeLimit = SIZE_LIMIT;
            $logger.debounceInterval = DEBOUNCE_INTERVAL;

             expectedData = [
                {level: $logLevel.INFO,    eventName: "test"},
                {level: $logLevel.DEBUG,   eventName: "test"},
                {level: $logLevel.ALERT,   eventName: "test"}
            ];
        }));


        it('should call flush for onbeforeunload', function(done) {

            $window.onbeforeunload = function(){};

            var $Logger = injector.get('$Logger');

            $logger = new $Logger({
                interval: INTERVAL,
                sizeLimit: SIZE_LIMIT,
                debounceInterval: DEBOUNCE_INTERVAL
            });

            $logger._flush = sinon.spy();

            $window.onbeforeunload();

            assert($logger._flush.calledWith(true), 'Expect flush to be called for window.onbeforeunload');

            done();
        });


        it('should call flush for onunload', function(done) {

            $window.onunload = function(){};

            var $Logger = injector.get('$Logger');

            $logger = new $Logger({
                interval: INTERVAL,
                sizeLimit: SIZE_LIMIT,
                debounceInterval: DEBOUNCE_INTERVAL
            });

            $logger._flush = sinon.spy();

            $window.onunload();

            assert($logger._flush.calledWith(true), 'Expect flush to be called for window.onunload');

            done();
        });


        it('should call flush for error type', function(done){

            $logger.flush = sinon.spy();

            $logger.log($logLevel.ERROR, 'Test');

            assert($logger.flush.called, 'Expect the flush to be called');

            done();
        });

        it('should print the log to console for local mode', function(done){

            $logger.flush = sinon.spy();
            $logger.print = sinon.spy();

            $logger.log($logLevel.INFO, 'Test');

            assert($logger.print.called, 'Expect the print to be called');

            done();
        });

        it('should print the log to console for corp ip', function(done){

            $logger.flush = sinon.spy();
            $logger.print = sinon.spy();

            window.meta = {
                corp: true
            };

            $logger.log($logLevel.INFO, 'Test');

            assert($logger.print.called, 'Expect the print to be called');

            done();
        });

        it('should combine events based on debounce factor', function(done){

            var events = [];

            var stub = sinon.stub($logger, 'enqueue', function(level, event, payload){

                events.push({
                    name: event,
                    payload: payload
                })
            });

            $logger.debug('window_error', {}, {
                debounceFactor: "type1",
                debounceInterval: 1000
            });

            $logger.debug('window_error', {}, {
                debounceFactor: "type1",
                debounceInterval: 1000
            });

            $logger.debug('window_error', {}, {
                debounceFactor: "type1",
                debounceInterval: 1000
            });

            $logger.debug('some_event', {}, {
                debounceFactor: "type2",
                debounceInterval: 1000
            });

            $timeout.flush();

            assert(events.length === 2, 'Expect two events to be logged');
            assert(events[0].payload.count === 3, 'Expect the count for the first event to be three')
            done();
        });


        it('should post data on flush', function(done) {
            angular.forEach(expectedData, function(data){
                $logger.log($logLevel.INFO, data.eventName);
            });

            var promise = $logger.flush()
                .then(function(){
                    assert(requests.length === 1, 'Assert a ajax request to be sent');
                    var json = JSON.parse(requests[0]);
                    assert(json.data.events.length === 3, "Expect 3 events");

                }).finally(done);

            $scope.$apply();
            $timeout.flush();

            return promise;
        });



        it('should NOT make any requests if there is no data', function(done) {

            var promise = $logger.flush()
                .then(function(){
                    assert(requests.length === 0, 'Assert a ajax request to be sent');
                }).finally(done);

            $scope.$apply();
            $timeout.flush();

            return promise;
        });


        //
        //it('should make two posts', function(done) {
        //    buildHttpMock($httpBackend);
        //    angular.forEach(expectedData, function(data){
        //        $logger.log(data.level, data.eventName);
        //    });
        //
        //    $interval.flush(INTERVAL);
        //    $timeout.flush(10);
        //    $httpBackend.flush();
        //
        //    angular.forEach(expectedData, function(data){
        //        $logger.log(data.level, data.eventName);
        //    });
        //
        //    $interval.flush(INTERVAL);
        //    $timeout.flush(10);
        //    $httpBackend.flush();
        //
        //    done();
        //});
        //
        //
        //it('should STOP accumulating logs after size limit of SIZE_LIMIT', function(done){
        //    buildHttpMock($httpBackend);
        //    for(var i =0; i< 200; i++){
        //        $logger.log($logLevel.INFO, "test");
        //    }
        //    assert($logger.buffer.length === SIZE_LIMIT, "Expected the size of the buffer to be SIZE_LIMIT = 100")
        //    done();
        //});
        //
        //it('should post the log data on window.onbeforeunload', function (done) {
        //    buildHttpMock($httpBackend);
        //    $logger.log($logLevel.INFO, "test");
        //    angular.element($window).triggerHandler('onbeforeunload');
        //    $interval.flush(INTERVAL);
        //    $timeout.flush(10);
        //    $httpBackend.flush();
        //    done();
        //});
        //
        //it('should print the info logs to console', function (done) {
        //    buildHttpMock($httpBackend);
        //    $logger.print("somerandom", "INFO_LOG", {info: "test"});
        //    assert($log.info.logs.length === 1, "Expect to print logs to console");
        //    done();
        //});
        //
        //it('should print the error logs to console', function (done) {
        //    buildHttpMock($httpBackend);
        //    $logger.print($consoleLogLevel.error, "ERROR_LOG" ,{error: "test"});
        //    assert($log.error.logs.length === 1, "Expect to print logs to console");
        //    done();
        //});
        //
        //it('should print the warning logs to console', function (done) {
        //    buildHttpMock($httpBackend);
        //    $logger.print($consoleLogLevel.warn, "WARNING_LOG" ,{warning: "test"});
        //    assert($log.warn.logs.length === 1, "Expect to print logs to console");
        //    done();
        //});

    });

});
