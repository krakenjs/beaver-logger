/* @flow */
/* eslint import/no-nodejs-modules: off, import/no-default-export: off */

import { getWebpackConfig } from 'grumbler-scripts/config/webpack.config';

const FILE_NAME = 'beaver-logger';
const MODULE_NAME = 'beaver';

export const WEBPACK_CONFIG = getWebpackConfig({
    filename:   FILE_NAME,
    modulename: MODULE_NAME,
    minify:     false
});

export const WEBPACK_CONFIG_MIN = getWebpackConfig({
    filename:   FILE_NAME,
    modulename: MODULE_NAME,
    minify:     true
});

export const WEBPACK_CONFIG_TEST = getWebpackConfig({
    modulename: MODULE_NAME,
    test:       true
});

export default [ WEBPACK_CONFIG, WEBPACK_CONFIG_MIN ];
