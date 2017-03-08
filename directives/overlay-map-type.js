/**
 * @ngdoc directive
 * @name overlay-map-type
 * @param Attr2MapOptions {service} convert html attribute to Google map api options
 * @param $window {service}
 * @description
 *   Requires:  map directive
 *   Restrict To:  Element
 *
 * @example
 * Example:
 *
 * <map zoom="13" center="34.04924594193164, -118.24104309082031">
 *   <overlay-map-type index="0" object="coordinateMapType"></map-type>
 * </map>
 */
(function() {
  'use strict';

  angular.module('ngMap').directive('overlayMapType', [
    'NgMap', function(NgMap) {

    return {
      restrict: 'E',
      require: ['?^map','?^ngMap'],

      link: function(scope, element, attrs, mapController) {
        mapController = mapController[0]||mapController[1];

        var initMethod = attrs.initMethod || "insertAt";
        var overlayMapTypeObject = scope[attrs.object];

        NgMap.getMap().then(function(map) {
          if (initMethod == "insertAt") {
            var index = parseInt(attrs.index, 10);
            map.overlayMapTypes.insertAt(index, overlayMapTypeObject);
          } else if (initMethod == "push") {
            map.overlayMapTypes.push(overlayMapTypeObject);
          }
        });
        mapController.addObject('overlayMapTypes', overlayMapTypeObject);
      }
     }; // return
  }]);
})();
