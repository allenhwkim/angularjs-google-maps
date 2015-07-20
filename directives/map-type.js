/**
 * @ngdoc directive
 * @name map-type
 * @requires Attr2Options 
 * @description 
 *   Requires:  map directive
 *   Restrict To:  Element
 *
 * @example
 * Example: 
 *
 *   <map zoom="13" center="34.04924594193164, -118.24104309082031">
 *     <map-type name="coordinate" object="coordinateMapType"></map-type>
 *   </map>
 */
(function() {
  'use strict';

  angular.module('ngMap').directive('mapType', ['Attr2Options', '$window', function(Attr2Options, $window) {
    var parser = Attr2Options;
    
    return {
      restrict: 'E',
      require: '^map',

      link: function(scope, element, attrs, mapController) {
        var mapTypeName = attrs.name, mapTypeObject;
        if (!mapTypeName) {
          throw "invalid map-type name";
        }
        if (attrs.object) {
          var __scope = scope[attrs.object] ? scope : $window;
          mapTypeObject = __scope[attrs.object];
          if (typeof mapTypeObject == "function") {
            mapTypeObject = new mapTypeObject();
          }
        }
        if (!mapTypeObject) {
          throw "invalid map-type object";
        }

        scope.$on('mapInitialized', function(evt, map) {
          map.mapTypes.set(mapTypeName, mapTypeObject);
        });
        mapController.addObject('mapTypes', mapTypeObject);
      }
     }; // return
  }]);
})();
