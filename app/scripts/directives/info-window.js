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
 *   Restrict To:  Element Or Attribute
 *
 * @param {Boolean} visible Indicates to show it when map is initialized
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
    restrict: 'AE',
    require: '^map',
    link: function(scope, element, attrs, mapController) {
      element.css('display','none');
      var orgAttrs = parser.orgAttributes(element);
      var filtered = parser.filter(attrs);
      var options = parser.getOptions(filtered, scope);
      var events = parser.getEvents(scope, filtered);

      var infoWindow = getInfoWindow(options, events);
      infoWindow.template = element.html().replace(/ng-non-/,"");
      mapController.addObject('infoWindows', infoWindow);
      parser.observeAttrSetObj(orgAttrs, attrs, infoWindow); /* observers */

      /**
       * set method for a infoWindow
       */
      infoWindow.compile = function(sc) {      /* compile template within scope */
        var iwScope = sc || scope;
        var compiledEl = $compile(infoWindow.template)(iwScope);
        iwScope.$apply();
        infoWindow.setContent(compiledEl.html());
      }
      infoWindow.show = function(sc, anchor) { /* show infowindow */
        anchor = anchor || infoWindow.getPosition();
        infoWindow.compile(sc);
        infoWindow.open(mapController.map, anchor);
      }
      // show when initialized
      if (infoWindow.visible && infoWindow.position.lat()) {
        scope.$on('mapInitialized', function(evt, map) {
          infoWindow.show(scope);
        });
      }
    } //link
  }; // return
}]);// function
