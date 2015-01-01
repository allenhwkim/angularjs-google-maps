// The main suite of Protractor tests.
exports.config = {
  seleniumServerJar: __dirname + 
    '/../node_modules/gulp-protractor' +
    '/node_modules/protractor/selenium/selenium-server-standalone-2.44.0.jar',

  browserName: 'chrome',

  // Exclude patterns are relative to this directory.
  // exclude: [],

  jasmineNodeOpts: {
    showColors: true,
    isVerbose: true, // List all tests in the console
    includeStackTrace: true,
    defaultTimeoutInterval: 30000
  }

  //baseUrl: 'http://localhost:8081'
};
