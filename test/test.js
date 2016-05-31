
import $logger from 'client/index';
import { $mockEndpoint, patchXmlHttpRequest } from 'sync-browser-mocks/dist/sync-browser-mocks';

patchXmlHttpRequest();

$logger.init({
   uri: '/test/api/log'
});

var logEndpoint = $mockEndpoint.register({
    method: 'GET',
    uri: '/test/api/log',
    data: function() {
        return {
            name: 'Zippy the Pinhead'
        };
    }
}).listen();

describe('xcomponent tests', function() {

    it('should assert log something and flush it to the buffer', function() {

        $logger.info('hello_world', {
            foo: 'bar'
        });

        var logEndpoint = $mockEndpoint.register({
            method: 'POST',
            uri: '/test/api/log',
            handler: function(data) {
                var hasLog = data.events.some(event => event.event === 'hello_world' && event.level === 'info');
                assert.isTrue(hasLog, 'Expected posted payload to contain logged log')
            }
        });

        logEndpoint.expectCalls();

        return $logger.flush().then(function() {
            logEndpoint.done();
        });
    });
});