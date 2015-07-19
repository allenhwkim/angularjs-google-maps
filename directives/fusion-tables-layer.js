/**
 * @ngdoc directive
 * @name fusion-tables-layer
 * @description 
 *   Requires:  map directive
 *   Restrict To:  Element
 *
 * @example
 * Example: 
 *   <map zoom="11" center="41.850033, -87.6500523">
 *     <fusion-tables-layer query="{
 *       select: 'Geocodable address',
 *       from: '1mZ53Z70NsChnBMm-qEYmSDOvLXgrreLTkQUvvg'}">
 *     </fusion-tables-layer>
 *   </map>
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
    require: '^map',

    link: function(scope, element, attrs, mapController) {
      var filtered = parser.filter(attrs);
      var options = parser.getOptions(filtered);
      var events = parser.getEvents(scope, filtered, events);
      console.log('fusion-tables-layer options', options, 'events', events);

      var layer = getLayer(options, events);
      mapController.addObject('fusionTablesLayers', layer);
    }
   }; // return
}]);
