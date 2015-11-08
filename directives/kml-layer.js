/**
 * @ngdoc directive
 * @name kml-layer
 * @param Attr2MapOptions {service} convert html attribute to Gogole map api options
 * @description
 *   renders Kml layer on a map
 *   Requires:  map directive
 *   Restrict To:  Element
 *
 * @attr {Url} url url of the kml layer
 * @attr {KmlLayerOptions} KmlLayerOptions
 *   (https://developers.google.com/maps/documentation/javascript/reference#KmlLayerOptions) 
 * @attr {String} &lt;KmlLayerEvent> Any KmlLayer events,
 *   https://developers.google.com/maps/documentation/javascript/reference
 * @example
 * Usage:
 *   <map MAP_ATTRIBUTES>
 *    <kml-layer ANY_KML_LAYER ANY_KML_LAYER_EVENTS"></kml-layer>
 *   </map>
 *
 * Example:
 *
 * <map zoom="11" center="[41.875696,-87.624207]">
 *   <kml-layer url="https://gmaps-samples.googlecode.com/svn/trunk/ggeoxml/cta.kml" >
 *   </kml-layer>
 * </map>
 */
(function() {
  'use strict';

  angular.module('ngMap').directive('kmlLayer', [
    'Attr2MapOptions', function(Attr2MapOptions) {
    var parser = Attr2MapOptions;

    var getKmlLayer = function(options, events) {
      var kmlLayer = new google.maps.KmlLayer(options);
      for (var eventName in events) {
        google.maps.event.addListener(kmlLayer, eventName, events[eventName]);
      }
      return kmlLayer;
    };

    return {
      restrict: 'E',
      require: ['?^map','?^ngMap'],

      link: function(scope, element, attrs, mapController) {
        mapController = mapController[0]||mapController[1];

        var orgAttrs = parser.orgAttributes(element);
        var filtered = parser.filter(attrs);
        var options = parser.getOptions(filtered);
        var events = parser.getEvents(scope, filtered);
        console.log('kml-layer options', options, 'events', events);

        var kmlLayer = getKmlLayer(options, events);
        mapController.addObject('kmlLayers', kmlLayer);
        mapController.observeAttrSetObj(orgAttrs, attrs, kmlLayer);  //observers
        element.bind('$destroy', function() {
          mapController.deleteObject('kmlLayers', kmlLayer);
        });
      }
     }; // return
  }]);
})();
