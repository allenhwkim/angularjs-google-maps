/**
 * @ngdoc directive
 * @name custom-control
 * @param Attr2Options {service} convert html attribute to Google map api options
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
  var parser, NgMap;

  var linkFunc = function(scope, element, attrs, mapController, $transclude) {
    mapController = mapController[0]||mapController[1];
    var filtered = parser.filter(attrs);
    var options = parser.getOptions(filtered, {scope: scope});
    var events = parser.getEvents(scope, filtered);

    /**
     * build a custom control element
     */
    var customControlEl = element[0].parentElement.removeChild(element[0]);
    var content = $transclude();
    angular.element(customControlEl).append(content);

    /**
     * set events
     */
    for (var eventName in events) {
      google.maps.event.addDomListener(customControlEl, eventName, events[eventName]);
    }

    mapController.addObject('customControls', customControlEl);
    var position = options.position;
    mapController.map.controls[google.maps.ControlPosition[position]].push(customControlEl);

    element.bind('$destroy', function() {
      mapController.deleteObject('customControls', customControlEl);
    });
  };

  var customControl =  function(Attr2MapOptions, _NgMap_)  {
    parser = Attr2MapOptions, NgMap = _NgMap_;

    return {
      restrict: 'E',
      require: ['?^map','?^ngMap'],
      link: linkFunc,
      transclude: true
    }; // return
  };
  customControl.$inject = ['Attr2MapOptions', 'NgMap'];

  angular.module('ngMap').directive('customControl', customControl);
})();
