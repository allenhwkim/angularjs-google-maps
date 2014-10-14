/**
 * @ngdoc directive
 * @name cloud-layer
 * @requires Attr2Options 
 * @description 
 *   Requires:  map directive
 *   Restrict To:  Element
 *
 * @example
 * Example: 
 *
 *   <map zoom="13" center="34.04924594193164, -118.24104309082031">
 *     <cloud-layer></cloud-layer>
 *    </map>
 */
/*jshint -W089*/
ngMap.directive('cloudLayer', ['Attr2Options', function(Attr2Options) {
  var parser = Attr2Options;
  
  var getLayer = function(options, events) {
    var layer = new google.maps.weather.CloudLayer(options);
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
      console.log('cloud-layer options', options, 'events', events);

      var layer = getLayer(options, events);
      mapController.addObject('cloudLayers', layer);
      parser.observeAttrSetObj(orgAttrs, attrs, layer);  //observers
    }
   }; // return
}]);
