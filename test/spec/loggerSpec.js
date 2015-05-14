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

        it('should convert non-object payload to object', function(done){

            $logger.print = sinon.spy();

            var i = 0;
            var expected_payload = ['abc', undefined, null, '', []];
            ["abc", undefined, null, '', []].forEach(function(e){
                $logger.log($logLevel.INFO, 'test', e);
                assert.deepEqual(expected_payload[i++], $logger.print.getCall(i-1).args[2].payload);
            });

            done();
        });

        it('should NOT print the log to console for local mode', function(done){

            $logger.flush = sinon.spy();
            $logger.print = sinon.spy();

            $logger.log($logLevel.INFO, 'Test', {}, {noConsole: true});

            assert(!$logger.print.called, 'Expect the print to be NOT called');

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

            $rootScope.$emit('startLoad');
            $interval.flush(200);
            $rootScope.$emit('allLoaded');

            assert($logger.info.called, 'Expect heartbeat to be logged');
            assert($logger.info.getCall(0).args[2].noConsole, 'Expect noConsole to be set');
            assert($logger.info.getCall(0).args[2].heartbeat, 'Expect heartbeat flag to be set');

            Date.now = origDateNow;
            done();

        });

        it('should NOT fire heartbeat if a event is logged recently', function(done) {
            var origDateNow = Date.now;
            var lastLogTime = Date.now();


            Date.now = function(){
                return lastLogTime + 100;
            };

            $logger.info = sinon.spy();
            $rootScope.$emit('startLoad');
            $interval.flush(200);
            $rootScope.$emit('allLoaded');
            assert(!$logger.info.called, 'Expect heartbeat to be NOT logged');
            Date.now = origDateNow;
            done();
        });

        it('should clear heartbeat beacon on allLoaded event', function(done) {
            var origDateNow = Date.now;
            var lastLogTime = Date.now();


            Date.now = function(){
                return lastLogTime + 300;
            };

            $logger.info = sinon.spy();
            $rootScope.$emit('startLoad');
            $rootScope.$emit('allLoaded');
            $interval.flush(200);

            assert(!$logger.info.called, 'Expect heartbeat to be NOT logged');
            Date.now = origDateNow;
            done();
        });
    });

    describe('Logger :: Tests for howbusy', function () {

        //var $interval;
        var origDateNow, lastLogTime;

        beforeEach(module('beaver'));

        beforeEach(inject(function ($injector) {

            $logger = $injector.get('$logger');
            $interval = $injector.get('$interval');
            $rootScope = $injector.get('$rootScope');

            $logger.print = sinon.spy();

            origDateNow = Date.now;
            lastLogTime = Date.now();

        }));

        afterEach(function(){
            Date.now = origDateNow;
        });

        it('should log howbusy even no need to log heartbeat before allLoaded', function(done) {
            Date.now = function(){
                return lastLogTime + 100;
            };

            $rootScope.$emit('startLoad');
            $interval.flush(200);
            $logger.info('test_log', {
                key: "value"
            });
            $rootScope.$emit('allLoaded');

            var payload = $logger.print.getCall(0).args[2];
            assert.equal(payload.key, 'value', 'Expect the original payload');
            assert.isDefined(payload.lastSampledTime, 'Expect lastSampledTime exists in payload');
            assert(payload.lastLag >= 0, 'Expect lag is not negative');

            done();
        });

        it('should log howbusy sequence while loading', function(done) {

            Date.now = function(){
                return lastLogTime + 300;
            };

            $rootScope.$emit('startLoad');
            $interval.flush(200);
            $logger.info('test_log1', {
                key1: "value1"
            });

            Date.now = function(){
                return lastLogTime + 700;
            };
            $interval.flush(200);
            $logger.info('test_log2', {
                key2: "value2"
            });

            var payload1 = $logger.print.getCall(0).args[2];
            assert.equal(payload1.key1, 'value1', 'Expect the original payload1');
            assert(payload1.lastLag >= 100, 'Expect lag is larger than 300-200');
            assert.equal(payload1.lastLag, payload1.maxLag, 'Expect max is updated');

            var payload2 = $logger.print.getCall(1).args[2];
            assert.equal(payload2.key2, 'value2', 'Expect the original payload2');
            assert(payload2.lastLag >= 200, 'Expect lag is larger than 700-300-200');
            assert.equal(payload2.lastLag, payload2.maxLag, 'Expect max is updated');

            done();
        });

        it('should still log howbusy after allLoaded event', function(done) {
            Date.now = function(){
                return lastLogTime + 300;
            };

            $rootScope.$emit('startLoad');
            $rootScope.$emit('allLoaded');
            $interval.flush(200);
            $logger.info('test_log', {
                key: "value"
            });

            var payload = $logger.print.getCall(0).args[2];
            assert.equal(payload.key, 'value', 'Expect the original payload');
            ['lastSampledTime', 'lastLag', 'maxLag', 'dampendedLag'].forEach(function (e) {
                assert.isDefined(payload[e], 'Expect ' + e + ' still exist in payload');
            });

            done();
        });
    });


    /**
     * -----------------------------------------------------------------------------------------------------------------
     *
     *  Tests for Heartbeats
     *
     * -----------------------------------------------------------------------------------------------------------------
     */

    describe('Logger :: Tests for heartbeat', function () {

        var $interval;

        beforeEach(module('beaver'));

        beforeEach(inject(function ($injector) {

            $logger = $injector.get('$logger');
            $interval = $injector.get('$interval');
            $rootScope = $injector.get('$rootScope');

        }));

        it('should NOT fire heartbeat if threshold is reached', function(done) {

            $logger.contHeartBeatCount = $logger.contHeartBeatCountThreshold = 100;

            $logger.info = sinon.spy();
            $logger.flush = sinon.spy();

            $interval.flush(5*1000);

            assert(!$logger.info.called, 'Expect heartbeat to be NOT sent');
            assert(!$logger.flush.called, 'flush should not be called');

            done();

        });

        it('should fire heartbeat if threshold is NOT reached', function(done) {

            $logger.contHeartBeatCount = 10;
            $logger.contHeartBeatCountThreshold = 100;

            $logger.info = sinon.spy();

            $interval.flush(5*1000);

            assert($logger.info.called, 'Expect heartbeat to be sent');
            assert($logger.contHeartBeatCount === 11, 'Expect the contHeartBeatCount to be incremented');

            var payload = $logger.info.getCall(0).args[1];
            assert(payload.sequenceNum === 11, 'Expect to send the correct sequence number for heartbeat');
            var options = $logger.info.getCall(0).args[2];
            assert(options.noConsole, 'Expect to set noConsole in options');
            assert(options.heartbeat, 'Expect to set heartbeat in options');

            done();

        });

        it('should fire heartbeat and call flush', function(done) {


            $logger.info = sinon.spy();
            $logger.flush = sinon.spy();

            $logger.lastFlushTime = Date.now() - (70 * 1000);

            $interval.flush(5*1000);

            assert($logger.info.called, 'Expect heartbeat to be sent');
            assert($logger.flush.called, 'Expect flush to be called');

            done();

        });

        it('should fire heartbeat but NOT call flush', function(done) {


            $logger.info = sinon.spy();
            $logger.flush = sinon.spy();

            $logger.lastFlushTime = Date.now() - (10 * 1000);

            $interval.flush(5*1000);

            assert($logger.info.called, 'Expect heartbeat to be sent');
            assert(!$logger.flush.called, 'Expect flush to be NOT called');

            done();

        });
    });

});
