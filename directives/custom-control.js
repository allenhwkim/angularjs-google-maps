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
  var parser, $compile, NgMap;

  var linkFunc = function(scope, element, attrs, mapController) {
    mapController = mapController[0]||mapController[1];
    var filtered = parser.filter(attrs);
    var options = parser.getOptions(filtered);
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
    NgMap.getMap().then(function(map) {
      var position = options.position;
      map.controls[google.maps.ControlPosition[position]].push(customControlEl);
    });

  };

  var customControl =  function(Attr2MapOptions, _$compile_, _NgMap_)  {
    parser = Attr2MapOptions, $compile = _$compile_, NgMap = _NgMap_;

    return {
      restrict: 'E',
      require: ['?^map','?^ngMap'],
      link: linkFunc
    }; // return
  };
  customControl.$inject = ['Attr2MapOptions', '$compile', 'NgMap'];

  angular.module('ngMap').directive('customControl', customControl);
})();
