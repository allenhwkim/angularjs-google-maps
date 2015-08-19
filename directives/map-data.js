/**
 * @ngdoc directive
 * @name map-data
 * @param Attr2Options {service} convert html attribute to Gogole map api options
 * @description 
 *   set map data
 *   Requires:  map directive
 *   Restrict To:  Element
 *
 * @wn {String} method-name, run map.data[method-name] with attribute value
 * @example
 * Example: 
 *
 *   <map zoom="11" center="[41.875696,-87.624207]">
 *     <map-data load-geo-json="https://storage.googleapis.com/maps-devrel/google.json"></map-data>
 *    </map>
 */
(function() {
  'use strict';

  angular.module('ngMap').directive('mapData', ['Attr2Options', function(Attr2Options) {
    var parser = Attr2Options;
    
    return {
      restrict: 'E',
      require: '^map',

      link: function(scope, element, attrs, mapController) {
        var filtered = parser.filter(attrs);
        var options = parser.getOptions(filtered);
        var events = parser.getEvents(scope, filtered, events);

        console.log('map-data options', options);
        scope.$on('mapInitialized', function(event, map) {
          /**
           * options
           */
          for (var key in options) {
            if (key) {
              var val = options[key];
              if (typeof scope[val] === "function") {
                map.data[key](scope[val]);
              } else {
                map.data[key](val);
              }
            } // if (key)
          }

          /**
           * events
           */
          for (var eventName in events) {
            if (events[eventName]) {
              map.data.addListener(eventName, events[eventName]);
            }
          }
        });
      }
     }; // return
  }]);
})();
