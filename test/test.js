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
});
