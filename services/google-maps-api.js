/**
 * @ngdoc service
 * @name GoogleMapsApi
 * @description
 *   Load Google Maps API Service
 */
(function() {
  'use strict';
  var $q;
  var $timeout;

  var GoogleMapsApi = function(_$q_, _$timeout_) {
    $q = _$q_;
    $timeout = _$timeout_;

    return {

      /**
       * Load google maps into document by creating a script tag
       * @memberof GoogleMapsApi
       * @param {string} mapsUrl
       * @example
       *   GoogleMapsApi.load(myUrl).then(function() {
       *     console.log('google map has been loaded')
       *   });
       */
      load: function (mapsUrl) {

        var deferred = $q.defer();

        if (window.google === undefined || window.google.maps === undefined) {

          window.lazyLoadCallback = function() {
            $timeout(function() { /* give some time to load */
              deferred.resolve(window.google)
            }, 100);
          };

          var scriptEl = document.createElement('script');
          scriptEl.src = mapsUrl +
            (mapsUrl.indexOf('?') > -1 ? '&' : '?') +
            'callback=lazyLoadCallback';

          if (!document.querySelector('script[src="' + scriptEl.src + '"]')) {
            document.body.appendChild(scriptEl);
          }
        } else {
          deferred.resolve(window.google)
        }

        return deferred.promise;
      }

    }
  }
  GoogleMapsApi.$inject = ['$q', '$timeout'];

  angular.module('ngMap').service('GoogleMapsApi', GoogleMapsApi);
})();


