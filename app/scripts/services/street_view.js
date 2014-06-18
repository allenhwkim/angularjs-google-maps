var ngMap = ngMap || {};
ngMap.services = ngMap.services || {};
/**
 * @namespace ngMap.services.StreetView
 */
ngMap.services.StreetView = {
  /**
   * @memberof ngMap.services.StreetView
   */
  deps: ['$q'],
  /**
   * @memberof ngMap.services.StreetView
   * @name func
   */
  func: function($q) {
    return {
      getPanorama : function(map, latlng) {
        latlng = latlng || map.getCenter();
        var deferred = $q.defer();
        var svs = new google.maps.StreetViewService();
        svs.getPanoramaByLocation( (latlng||map.getCenter), 100, function (data, status) {
          // if streetView available
          if (status === google.maps.StreetViewStatus.OK) {
            deferred.resolve(data.location.pano);
          } else {
            // no street view available in this range, or some error occurred
            deferred.resolve(false);
            //deferred.reject('Geocoder failed due to: '+ status);
          }
        });
        return deferred.promise;
      },
      setPanorama : function(map, panoId) {
        var svp = new google.maps.StreetViewPanorama(map.getDiv(), {enableCloseButton: true});
        svp.setPano(panoId);
      }
    }; // return
  } // func
}; // streetView
