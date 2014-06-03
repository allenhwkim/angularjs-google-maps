var app = angular.module("myApp", ["ngMap", "plunkr"]); 
app.run(function($window, $rootScope) {
  /* collect the javascript errors */
  $rootScope.jsErrors = [];
  $window.onerror = function (message, url, lineNo) {
    $rootScope.jsErrors.push({
      error:message, 
      url: url,
      lineNumber: lineNo
    });
    return true;   
  }
});
