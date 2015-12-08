/**
 * @ngdoc directive
 * @name dynamic-maps-engine-layer
 * @description
 *   Requires:  map directive
 *   Restrict To:  Element
 *
 * @example
 * Example:
 *   <map zoom="14" center="[59.322506, 18.010025]">
 *     <dynamic-maps-engine-layer
 *       layer-id="06673056454046135537-08896501997766553811">
 *     </dynamic-maps-engine-layer>
 *    </map>
 */
(function() {
  'use strict';

  angular.module('ngMap').directive('dynamicMapsEngineLayer', [
    'Attr2MapOptions', function(Attr2MapOptions) {
    var parser = Attr2MapOptions;

    var getDynamicMapsEngineLayer = function(options, events) {
      var layer = new google.maps.visualization.DynamicMapsEngineLayer(options);

      for (var eventName in events) {
        google.maps.event.addListener(layer, eventName, events[eventName]);
      }

      return layer;
    };

    return {
      restrict: 'E',
      require: ['?^map','?^ngMap'],

      link: function(scope, element, attrs, mapController) {
        mapController = mapController[0]||mapController[1];

        var filtered = parser.filter(attrs);
        var options = parser.getOptions(filtered, {scope: scope});
        var events = parser.getEvents(scope, filtered, events);

        var layer = getDynamicMapsEngineLayer(options, events);
        mapController.addObject('mapsEngineLayers', layer);
      }
     }; // return
  }]);
})();
