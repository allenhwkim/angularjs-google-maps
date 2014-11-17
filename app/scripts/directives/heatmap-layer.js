/**
 * @ngdoc directive
 * @name heatmap-layer
 * @requires Attr2Options 
 * @description 
 *   Requires:  ng-map directive
 *   Restrict To:  Element
 *
 * @example
 * Example: 
 *
 *   <ng-map zoom="11" center="[41.875696,-87.624207]">
 *     <heatmap-layer data="taxiData"></heatmap-layer>
 *   </ng-map>
 */
/*jshint -W089*/
ngMap.directive('heatmapLayer', ['Attr2Options', '$window', function(Attr2Options, $window) {
  var parser = Attr2Options;
  
  return {
    restrict: 'E',
    require: ['^?map', '?^ngMap'],
    link: function(scope, element, attrs, controllers) {
      for (var i=0; i<controllers.length; i++) {
        controllers[i] && (mapController = controllers[i]);
      }
      var filtered = parser.filter(attrs);

      /**
       * set options 
       */
      var options = parser.getOptions(filtered);
      options.data = $window[attrs.data] || scope[attrs.data];
      if (options.data instanceof Array) {
        options.data = new google.maps.MVCArray(options.data);
      } else {
        throw "invalid heatmap data";
      }
      var layer = new google.maps.visualization.HeatmapLayer(options);

      /**
       * set events 
       */
      var events = parser.getEvents(scope, filtered);
      console.log('heatmap-layer options', layer, 'events', events);

      mapController.addObject('heatmapLayers', layer);
    }
   }; // return
}]);
