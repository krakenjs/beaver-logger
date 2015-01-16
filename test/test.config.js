"use strict";

var tests = Object.keys(window.__karma__.files).filter(function (file) {
    return (/Spec\.js$/).test(file);
});

requirejs.config({
    paths: {
        text: '../components/requirejs-text/text',
        angular: '../components/angular/angular.min',
        angularRoute: '../components/angular-route/angular-route.min',
        angularResource: '../components/angular-resource/angular-resource.min',
        angularMocks: '../components/angular-mocks/angular-mocks',
        angularSanitize: '../components/angular-sanitize/angular-sanitize.min',
        jquery: '../components/jquery/dist/jquery',
        requirejs: '../components/requirejs/require',
        squid: '../test/mocks/squid',
        originalSquid: '../components/squid/dist'
    },
    shim: {
        'angular': {
            'exports': 'angular'
        },
        'angularRoute': ['angular'],
        'angularMocks': {
            deps: ['angular'],
            'exports': 'angular.mock'
        },
        'angularSanitize' : {
            deps : ['angular']
        }
    },

    // Ask Require.js to load these files (all our tests).
    deps: tests,

    // Karma serves files from '/base'
    baseUrl: '/base/dist',

    // Set test to start run once Require.js is done.
    callback: window.__karma__.start
});
