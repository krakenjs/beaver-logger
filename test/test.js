
import $logger from 'client/index';
import { $mockEndpoint, patchXmlHttpRequest } from 'sync-browser-mocks/dist/sync-browser-mocks';

patchXmlHttpRequest();

$logger.init({
   uri: '/test/api/log'
});

describe('xcomponent tests', function() {

    it('should log something and flush it to the buffer', function() {

        $logger.info('hello_world', {
            foo: 'bar'
        });

        var logEndpoint = $mockEndpoint.register({
            method: 'POST',
            uri: '/test/api/log',
            handler: function(req) {
                var hasLog = req.data.events.some(event => event.event === 'hello_world' && event.level === 'info');
                assert.isTrue(hasLog, 'Expected posted payload to contain logged log')
            }
        });

        logEndpoint.expectCalls();

        return $logger.flush().then(function() {
            logEndpoint.done();
        });
    });
});
