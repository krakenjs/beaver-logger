/* @flow */
/* eslint import/no-nodejs-modules: off, import/no-default-export: off */

import { getWebpackConfig } from 'grumbler-scripts/config/webpack.config';

import globals from './globals';

const FILE_NAME = 'beaver-logger';
const MODULE_NAME = 'beaver';

export const WEBPACK_CONFIG = getWebpackConfig({
    filename:   FILE_NAME,
    modulename: MODULE_NAME,
    minify:     false,
    vars:       globals
});

export const WEBPACK_CONFIG_MIN = getWebpackConfig({
    filename:   FILE_NAME,
    modulename: MODULE_NAME,
    minify:     true,
    vars:       globals
});

export const WEBPACK_CONFIG_LITE = getWebpackConfig({
    filename:   `${ FILE_NAME  }.lite`,
    modulename: MODULE_NAME,
    minify:     false,
    vars:       {
        ...globals,
        __BEAVER_LOGGER__: {
            ...globals.__BEAVER_LOGGER__,
            __LITE_MODE__: true
        }
    }
});

export const WEBPACK_CONFIG_LITE_MIN = getWebpackConfig({
    filename:   `${ FILE_NAME  }.lite`,
    modulename: MODULE_NAME,
    minify:     true,
    vars:       {
        ...globals,
        __BEAVER_LOGGER__: {
            ...globals.__BEAVER_LOGGER__,
            __LITE_MODE__: true
        }
    }
});

export const WEBPACK_CONFIG_TEST = getWebpackConfig({
    modulename: MODULE_NAME,
    test:       true,
    vars:       globals
});

export default [ WEBPACK_CONFIG, WEBPACK_CONFIG_MIN, WEBPACK_CONFIG_LITE, WEBPACK_CONFIG_LITE_MIN ];
