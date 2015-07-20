/**
 * @ngdoc service
 * @name NavigatorGeolocation
 * @description
 *  Provides [defered/promise API](https://docs.angularjs.org/api/ng/service/$q) service for navigator.geolocation methods
 */
/* global google */
(function() {
  'use strict';

  var NavigatorGeolocation = function($q) {
    return {
      /**
       * @memberof NavigatorGeolocation
       * @param {function} success success callback function
       * @param {function} failure failure callback function
       * @example
       * ```
       *  NavigatorGeolocation.getCurrentPosition()
       *    .then(function(position) {
       *      var lat = position.coords.latitude, lng = position.coords.longitude;
       *      .. do something lat and lng
       *    });
       * ```
       * @returns {HttpPromise} Future object
       */
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
  }; 
  NavigatorGeolocation.$inject = ['$q'];

  angular.module('ngMap').service('NavigatorGeolocation', NavigatorGeolocation);
})();
