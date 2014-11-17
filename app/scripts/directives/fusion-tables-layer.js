/**
 * @ngdoc directive
 * @name fusion-tables-layer
 * @description 
 *   Requires:  ng-map directive
 *   Restrict To:  Element
 *
 * @example
 * Example: 
 *   <ng-map zoom="11" center="41.850033, -87.6500523">
 *     <fusion-tables-layer query="{
 *       select: 'Geocodable address',
 *       from: '1mZ53Z70NsChnBMm-qEYmSDOvLXgrreLTkQUvvg'}">
 *     </fusion-tables-layer>
 *   </ng-map>
 */
/*jshint -W089*/
ngMap.directive('fusionTablesLayer', ['Attr2Options', function(Attr2Options) {
  var parser = Attr2Options;

  var getLayer = function(options, events) {
    var layer = new google.maps.FusionTablesLayer(options);

    for (var eventName in events) {
      google.maps.event.addListener(layer, eventName, events[eventName]);
    }

    return layer;
  };

  
  return {
    restrict: 'E',
    require: ['^?map', '?^ngMap'],
    link: function(scope, element, attrs, controllers) {
      for (var i=0; i<controllers.length; i++) {
        controllers[i] && (mapController = controllers[i]);
      }
      var filtered = parser.filter(attrs);
      var options = parser.getOptions(filtered);
      var events = parser.getEvents(scope, filtered, events);
      console.log('fusion-tables-layer options', options, 'events', events);

      var layer = getLayer(options, events);
      mapController.addObject('fusionTablesLayers', layer);
    }
   }; // return
}]);
