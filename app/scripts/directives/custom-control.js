/*jshint -W030*/
/**
 * @ngdoc directive
 * @name custom-control
 * @requires Attr2Options 
 * @requires $compile
 * @description 
 *   Build custom control and set to the map with position
 *   
 *   Requires:  map directive
 *
 *   Restrict To:  Element Or Attribute
 *
 * @param {String} position position of this control
 *        i.e. TOP_RIGHT
 * @param {Number} index index of the control
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
ngMap.directive('customControl', ['Attr2Options', '$compile', function(Attr2Options, $compile)  {
  var parser = Attr2Options;

  return {
    restrict: 'AE',
    require: '^map',
    link: function(scope, element, attrs, mapController) {
      element.css('display','none');
      var orgAttrs = parser.orgAttributes(element);
      var filtered = parser.filter(attrs);
      var options = parser.getOptions(filtered, scope);
      var events = parser.getEvents(scope, filtered);

      /**
       * build a custom control element
       */
      var compiled = $compile(element.html())(scope);
      var customControlEl = compiled[0];

      /**
       * set events
       */
      (Object.keys(events).length > 0) && console.log("customControl events", events);
      for (var eventName in events) {
        if (eventName) {
          google.maps.event.addDomListener(customControlEl, eventName, events[eventName]);
        }
      }

      mapController.addObject('customControls', customControlEl);
      scope.$on('mapInitialized', function(evt, map) {
        var position = options.position;
        map.controls[google.maps.ControlPosition[position]].push(customControlEl);
      });

    } //link
  }; // return
}]);// function
