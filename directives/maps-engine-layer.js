/**
 * @ngdoc directive
 * @name maps-engine-layer
 * @description 
 *   Requires:  map directive
 *   Restrict To:  Element
 *
 * @example
 * Example: 
 *   <map zoom="14" center="[59.322506, 18.010025]">
 *     <maps-engine-layer layer-id="06673056454046135537-08896501997766553811"></maps-engine-layer>
 *    </map>
 */
(function() {
  'use strict';

  angular.module('ngMap').directive('mapsEngineLayer', ['Attr2Options', function(Attr2Options) {
    var parser = Attr2Options;

    var getMapsEngineLayer = function(options, events) {
      var layer = new google.maps.visualization.MapsEngineLayer(options);

      for (var eventName in events) {
        google.maps.event.addListener(layer, eventName, events[eventName]);
      }

      return layer;
    };

    
    return {
      restrict: 'E',
      require: '^map',

      link: function(scope, element, attrs, mapController) {
        var filtered = parser.filter(attrs);
        var options = parser.getOptions(filtered);
        var events = parser.getEvents(scope, filtered, events);
        console.log('maps-engine-layer options', options, 'events', events);

        var layer = getMapsEngineLayer(options, events);
        mapController.addObject('mapsEngineLayers', layer);
      }
     }; // return
  }]);
})();
