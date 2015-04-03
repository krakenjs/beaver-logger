'use strict';

module.exports = function (grunt) {

    var coverageDirectory = 'coverage';

    function isFusion() {
        return process.env.FUSION_BUILD_GENERATED !== undefined;
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
        jshint: {
            options: {
                jshintrc: '.jshintrc'
            },
            gruntfile: {
                src: 'Gruntfile.js'
            },
            lib: {
                src: allFiles
            }
        },
        watch: {
            gruntfile: {
                files: '<%= jshint.gruntfile.src %>',
                tasks: ['jshint:gruntfile']
            },
            lib: {
                files: '<%= jshint.lib.src %>',
                tasks: ['jshint:lib', 'nodeunit']
            }
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
        rename: {
            coverageReport: {
                files: [
                    {src: [coverageDirectory + '/coverage*.json'],
                        dest: coverageDirectory + '/coverage.json'},
                ]
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
            "prod": {
                options: {
                    production: true
                }
            }
        },
        plato: {
            fusion: {
                options: {
                    jshint: false,
                    exclude: /Gruntfile.js/,
                    complexity: {
                        logicalor: false,
                        switchcase: false,
                        forin: true,
                        trycatch: true
                    }
                },
                files: {
                    'plato-reports': srcFiles
                }
            }
        },
        checkcoverage: {
            options: {
                statements: 90,
                functions: 90,
                branches: 90,
                lines: 95,
                includePattern: coverageDirectory + '/coverage.json'
            }
        }
    });

    require('load-grunt-tasks')(grunt);
    // These plugins provide necessary tasks.
    grunt.loadNpmTasks('grunt-ci-suite');
    grunt.loadNpmTasks('grunt-plato');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-karma');
    grunt.loadNpmTasks('grunt-bower-install-simple');

    // Default task.
    grunt.registerTask('default', ['jshint', 'copy']);
    grunt.registerTask('test', ['jshint', 'plato', 'bower-install-simple', 'karma']);
    grunt.registerTask('lint', ['jshint']);
    grunt.registerTask('ci', ['test']);
    grunt.registerTask('coverage', ['clean:coverage', 'karma:unit', 'rename:coverageReport']);
};
