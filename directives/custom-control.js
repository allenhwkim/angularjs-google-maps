/**
 * @ngdoc directive
 * @name custom-control
 * @param Attr2Options {service} convert html attribute to Gogole map api options
 * @param $compile {service} AngularJS $compile service
 * @description 
 *   Build custom control and set to the map with position
 *   
 *   Requires:  map directive
 *
 *   Restrict To:  Element
 *
 * @attr {String} position position of this control
 *        i.e. TOP_RIGHT
 * @attr {Number} index index of the control
 * @example
 *
 * Example: 
 *  <map center="41.850033,-87.6500523" zoom="3">
 *    <custom-control id="home" position="TOP_LEFT" index="1">
 *      <div style="background-color: white;">
 *        <b>Home</b>
 *      </div>
 *    </custom-control>
 *  </map>
 *
 */
(function() {
  'use strict';
  angular.module('ngMap').directive('customControl', ['Attr2Options', '$compile', function(Attr2Options, $compile)  {
    'use strict';
    var parser = Attr2Options;

    return {
      restrict: 'E',
      require: '^map',
      link: function(scope, element, attrs, mapController) {
        var orgAttrs = parser.orgAttributes(element);
        var filtered = parser.filter(attrs);
        var options = parser.getOptions(filtered, scope);
        var events = parser.getEvents(scope, filtered);
        console.log("custom-control options", options, "events", events);

        /**
         * build a custom control element
         */
        var customControlEl = element[0].parentElement.removeChild(element[0]);
        $compile(customControlEl.innerHTML.trim())(scope);

        /**
         * set events
         */
        for (var eventName in events) {
          google.maps.event.addDomListener(customControlEl, eventName, events[eventName]);
        }

        mapController.addObject('customControls', customControlEl);
        scope.$on('mapInitialized', function(evt, map) {
          var position = options.position;
          map.controls[google.maps.ControlPosition[position]].push(customControlEl);
        });

      } //link
    }; // return
  }]);// function
})();
