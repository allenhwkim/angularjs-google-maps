/**
 * @ngdoc directive
 * @name bicycling-layer
 * @requires Attr2Options 
 * @description 
 *   Requires:  map directive
 *   Restrict To:  Element
 *
 * @example
 * Example: 
 *
 *   <map zoom="13" center="34.04924594193164, -118.24104309082031">
 *     <bicycling-layer></bicycling-layer>
 *    </map>
 */
/*jshint -W089*/
ngMap.directive('bicyclingLayer', ['Attr2Options', function(Attr2Options) {
  var parser = Attr2Options;
  
  var getLayer = function(options, events) {
    var layer = new google.maps.BicyclingLayer(options);
    for (var eventName in events) {
      google.maps.event.addListener(layer, eventName, events[eventName]);
    }
    return layer;
  };
  
  return {
    restrict: 'E',
    require: '^map',

    link: function(scope, element, attrs, mapController) {
      var orgAttrs = parser.orgAttributes(element);
      var filtered = parser.filter(attrs);
      var options = parser.getOptions(filtered);
      var events = parser.getEvents(scope, filtered);

      console.log('bicycling-layer options', options, 'events', events);

      var layer = getLayer(options, events);
      mapController.addObject('bicyclingLayers', layer);
      mapController.observeAttrSetObj(orgAttrs, attrs, layer);  //observers
      element.bind('$destroy', function() {
        mapController.deleteObject('biclclingLayers', layer);
      });
    }
   }; // return
}]);
