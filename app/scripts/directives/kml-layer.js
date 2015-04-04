/**
 * @ngdoc directive
 * @name kml-layer
 * @requires Attr2Options 
 * @description 
 *   renders Kml layer on a map
 *   Requires:  map directive
 *   Restrict To:  Element
 *
 * @param {Url} url url of the kml layer
 * @param {KmlLayerOptions} KmlLayerOptions
 *   (https://developers.google.com/maps/documentation/javascript/reference#KmlLayerOptions)  
 * @param {String} &lt;KmlLayerEvent> Any KmlLayer events, https://developers.google.com/maps/documentation/javascript/reference
 * @example
 * Usage: 
 *   <map MAP_ATTRIBUTES>
 *    <kml-layer ANY_KML_LAYER ANY_KML_LAYER_EVENTS"></kml-layer>
 *   </map>
 *
 * Example: 
 *
 *   <map zoom="11" center="[41.875696,-87.624207]">
 *     <kml-layer url="http://gmaps-samples.googlecode.com/svn/trunk/ggeoxml/cta.kml" ></kml-layer>
 *    </map>
 */
/*jshint -W089*/
ngMap.directive('kmlLayer', ['Attr2Options', function(Attr2Options) {
  var parser = Attr2Options;
  
  var getKmlLayer = function(options, events) {
    var kmlLayer = new google.maps.KmlLayer(options);
    for (var eventName in events) {
      google.maps.event.addListener(kmlLayer, eventName, events[eventName]);
    }
    return kmlLayer;
  };
  
  return {
    restrict: 'E',
    require: '^map',

    link: function(scope, element, attrs, mapController) {
      var orgAttrs = parser.orgAttributes(element);
      var filtered = parser.filter(attrs);
      var options = parser.getOptions(filtered);
      var events = parser.getEvents(scope, filtered);
      console.log('kml-layer options', kmlLayer, 'events', events);

      var kmlLayer = getKmlLayer(options, events);
      mapController.addObject('kmlLayers', kmlLayer);
      mapController.observeAttrSetObj(orgAttrs, attrs, kmlLayer);  //observers
      element.bind('$destroy', function() {
        mapController.deleteObject('kmlLayers', kmlLayer);
      });
    }
   }; // return
}]);
