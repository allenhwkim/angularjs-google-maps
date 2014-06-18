var ngMap = ngMap || {};
ngMap.services = ngMap.services || {};
/**
 * @namespace ngMap.services.NavigatorGeolocation
 */
ngMap.services.NavigatorGeolocation = { 
  /**
   * @memberof ngMap.services.NavigatorGeolocation
   */
  deps: ['$q'],
  /**
   * @memberof ngMap.services.NavigatorGeolocation
   * @name func
   */
  func: function($q) {
    return {
      getCurrentPosition: function() {
        var deferred = $q.defer();
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            function(position) {
              deferred.resolve(position);
            }, function(evt) {
              console.error(evt);
              deferred.reject(evt);
            }
          );
        } else {
          deferred.reject("Browser Geolocation service failed.");
        }
        return deferred.promise;
      },

      watchPosition: function() {
        return "TODO";
      },

      clearWatch: function() {
        return "TODO";
      }
    };
  } // func
}; // map
