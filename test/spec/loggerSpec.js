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

    window.enablePerformance = true;

    window.performance = {
        now: Date.now,
        timing: {
            connectEnd: 0,
            requestStart: 0
        }
    };


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

        it('should convert non-object payload to object', function(done){

            $logger.print = sinon.spy();

            var i = 0;
            ["abc", true, 10, undefined, null, '', []].forEach(function(e){

                $logger.log($logLevel.INFO, 'test', e);

                var expected = e || {};

                if(angular.isArray(expected) || !angular.isObject(expected)){
                    assert.deepEqual(expected, $logger.print.getCall(i++).args[2].payload);
                }
                else{
                    assert.deepEqual(undefined, $logger.print.getCall(i++).args[2].payload);
                }
            });

            done();
        });

        it('should NOT print the log to console for noConsole mode', function(done){

            $logger.flush = sinon.spy();
            $log.info = sinon.spy();

            $logger.log($logLevel.INFO, 'Test', {}, {noConsole: true});

            assert(!$log.info.called, 'Expect the print to be NOT called');

            done();
        });


        it('should print the log to console for local mode', function(done){

            $logger.flush = sinon.spy();
            $log.info = sinon.spy();

            $logger.log($logLevel.INFO, 'Test');

            assert($log.info.called, 'Expect the print to be called');

            done();
        });

        it('should print the log to console for corp ip', function(done){

            $logger.flush = sinon.spy();
            $log.info = sinon.spy();

            window.meta = {
                corp: true
            };

            $logger.log($logLevel.INFO, 'Test');

            assert($log.info.called, 'Expect the print to be called');

            done();
        });

        it('should print the log to console when hermesdev cookie is set', function(done){

            $logger.flush = sinon.spy();
            $log.info = sinon.spy();

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

            assert($log.info.called, 'Expect the print to be called');

            done();
        });

        it('should NOT print the log to console when hermesdev cookie is not set', function(done){

            $logger.flush = sinon.spy();
            $log.info = sinon.spy();

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

            assert(!$log.info.called, 'Expect the print to be NOT called');

            done();
        });

        it('should combine events based on debounce factor', function(done){

            var events = [];

            $logger.debug('window_error', {}, {
                unique: true
            });

            $logger.debug('window_error', {}, {
                unique: true
            });

            $logger.debug('window_error', {}, {
                unique: true
            });

            $logger.debug('some_event', {}, {
                unique: true
            });

            assert.equal($logger.buffer.length, 2, 'Expect two events to be logged');
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


    describe('Logger :: Tests for loading_heartbeat', function () {

        var $interval;

        beforeEach(module('beaver'));

        beforeEach(inject(function ($injector) {

            $logger = $injector.get('$logger');
            $interval = $injector.get('$interval');
            $rootScope = $injector.get('$rootScope');

        }));

        it('should fire heartbeat if there is no log for a while', function(done) {
            var origDateNow = Date.now;

            var lastLogTime = Date.now();

            Date.now = function(){
                return lastLogTime + 300;
            };

            $logger.info = sinon.spy();
            $logger.debug('foo');
            $interval.flush(6000);

            assert($logger.info.called, 'Expect heartbeat to be logged');

            Date.now = origDateNow;
            done();

        });
    });

    describe('Logger :: Tests for heartbeat', function () {

        //var $interval;
        var origDateNow, lastLogTime;

        beforeEach(module('beaver'));

        beforeEach(inject(function ($injector) {

            $logger = $injector.get('$logger');
            $interval = $injector.get('$interval');
            $rootScope = $injector.get('$rootScope');

            origDateNow = Date.now;
            lastLogTime = Date.now();

        }));

        afterEach(function(){
            Date.now = origDateNow;
        });

        it('should log heartbeat ', function(done) {

            $logger.debug('foo');

            $logger.info = sinon.spy();

            $interval.flush(6000);

            var event = $logger.info.getCall(0).args[0];

            assert.equal(event, 'heartbeat', 'Event should be heartbeat');

            done();
        });

        it('should log a maximum number of events even with heartbeat ', function(done) {

            $logger.debug('foo');

            $interval.flush($logger.sizeLimit * $logger.heartbeatInterval);

            assert.equal($logger.buffer.length, $logger.hearbeatMaxThreshold + 2, 'Event should be heartbeat');

            done();
        });

        it('should log howbusy ', function(done) {

            $logger.debug('foo');

            $logger.info = sinon.spy();

            $interval.flush(6000);

            var payload = $logger.info.getCall(0).args[1];

            assert.isDefined(payload.lastSampledTime, 'Expect lastSampledTime exists in payload');
            assert.isDefined(payload.lastLag, 'Expect lag is present');
            assert.isDefined(payload.dampendedLag, 'Expect dampenedLag is present');

            done();
        });
    });

});
