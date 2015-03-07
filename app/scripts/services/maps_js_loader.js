ngMap.provider("mapsJsLoader", function() {

  var apiKey = null, clientId = null;

  this.setApiKey = function(key) {
    apiKey = key;
  };

  this.setClientId = function(id) {
    clientIdt = id
  }, 

  this.$get = ["$q", function($q) {
    var deferred = $q.defer();
    var onError = function() {
      deferred.reject();
    }

    if (window.google && window.google.maps) {
      deferred.resolve();
    } else {
      window.onGoogleScriptLoad = function() {
        (window.google && window.google.maps) ? deferred.resolve() : deferred.reject()
      };

      var script = document.createElement("script");
      script.type = "text/javascript";
      script.async = !0;
      script.src = "http://maps.google.com/maps/api/js?callback=onGoogleScriptLoad";
      apiKey && (script.src += "&key=" + apiKey + "&");
      clientId && (script.src += "&client=" + clientId + "&v=3.18");
      script.onerror = onError;
      document.body.appendChild(script);
    }

    return deferred.promise;
  }];
});

ngMap.run(['$rootScope', 'mapsJsLoader', function($rootScope, mapsJsLoader) {
  mapsJsLoader.then(function() {
    $rootScope.mapJsLoaded=true;
  });
}]);
