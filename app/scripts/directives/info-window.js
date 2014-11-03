/*jshint -W030*/
/**
 * @ngdoc directive
 * @name info-window 
 * @requires Attr2Options 
 * @requires $compile
 * @description 
 *   Defines infoWindow and provides compile method
 *   
 *   Requires:  map directive
 *
 *   Restrict To:  Element
 *
 * @param {Boolean} visible Indicates to show it when map is initialized
 * @param {Boolean} visible-on-marker Indicates to show it on a marker when map is initialized
 * @param {String} &lt;InfoWindowOption> Any InfoWindow options,
 *        https://developers.google.com/maps/documentation/javascript/reference?csw=1#InfoWindowOptions  
 * @param {String} &lt;InfoWindowEvent> Any InfoWindow events, https://developers.google.com/maps/documentation/javascript/reference
 * @example
 * Usage: 
 *   <map MAP_ATTRIBUTES>
 *    <info-window id="foo" ANY_OPTIONS ANY_EVENTS"></info-window>
 *   </map>
 *
 * Example: 
 *  <map center="41.850033,-87.6500523" zoom="3">
 *    <info-window id="1" position="41.850033,-87.6500523" >
 *      <div ng-non-bindable>
 *        Chicago, IL<br/>
 *        LatLng: {{chicago.lat()}}, {{chicago.lng()}}, <br/>
 *        World Coordinate: {{worldCoordinate.x}}, {{worldCoordinate.y}}, <br/>
 *        Pixel Coordinate: {{pixelCoordinate.x}}, {{pixelCoordinate.y}}, <br/>
 *        Tile Coordinate: {{tileCoordinate.x}}, {{tileCoordinate.y}} at Zoom Level {{map.getZoom()}}
 *      </div>
 *    </info-window>
 *  </map>
 */
ngMap.directive('infoWindow', ['Attr2Options', '$compile', '$timeout', function(Attr2Options, $compile, $timeout)  {
  var parser = Attr2Options;

  var getInfoWindow = function(options, events, element) {
    var infoWindow;

    /**
     * set options
     */
    if (options.position && 
      !(options.position instanceof google.maps.LatLng)) {
      var address = options.position;
      options.position = new google.maps.LatLng(0,0);
      infoWindow = new google.maps.InfoWindow(options);
      parser.setDelayedGeoLocation(infoWindow, 'setPosition', address);
    } else {
      infoWindow = new google.maps.InfoWindow(options);
    }

    /**
     * set events
     */
    if (Object.keys(events).length > 0) {
      console.log("infoWindow events", events);
    }
    for (var eventName in events) {
      if (eventName) {
        google.maps.event.addListener(infoWindow, eventName, events[eventName]);
      }
    }

    /**
     * set template ane template-relate functions
     * it must have a container element with ng-non-bindable
     */
    var template = element.html().trim();
    if (angular.element(template).length != 1) {
      throw "info-window working as a template must have a container";
    }
    infoWindow.__template = template.replace(/\s?ng-non-bindable[='"]+/,"");

    infoWindow.__compile = function(scope) {
      var el = $compile(infoWindow.__template)(scope);
      scope.$apply();
      infoWindow.setContent(el.html());
    };

    infoWindow.__eval = function(event) {
      var template = infoWindow.__template;
      var _this = this;
      template = template.replace(/{{(event|this)[^;\}]+}}/g, function(match) {
        var expression = match.replace(/[{}]/g, "").replace("this.", "_this.");
        return eval(expression);
      });
      return template;
    };

    return infoWindow;
  };

  return {
    restrict: 'E',
    require: '^map',
    link: function(scope, element, attrs, mapController) {
      element.css('display','none');
      var orgAttrs = parser.orgAttributes(element);
      var filtered = parser.filter(attrs);
      var options = parser.getOptions(filtered, scope);
      var events = parser.getEvents(scope, filtered);
      console.log('infoWindow', 'options', options, 'events', events);

      var infoWindow = getInfoWindow(options, events, element);

      mapController.addObject('infoWindows', infoWindow);
      parser.observeAttrSetObj(orgAttrs, attrs, infoWindow); /* observers */

      // show InfoWindow when initialized
      if (infoWindow.visible) {
        if (!infoWindow.position) { throw "Invalid position"; }
        scope.$on('mapInitialized', function(evt, map) {
          $timeout(function() {
            infoWindow.__template = infoWindow.__eval.apply(this, [evt]);
            infoWindow.__compile(scope);
            infoWindow.open(map);
          });
        });
      }

      // show InfoWindow on a marker  when initialized
      if (infoWindow.visibleOnMarker) {
        scope.$on('mapInitialized', function(evt, map) {
          $timeout(function() {
            var markerId = infoWindow.visibleOnMarker;
            var marker = map.markers[markerId];
            if (!marker) throw "Invalid marker id";
            infoWindow.__template = infoWindow.__eval.apply(this, [evt]);
            infoWindow.__compile(scope);
            infoWindow.open(map, marker);
          });
        });
      }

      /**
       * provide showInfoWindow method to scope
       */
      scope.showInfoWindow  = scope.showInfoWindow ||
        function(event, id, anchor) {
          var infoWindow = mapController.map.infoWindows[id];
          infoWindow.__template = infoWindow.__eval.apply(this, [event]);
          infoWindow.__compile(scope);
          if (anchor) {
            infoWindow.open(mapController.map, anchor);
          } else if (this.getPosition) {
            infoWindow.open(mapController.map, this);
          } else {
            infoWindow.open(mapController.map);
          }
        };

    } //link
  }; // return
}]);// function
