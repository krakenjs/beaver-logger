/* global describe: false, it: false, before: false, after: false, beforeEach: false, sinon: false, assert: false */

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
            };
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


    describe('Logger :: Tests', function () {

        var previousBeforeUnloadHandler = window.onbeforeunload;
        var previousUnloadHandler = window.onunload;


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


        after(function(){
            window.onbeforeunload = previousBeforeUnloadHandler;
            window.onunload = previousUnloadHandler;
        });

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

        it('should print the log to console when hermesdev cookie is set', function(done){

            $logger.flush = sinon.spy();
            $logger.print = sinon.spy();

            window.meta = {
                corp: false
            };

            $logger.deploy.isLocal = function(){
                return false;
            };

            $logger.deploy.isStage = function(){
                return false;
            };

            window.cookies = window.cookies || [];
            window.cookies['hermesdev'] = '1';

            $logger.log($logLevel.INFO, 'Test');

            assert($logger.print.called, 'Expect the print to be called');

            done();
        });

        it('should NOT print the log to console when hermesdev cookie is not set', function(done){

            $logger.flush = sinon.spy();
            $logger.print = sinon.spy();

            window.cookies = window.cookies || [];
            window.cookies['hermesdev'] = '0';

            window.meta = {
                corp: false
            };

            $logger.deploy.isLocal = function(){
                return false;
            };

            $logger.deploy.isStage = function(){
                return false;
            };


            $logger.log($logLevel.INFO, 'Test');

            assert(!$logger.print.called, 'Expect the print to be NOT called');

            done();
        });

        it('should combine events based on debounce factor', function(done){

            var events = [];

            var stub = sinon.stub($logger, 'enqueue', function(level, event, payload){

                events.push({
                    name: event,
                    payload: payload
                });
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
            assert(events[0].payload.count === 3, 'Expect the count for the first event to be three');
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

    });



    describe('Logger :: Tests for window unload', function () {
        var previousBeforeUnloadHandler = window.onbeforeunload;
        var previousUnloadHandler = window.onunload;
        var onbeforeunloadSpy = sinon.spy();
        var onunloadSpy = sinon.spy();

        beforeEach(module('beaver'));

        beforeEach(inject(function ($injector) {
            window.onbeforeunload = onbeforeunloadSpy;
            window.onunload = onunloadSpy;
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

        after(function(){
            window.onbeforeunload = previousBeforeUnloadHandler;
            window.onunload = previousUnloadHandler;
        });

        it('should call previously set window.onbeforeunload', function(done) {
            window.onbeforeunload();
            assert(onbeforeunloadSpy.calledOnce, 'Should call previous onbeforeunload handler only once');
            done();
        });

        it('should call previously set window.onunload', function(done) {
            window.onunload();
            assert(onunloadSpy.calledOnce, 'Should call previous onunload handler only once');
            done();
        });

    });

});
