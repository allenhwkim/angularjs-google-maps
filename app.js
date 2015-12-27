angular.module('ngMap', []);
angular.module('ngMap').config([
  '$compileProvider',
  '$logProvider', 
  function ($compileProvider, $logProvider) {
    var debugMode = !!window.location.search.match(/[\?\&]debug=1/);
    $logProvider.debugEnabled(debugMode);
    $compileProvider.debugInfoEnabled(debugMode);
  }
]);
