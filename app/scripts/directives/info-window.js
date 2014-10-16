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
ngMap.directive('infoWindow', ['Attr2Options', '$compile', function(Attr2Options, $compile)  {
  var parser = Attr2Options;

  var getInfoWindow = function(options, events) {
    var infoWindow;

    /**
     * set options
     */
    if (!(options.position instanceof google.maps.LatLng)) {
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

      /**
       * it must have a container element with ng-non-bindable
       */
      var template = element.html().trim();
      if (angular.element(template).length != 1) {
        throw "info-window working as a template must have a container";
      }

      var infoWindow = getInfoWindow(options, events);
      infoWindow.template = template.replace(/ng-non-/,"");
      mapController.addObject('infoWindows', infoWindow);
      parser.observeAttrSetObj(orgAttrs, attrs, infoWindow); /* observers */

      /**
       * provide showInfoWindow method to scope
       */
      scope.showInfoWindow  = scope.showInfoWindow || function(event, id, anchor) {
        var infoWindow = mapController.map.infoWindows[id];
        var html = infoWindow.template.trim();
        var compiledHtml = html.replace(/{{([^}]+)}}/g, function(_,$1) {
          return scope.$eval($1);
        });
        //var compiledEl = $compile(html)(scope);
        infoWindow.setContent(compiledHtml);
        if (anchor) {
          infoWindow.setPosition(anchor);
          infoWindow.open(mapController.map);
        } else if (this.getPosition) {
          infoWindow.open(mapController.map, this);
        } else {
          infoWindow.open(mapController.map);
        }
      }

      // show InfoWindow when initialized
      if (infoWindow.visible) {
        scope.$on('mapInitialized', function(evt, map) {
          var compiledEl = $compile(infoWindow.template)(scope);
          infoWindow.setContent(compiledEl.html());
          infoWindow.open(mapController.map);
        });
      }
      // show InfoWindow on a marker  when initialized
      if (infoWindow.visibleOnMarker) {
        scope.$on('mapInitialized', function(evt, map) {
          var marker = mapController.map.markers[infoWindow.visibleOnMarker];
          if (!marker) throw "Invalid marker id";
          var compiledEl = $compile(infoWindow.template)(scope);
          infoWindow.setContent(compiledEl.html());
          infoWindow.open(mapController.map, marker);
        });
      }
    } //link
  }; // return
}]);// function
