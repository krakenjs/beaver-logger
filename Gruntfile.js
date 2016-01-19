'use strict';

module.exports = function (grunt) {

    function isFusion() {
        return process.env.FUSION_BUILD_GENERATED !== undefined || process.env.BUILD_ID !== undefined;
    }

    grunt.initConfig({
        eslint: {
            options: {
                config: '.eslintrc',
                format: isFusion() ? 'checkstyle' : 'stylish',
                outputFile: isFusion() ? 'checkstyle.xml' : ''
            },
            module: [
                'src/**/*.js'
            ]
        },
        browserify: {
            dist: {
                options: {
                    transform: [
						['babelify', { "stage": 0 }],
						['uglifyify', { "stage": 1, global: true }]
					]
                },
                files: {
                    'dist/beaver-logger.js': 'src/index.js'
                }
            }
        }
    });

    require('load-grunt-tasks')(grunt);

    grunt.registerTask('lint', ['eslint']);
    grunt.registerTask('build', ['eslint', 'browserify']);
};
