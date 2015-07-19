/**
 * @ngdoc directive
 * @name overlay-map-type
 * @requires Attr2Options 
 * @description 
 *   Requires:  map directive
 *   Restrict To:  Element
 *
 * @example
 * Example: 
 *
 *   <map zoom="13" center="34.04924594193164, -118.24104309082031">
 *     <overlay-map-type index="0" object="coordinateMapType"></map-type>
 *   </map>
 */
/*jshint -W089*/
ngMap.directive('overlayMapType', ['Attr2Options', '$window', function(Attr2Options, $window) {
  var parser = Attr2Options;
  
  return {
    restrict: 'E',
    require: '^map',

    link: function(scope, element, attrs, mapController) {
      var overlayMapTypeObject;
      var initMethod = attrs.initMethod || "insertAt";
      if (attrs.object) {
        var __scope = scope[attrs.object] ? scope : $window;
        overlayMapTypeObject = __scope[attrs.object];
        if (typeof overlayMapTypeObject == "function") {
          overlayMapTypeObject = new overlayMapTypeObject();
        }
      }
      if (!overlayMapTypeObject) {
        throw "invalid map-type object";
      }

      scope.$on('mapInitialized', function(evt, map) {
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
