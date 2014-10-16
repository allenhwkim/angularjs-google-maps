/**
 * @ngdoc directive
 * @name marker
 * @requires Attr2Options 
 * @requires NavigatorGeolocation
 * @description 
 *   Draw a Google map marker on a map with given options and register events  
 *   
 *   Requires:  map directive
 *
 *   Restrict To:  Element 
 *
 * @param {String} position address, 'current', or [latitude, longitude]  
 *    example:  
 *      '1600 Pennsylvania Ave, 20500  Washingtion DC',   
 *      'current position',  
 *      '[40.74, -74.18]'  
 * @param {Boolean} centered if set, map will be centered with this marker
 * @param {String} &lt;MarkerOption> Any Marker options, https://developers.google.com/maps/documentation/javascript/reference?csw=1#MarkerOptions  
 * @param {String} &lt;MapEvent> Any Marker events, https://developers.google.com/maps/documentation/javascript/reference
 * @example
 * Usage: 
 *   <map MAP_ATTRIBUTES>
 *    <marker ANY_MARKER_OPTIONS ANY_MARKER_EVENTS"></MARKER>
 *   </map>
 *
 * Example: 
 *   <map center="[40.74, -74.18]">
 *    <marker position="[40.74, -74.18]" on-click="myfunc()"></div>
 *   </map>
 *
 *   <map center="the cn tower">
 *    <marker position="the cn tower" on-click="myfunc()"></div>
 *   </map>
 */
ngMap.directive('marker', ['Attr2Options', function(Attr2Options)  {
  var parser = Attr2Options;

  var getMarker = function(options, events) {
    var marker;

    /**
     * set options
     */
    if (options.icon instanceof Object) {
      if ((""+options.icon.path).match(/^[A-Z_]+$/)) {
        options.icon.path =  google.maps.SymbolPath[options.icon.path];
      }
      for (var key in options.icon) {
        var arr = options.icon[key];
        if (key == "anchor" || key == "origin") {
          options.icon[key] = new google.maps.Point(arr[0], arr[1]);
        } else if (key == "size" || key == "scaledSize") {
          options.icon[key] = new google.maps.Size(arr[0], arr[1]);
        } 
      }
    }
    if (!(options.position instanceof google.maps.LatLng)) {
      var orgPosition = options.position;
      options.position = new google.maps.LatLng(0,0);
      marker = new google.maps.Marker(options);
      parser.setDelayedGeoLocation(marker, 'setPosition', orgPosition);
    } else {
      marker = new google.maps.Marker(options);
    }

    /**
     * set events
     */
    if (Object.keys(events).length > 0) {
      console.log("markerEvents", events);
    }
    for (var eventName in events) {
      if (eventName) {
        google.maps.event.addListener(marker, eventName, events[eventName]);
      }
    }

    return marker;
  };

  return {
    restrict: 'E',
    require: '^map',
    link: function(scope, element, attrs, mapController) {
      var orgAttrs = parser.orgAttributes(element);
      var filtered = parser.filter(attrs);
      var markerOptions = parser.getOptions(filtered, scope);
      var markerEvents = parser.getEvents(scope, filtered);
      console.log('marker options', markerOptions, 'events', markerEvents);

      /**
       * set event to clean up removed marker
       * useful with ng-repeat
       */
      element.bind('$destroy', function() {
        var markers = marker.map.markers;
        for (var name in markers) {
          if (markers[name] == marker) {
            delete markers[name];
          }
        }
        marker.setMap(null);          
      });

      var marker = getMarker(markerOptions, markerEvents);
      mapController.addMarker(marker);

      /**
       * set observers
       */
      parser.observeAttrSetObj(orgAttrs, attrs, marker); /* observers */

    } //link
  }; // return
}]);// 
