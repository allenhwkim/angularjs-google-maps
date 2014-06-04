// An example configuration file.
exports.config = {
  // Do not start a Selenium Standalone sever - only run this using chrome.
  chromeOnly: false,
  chromeDriver: './node_modules/protractor/selenium/chromedriver',
  //seleniumAddress: 'http://0.0.0.0:4444/wd/hub',
  
  baseUrl: 'http://127.0.0.1:9001/',

  // Capabilities to be passed to the webdriver instance.
  multiCapabilities: [
    { 'browserName': 'chrome' },
    { 'browserName': 'firefox' },
    { 'browserName': 'safari' }
  ],

  // Spec patterns are relative to the current working directly when
  // protractor is called.
  specs: ['test/e2e/**/*_spec.js'],

  // Options to be passed to Jasmine-node.
  jasmineNodeOpts: {
    showColors: true,
    isVerbose: true, // List all tests in the console
    includeStackTrace: true,
    defaultTimeoutInterval: 30000
  }
};
