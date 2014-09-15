/**
 * @ngdoc directive
 * @name marker
 * @requires Attr2Options 
 * @requires GeoCoder
 * @requires NavigatorGeolocation
 * @description 
 *   Draw a Google map marker on a map with given options and register events  
 *   
 *   Requires:  map directive
 *
 *   Restrict To:  Element Or Attribute
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
ngMap.directives.marker  = function(Attr2Options, GeoCoder, NavigatorGeolocation) {
  var parser = Attr2Options;

  return {
    restrict: 'AE',
    require: '^map',
    link: function(scope, element, attrs, mapController) {
      //var filtered = new parser.filter(attrs);
      var filtered = parser.filter(attrs);
      scope.google = google;
      var markerOptions = parser.getOptions(filtered, scope);
      var markerEvents = parser.getEvents(scope, filtered);

      /**
       * set event to clean up removed marker
       */
      if (markerOptions.ngRepeat) {
        element.bind('$destroy', function() {
          var markers = marker.map.markers;
          for (var name in markers) {
            if (markers[name] == marker) {
              delete markers[name];
            }
          }
          marker.setMap(null);          
        });
      }

      var orgAttributes = {};
      for (var i=0; i<element[0].attributes.length; i++) {
        var attr = element[0].attributes[i];
        orgAttributes[attr.name] = attr.value;
      }

      var getMarker = function(options, events) {
        var marker;
        if (typeof options.position == "string") {
          options.position = new google.maps.LatLng(0,0);
          marker = new google.maps.Marker(options);
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
        /**
         * set opbservers
         */
        var attrsToObserve = parser.getAttrsToObserve(orgAttributes);
        console.log('marker attrs to observe', attrsToObserve);
        var observeFunc = function(attrName) {
          attrs.$observe(attrName, function(val) {
            if (val) { // if no value given, no update on map
              console.log('observing marker attribute', attrName, val);
              var setMethod = parser.camelCase('set-'+attrName);
              var optionValue = parser.toOptionValue(val, {key: attrName});
              console.log('setting marker', attrName,  'with new value',  optionValue);
              if (marker[setMethod]) { //if set method does exist
                /* if position as address is being observed */
                if (setMethod == "setPosition" && typeof optionValue == 'string') {
                  GeoCoder.geocode({address: optionValue})
                    .then(function(results) {
                      marker[setMethod](results[0].geometry.location);
                    });
                } else {
                  marker[setMethod](optionValue);
                }
              }
            } // if (val)
          });
        }
        for (var i=0; i<attrsToObserve.length; i++) {
          observeFunc(attrsToObserve[i]);
        }

        return marker;
      };

      if (markerOptions.position instanceof google.maps.LatLng) {

        var marker = getMarker(markerOptions, markerEvents);
        /**
         * ng-repeat does not happen while map tag is initialized
         * thus, we need to add markers after map tag is initialized
         */
        if (markerOptions.ngRepeat) { 
          mapController.addMarker(marker);
        } else {
          mapController.markers.push(marker);
        }
      } else if (typeof markerOptions.position == 'string') { //need to get lat/lng

        var position = markerOptions.position;

        if (position.match(/^current/i)) { // sensored position

          NavigatorGeolocation.getCurrentPosition()
            .then(function(position) {
              var marker = getMarker(markerOptions, markerEvents);
              var lat = position.coords.latitude, lng = position.coords.longitude;
              marker.setPosition(new google.maps.LatLng(lat, lng));
              mapController.addMarker(marker);
            });

        } else { //assuming it is address

          GeoCoder.geocode({address: markerOptions.position})
            .then(function(results) {
              var marker = getMarker(markerOptions, markerEvents);
              marker.setPosition(results[0].geometry.location);
              mapController.addMarker(marker);
            });

        } 
      } else {
        console.error('invalid marker position', markerOptions.position);
      }
    } //link
  }; // return
};// function
ngMap.directives.marker.$inject  = ['Attr2Options', 'GeoCoder', 'NavigatorGeolocation'];
