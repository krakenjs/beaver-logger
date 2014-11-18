'use strict';

module.exports = function(grunt) {

    var appConfig = {
        dist: 'dist',
        bower_root: 'components'
    };

    // Project configuration.
    grunt.initConfig({
        path: appConfig,
        jshint: {
            options: {
                jshintrc: '.jshintrc'
            },
            gruntfile: {
                src: 'Gruntfile.js'
            },
            app: {
                src: ['app/**/*.js']
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

        karma: {
            unit: {
                configFile: 'test/karma.config.js',
                singleRun: false,
                browsers: ['Chrome'],
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
        }
    });

    // These plugins provide necessary tasks.
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-karma');
    grunt.loadNpmTasks('grunt-bower-install-simple');

    // Default task.
    grunt.registerTask('default', ['jshint', 'copy']);
    grunt.registerTask('test', ['bower-install-simple', 'karma']);

};