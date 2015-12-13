// The main suite of Protractor tests.
exports.config = {
  seleniumServerJar: __dirname +
    '/../node_modules/gulp-protractor' +
    '/node_modules/protractor/selenium/selenium-server-standalone-2.47.1.jar',

  browserName: 'chrome',

  jasmineNodeOpts: {
    showColors: true,
    isVerbose: true, // List all tests in the console
    includeStackTrace: true,
    defaultTimeoutInterval: 10000
  },

  baseUrl: 'http://localhost:8888'
};
