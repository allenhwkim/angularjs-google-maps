/**
 * @ngdoc service
 * @name GeoCoder
 * @description
 *   Provides [defered/promise API](https://docs.angularjs.org/api/ng/service/$q) service for Google Geocoder service
 */
/* global google */
(function() {
  'use strict';
  var GeoCoder = function($q) {
    return {
      /**
       * @memberof GeoCoder
       * @param {Hash} options https://developers.google.com/maps/documentation/geocoding/#geocoding
       * @example
       * ```
       *   GeoCoder.geocode({address: 'the cn tower'}).then(function(result) {
       *     //... do something with result
       *   });
       * ```
       * @returns {HttpPromise} Future object
       */
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
  };

  angular.module('ngMap').service('GeoCoder', ['$q', GeoCoder]);
})();
