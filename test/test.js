/* @flow */

import { $mockEndpoint, patchXmlHttpRequest } from 'sync-browser-mocks/dist/sync-browser-mocks';

import { Logger } from '../src';

patchXmlHttpRequest();

describe('beaver-logger tests', () => {

    it('should log something and flush it to the buffer', () => {

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
});
