// Karma configuration
// Generated on Sun Nov 09 2014 13:19:03 GMT-0800 (PST)

module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '../',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['mocha', 'requirejs', 'sinon-chai'],


    // list of files / patterns to load in the browser
    files: [
        {
            pattern: 'test/spec/**/*.js',
            included: false
        },
        {
            pattern: 'test/mocks/**/*.js',
            included: false
        },
        {
            pattern: 'dist/*',
            included: false
        },
        {
            pattern: 'components/**/*.js',
            included: false
        },
        'test/test.config.js'
    ],


    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['progress', "coverage", 'junit'],


    // optionally, configure the reporter
    coverageReporter: {
        reporters: [ 
          { type : 'text-summary', dir : 'coverage/'},
          { type : 'html', dir : 'coverage/'},
        ]
    },

    junitReporter: {
      outputFile: 'xunit.xml',
      suite: ''
    },

    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['Chrome'],


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false
  });
};
