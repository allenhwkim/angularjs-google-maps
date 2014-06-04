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
      options: {
        compress: {
          drop_console: true
        }
      },
      files: { 
        src: 'dist/*.js',  // source files mask
        dest: 'dist/',    // destination folder
        expand: true,    // allow dynamic building
        flatten: true,   // remove all unnecessary nesting
        ext: '.min.js'   // replace .js to .min.js
      }
    },

    express: {
      site1: {
        options: {
          port: 9001,
          bases: 'examples'
        }
      },
    },
      
    protractor: {
      options: {
        configFile: "protractor_conf.js", // Default config file
        keepAlive: false, // If false, the grunt process stops when the test fails.
        noColor: false, // If true, protractor will not use colors in its output.
        args: {
          // Arguments passed to the command
        }
      },
      single: {
        options: {}
      },
    },

    bump: {
      options: {
        pushTo: ''
      }
    }, 


  });

  grunt.registerTask('test', ['express', 'protractor']);
  grunt.registerTask('server', ['express', 'express-keepalive']);
  grunt.registerTask('min', ['clean', 'concat', 'uglify']);

};
