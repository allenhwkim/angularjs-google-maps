// The main suite of Protractor tests.
exports.config = {
  seleniumServerJar: __dirname +
    '/../node_modules/gulp-protractor' +
    '/node_modules/protractor/selenium/selenium-server-standalone-2.45.0.jar',

  browserName: 'chrome',

  // Exclude patterns are relative to this directory.
  // exclude: [],

  // run tests in parallel
  //capabilities: {
  //  browserName: 'chrome',
  //  shardTestFiles: true,
  //  maxInstances: 10
  //},

  jasmineNodeOpts: {
    showColors: true,
    isVerbose: true, // List all tests in the console
    includeStackTrace: true,
    defaultTimeoutInterval: 10000
  },

  plugins: [{
    path: __dirname + '/../node_modules/protractor/plugins/console/index.js',
    failOnWarning: true,
    failOnError: true
  }],

  baseUrl: 'http://localhost:8888'
};
