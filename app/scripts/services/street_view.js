/**
 * @ngdoc service
 * @name StreetView
 * @description
 *  Provides [defered/promise API](https://docs.angularjs.org/api/ng/service/$q) service 
 *  for [Google StreetViewService](https://developers.google.com/maps/documentation/javascript/streetview)
 */
/* global google */
(function() {
  'use strict';

  var StreetView = function($q) {

    /**
     * Retrieves panorama id from the given map (and or position)
     * @memberof StreetView
     * @param {map} map Google map instance
     * @param {LatLng} latlng Google LatLng instance  
     *   default: the center of the map
     * @example
     *   StreetView.getPanorama(map).then(function(panoId) {
     *     $scope.panoId = panoId;
     *   });
     * @returns {HttpPromise} Future object
     */
    var getPanorama = function(map, latlng) {
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
    };

    /**
     * Set panorama view on the given map with the panorama id
     * @memberof StreetView
     * @param {map} map Google map instance
     * @param {String} panoId Panorama id fro getPanorama method
     * @example
     *   StreetView.setPanorama(map, panoId);
     */
    var setPanorama = function(map, panoId) {
      var svp = new google.maps.StreetViewPanorama(map.getDiv(), {enableCloseButton: true});
      svp.setPano(panoId);
    };

    return {
      getPanorama: getPanorama,
      setPanorama: setPanorama
    }; // return

  };

  angular.module('ngMap').service('StreetView', ['$q', StreetView]);
})();
