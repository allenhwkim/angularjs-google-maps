/**
 * @ngdoc directive
 * @name marker
 * @requires Attr2Options 
 * @requires GeoCoder
 * @requires NavigatorGeolocation
 * @description 
 *   Initialize a Google map marker in map with given options and register events  
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

      var getMarker = function(options, events) {
        var marker = new google.maps.Marker(options);
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

      if (markerOptions.position instanceof Array) {

        var lat = markerOptions.position[0]; 
        var lng = markerOptions.position[1];
        markerOptions.position = new google.maps.LatLng(lat,lng);

        console.log("adding marker with options, ", markerOptions);

        /**
         * ng-repeat does not happen while map tag is initialized
         * so add markers after it is initialized
         */
        var marker = getMarker(markerOptions, markerEvents);
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
              var lat = position.coords.latitude, lng = position.coords.longitude;
              markerOptions.position = new google.maps.LatLng(lat, lng);
              var marker = getMarker(markerOptions, markerEvents);
              mapController.addMarker(marker);
            });

        } else { //assuming it is address

          GeoCoder.geocode({address: markerOptions.position})
            .then(function(results) {
              var latLng = results[0].geometry.location;
              markerOptions.position = latLng;
              var marker = getMarker(markerOptions, markerEvents);
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
