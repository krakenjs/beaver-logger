/* @flow */

import { $mockEndpoint, patchXmlHttpRequest } from 'sync-browser-mocks/dist/sync-browser-mocks';

import { Logger } from '../src';

patchXmlHttpRequest();

describe('beaver-logger tests', () => {
    it('should log something and flush it to the buffer', () => {
        // eslint-disable-next-line compat/compat
        window.navigator.sendBeacon = undefined; // simulate IE 11 scenario

        const $logger = Logger({
            url: '/test/api/log'
        });

        $logger.info('hello_world', {
            foo: 'bar',
            bar: true
        });

        const logEndpoint = $mockEndpoint.register({
            method:  'POST',
            uri:     '/test/api/log',
            handler: (req) => {
                const hasLog = req.data.events.some(event => event.event === 'hello_world' && event.level === 'info');

                if (!hasLog) {
                    throw new Error('Expected posted payload to contain logged log');
                }

                return {};
            }
        });

        logEndpoint.expectCalls();
        return $logger.flush().then(() => {
            logEndpoint.done();
        });
    });

    it('should log something and flush it to the buffer using sendBeacon', () => {
        const $logger = Logger({
            url:              '/test/api/log',
            enableSendBeacon: true
        });

        $logger.info('hello_world', {
            foo: 'bar',
            bar: true
        });

        const logEndpoint = $mockEndpoint.register({
            method:  'POST',
            uri:     '/test/api/log',
            handler: (req) => {
                const hasLog = req.data.events.some(event => event.event === 'hello_world' && event.level === 'info');

                if (!hasLog) {
                    throw new Error('Expected posted payload to contain logged log');
                }

                return {};
            }
        });

        let sendBeaconCalled = false;

        // eslint-disable-next-line eslint-comments/disable-enable-pair
        /* eslint-disable compat/compat */
        window.navigator.sendBeacon = () => {
            sendBeaconCalled = true;
        };

        return $logger.flush().then(() => {
            if (sendBeaconCalled) {
                logEndpoint.done();
            } else {
                throw new Error('Result from calling sendBeacon() should have been false.');
            }
        });
    });

    it('should not log using sendBeacon if custom headers are passed', () => {
        const $logger = Logger({
            url:              '/test/api/log',
            enableSendBeacon: true
        });
        $logger.addHeaderBuilder(() => {
            return {
                'x-custom-header': 'hunter2'
            };
        });

        $logger.info('hello_world', {
            foo: 'bar',
            bar: true
        });

        const logEndpoint = $mockEndpoint.register({
            method:  'POST',
            uri:     '/test/api/log',
            handler: (req) => {
                const hasLog = req.data.events.some(event => event.event === 'hello_world' && event.level === 'info');

                if (!hasLog) {
                    throw new Error('Expected posted payload to contain logged log');
                }

                return {};
            }
        });

        let sendBeaconCalled = false;

        window.navigator.sendBeacon = () => {
            sendBeaconCalled = true;
        };

        logEndpoint.expectCalls();
        return $logger.flush().then(() => {
            if (sendBeaconCalled) {
                throw new Error('Result from calling sendBeacon() should have been false.');
            } else {
                logEndpoint.done();
            }
        });
    });

    it('should not print logs in browser side', () => {
        const loggerDB = [];

        const mockConsole = (...args) => loggerDB.push(args);
        const findLoggedDBEntry = (eventName) => {
            const entryLog = loggerDB.find(event => event[0] === eventName);

            if (entryLog) {
                throw new Error('Expected log to not be printed in browser side');
            }
        };

        window.console.info = mockConsole;
        window.console.error = mockConsole;
        window.console.warn = mockConsole;
        window.console.debug = mockConsole;

        const $logger = Logger({
            url:                   '/test/api/log',
            disableBrowserLogging: true
        });

        $logger.info('test_info', {
            foo: 'bar',
            bar: true
        });
        $logger.error('test_error',  {
            foo: 'bar',
            bar: true
        });
        $logger.warn('test_warn', {
            foo: 'bar',
            bar: true
        });
        $logger.debug('test_debug', {
            foo: 'bar',
            bar: true
        });

        const logEndpoint = $mockEndpoint.register({
            method:  'POST',
            uri:     '/test/api/log',
            handler: (req) => {
                const hasLogInfo = req.data.events.some(event => event.event === 'test_info' && event.level === 'info');
                const hasLogError = req.data.events.some(event => event.event === 'test_error' && event.level === 'error');
                const hasLogWarn = req.data.events.some(event => event.event === 'test_warn' && event.level === 'warn');
                const hasLogDebug = req.data.events.some(event => event.event === 'test_debug' && event.level === 'debug');

                if (!hasLogInfo || !hasLogError || !hasLogWarn || !hasLogDebug) {
                    throw new Error('Expected posted payload to contain logged log');
                }

                return {};
            }
        });

        findLoggedDBEntry('test_info');
        findLoggedDBEntry('test_error');
        findLoggedDBEntry('test_warn');
        findLoggedDBEntry('test_log');

        logEndpoint.expectCalls();
        return $logger.flush().then(() => {
            logEndpoint.done();
        });
    });
});
