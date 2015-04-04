// Karma configuration
// Generated on Mon Jun 23 2014 15:46:44 GMT-0400 (EDT)

module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jasmine'],


    // list of files / patterns to load in the browser
    files: [
      // libraries
      'https://maps.google.com/maps/api/js',
      __dirname + '/../spec/lib/angular.js',
      __dirname + '/../spec/lib/angular-mocks.js',
      __dirname + '/../spec/lib/markerclusterer.js',

      // our app
      __dirname + '/../app/scripts/app.js',
      __dirname + '/../app/scripts/directives/*.js',
      __dirname + '/../app/scripts/services/*.js',

      // tests
      __dirname + '/../spec/directives/*_spec.js',
      __dirname + '/../spec/services/*_spec.js'
    ],


    // list of files to exclude
    exclude: [ ],


    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: { },


    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['progress'],


    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: false,


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['PhantomJS'],


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: true
  });
};
