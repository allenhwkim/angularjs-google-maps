/* global module */
module.exports = function (grunt) {

    // Load Grunt tasks declared in the package.json file
    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);
    
    grunt.initConfig({

        clean : {
            dist: ['dist/*.js', 'examples/dist/*.js']
        },

        concat : {
            dist: {
                src: ['app/scripts/*.js', 'app/scripts/**/*.js'],
                dest: 'dist/ng-map.js'
            }
        },

        uglify: {
            files: { 
                src: 'dist/*.js',    // source files mask
                dest: 'dist/',        // destination folder
                expand: true,        // allow dynamic building
                flatten: true,     // remove all unnecessary nesting
                ext: '.min.js'     // replace .js to .min.js
            }
        },
        
        connect: {
            all : {
                options: {
                    port: 9001,
                    middleware: function(connect /*, options */) {
                        return [
                            require('connect-livereload')({
                                src: "//rawgithub.com/allenhwkim/util/master/livereload.js"
                            }),
                            connect.static('examples'),
                            connect.directory('examples')
                        ];
                    }
                }
            }
        },

        watch: {
            all: {
                files: ['app/**/*', 'examples/*'],
                options: {
                    livereload: true    // starts livereload server at port 35729
                }
            }
        },

        bump: {
            options: {
                pushTo: ''
            }
        }, 


    });

    grunt.registerTask('server', ['connect', 'watch']);
    grunt.registerTask('min', ['clean', 'concat', 'uglify']);

};
