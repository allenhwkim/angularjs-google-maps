var ngMap = ngMap || {};
ngMap.services = ngMap.services || {};
/**
 * @namespace ngMap.services.GeoCoder
 */
ngMap.services.GeoCoder = {
  /**
   * @memberof ngMap.services.GeoCoder
   */
  deps: ['$q'],
  /**
   * @memberof ngMap.services.GeoCoder
   * @name func
   */
  func: function($q) {
    return {
      geocode : function(options) {
        var deferred = $q.defer();
        var geocoder = new google.maps.Geocoder();
        geocoder.geocode(options, function (results, status) {
          if (status == google.maps.GeocoderStatus.OK) {
            deferred.resolve(results);
          } else {
            deferred.reject('Geocoder failed due to: '+ status);
          }
        });
        return deferred.promise;
      }
    }
  }
};
