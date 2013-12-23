module.exports = function (grunt) {
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
        src: 'dist/*.js',  // source files mask
        dest: 'dist/',    // destination folder
        expand: true,    // allow dynamic building
        flatten: true,   // remove all unnecessary nesting
        ext: '.min.js'   // replace .js to .min.js
      }
    }
  });

  // load plugins
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-uglify');

  grunt.registerTask('min', ['clean', 'concat', 'uglify']);
};
