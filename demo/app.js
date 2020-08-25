/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable flowtype/require-valid-file-annotation */
/* eslint-disable no-console */
/* eslint-disable import/no-commonjs */

const app = require('express')();

const beaverLogger = require('./beaver-logger/server.js');

const port = 3000;

app.use(beaverLogger.expressEndpoint({
    uri:        '/api/log',
    enableCors: true
}));

app.listen(port, () => {
    console.log(`Logger listening at http://localhost:${ port }`);
});
