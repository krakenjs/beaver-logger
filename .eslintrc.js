/* @flow */

module.exports = {
    'extends': require.resolve('grumbler-scripts/config/.eslintrc-browser'),

    'globals': {
        __BEAVER_LOGGER__: true
    }
};