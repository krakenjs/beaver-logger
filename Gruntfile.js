'use strict';

module.exports = function (grunt) {

    var coverageDirectory = 'coverage';

    function isFusion() {
        return process.env.FUSION_BUILD_GENERATED !== undefined || process.env.BUILD_ID !== undefined;
    }

    var appConfig = {
        dist: 'dist',
        bower_root: 'components'
    };

    var srcFiles = ['*.js', 'dist/**/*.js'];
    var testFiles = ['test/**/*.js'];
    var allFiles = [];
    Array.prototype.push.apply(allFiles, srcFiles);
    Array.prototype.push.apply(allFiles, testFiles);

    // Project configuration.
    grunt.initConfig({
        clean: {
            tmp: 'tmp',
            build: '.build',
            coverage: coverageDirectory
        },
        path: appConfig,
        eslint: {
            options: {
                config: '.eslintrc',
                format: isFusion() ? 'checkstyle' : 'stylish',
                outputFile: isFusion() ? 'checkstyle.xml' : ''
            },
            module: [
                'dist/**/*.js'
            ]
        },
        copy: {
            dist: {
                expand: true,
                cwd: 'app/',
                src: '**',
                dest: 'dist/',
                filter: ''
            }
        },
        karma: {
            unit: {
                configFile: 'test/karma.config.js',
                singleRun: true,
                browsers: ['PhantomJS'],
                src: ["test/spec/**/*.js"],
                preprocessors: {
                    'dist/**/*.js': 'coverage'
                }

            }
        },

        "bower-install-simple": {
            options: {
                color: true,
                directory: "<%= path.bower_root %>"
            },
            "dev": {
                options: {
                    production: false
                }
            },
            "prod": {
                options: {
                    production: true
                }
            }
        },
        browserify: {
            dist: {
                options: {
                    transform: [['babelify', { "stage": 0 }]]
                },
                files: {
                    'dist/beaver-logger.js': 'src/index.js'
                }
            }
        }
    });

    require('load-grunt-tasks')(grunt);
    // These plugins provide necessary tasks.
    grunt.loadNpmTasks('grunt-ci-suite');
    grunt.loadNpmTasks('grunt-plato');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-karma');
    grunt.loadNpmTasks('grunt-bower-install-simple');

    // Default task.
    grunt.registerTask('cover', ['coverage']);
    grunt.registerTask('default', ['lint', 'copy']);
    grunt.registerTask('test', ['lint', 'plato', 'bower-install-simple', 'karma']);
    grunt.registerTask('lint', ['eslint']);
    grunt.registerTask('ci', ['test']);
    grunt.registerTask('coverage', ['clean:coverage', 'karma:unit']);
};
