var env = require('./environment.js');

// The main suite of Protractor tests.
exports.config = {
  chromeOnly: true,
  chromeDriver: '../node_modules/protractor/selenium/chromedriver',
  //seleniumAddress: env.seleniumAddress,

  // Spec patterns are relative to this directory.
  specs: [
    'e2e/*_spec.js'
  ],

  // Exclude patterns are relative to this directory.
  exclude: [
    'e2e/exclude*.js'
  ],

  chromeOnly: false,

  capabilities: env.capabilities,

  jasmineNodeOpts: {
    showColors: true,
    isVerbose: true, // List all tests in the console
    includeStackTrace: true,
    defaultTimeoutInterval: 30000
  },
  baseUrl: env.baseUrl
};


