/**
 * @ngdoc service
 * @name GeoCoder
 * @description
 *   Provides [defered/promise API](https://docs.angularjs.org/api/ng/service/$q)
 *   service for Google Geocoder service
 */
(function() {
  'use strict';
  var $q;
  /**
   * @memberof GeoCoder
   * @param {Hash} options
   *   https://developers.google.com/maps/documentation/geocoding/#geocoding
   * @example
   * ```
   *   GeoCoder.geocode({address: 'the cn tower'}).then(function(result) {
   *     //... do something with result
   *   });
   * ```
   * @returns {HttpPromise} Future object
   */
  var geocodeFunc = function(options) {
    var deferred = $q.defer();
    var geocoder = new google.maps.Geocoder();
    geocoder.geocode(options, function (results, status) {
      if (status == google.maps.GeocoderStatus.OK) {
        deferred.resolve(results);
      } else {
        deferred.reject(status);
      }
    });
    return deferred.promise;
  };

  var GeoCoder = function(_$q_) {
    $q = _$q_;
    return {
      geocode : geocodeFunc
    };
  };
  GeoCoder.$inject = ['$q'];

  angular.module('ngMap').service('GeoCoder', GeoCoder);
})();
