/* global ngMap */
/* global google */
ngMap.directive('marker', [ 'Attr2Options', 'GeoCoder', 'NavigatorGeolocation', 
  function(Attr2Options, GeoCoder, NavigatorGeolocation) {
    var parser = new Attr2Options();

    return {
      restrict: 'E',
      require: '^map',
      link: function(scope, element, attrs, mapController) {
        var filtered = new parser.filter(attrs);
        scope.google = google;
        var markerOptions = parser.getOptions(filtered, scope);
        var markerEvents = parser.getEvents(scope, filtered);

        var getMarker = function() {
          var marker = new google.maps.Marker(markerOptions);
          if (Object.keys(markerEvents).length > 0) {
            console.log("markerEvents", markerEvents);
          }
          for (var eventName in markerEvents) {
            if (eventName) {
              google.maps.event.addListener(marker, eventName, markerEvents[eventName]);
            }
          }
          return marker;
        };

        if (markerOptions.position instanceof Array) {

          var lat = markerOptions.position[0]; 
          var lng = markerOptions.position[1];
          markerOptions.position = new google.maps.LatLng(lat,lng);

          console.log("adding marker with options, ", markerOptions);
          var marker = getMarker();

          /**
           * ng-repeat does not happen while map tag is parsed
           * so treating it as asynchronous
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
                var lat = position.coords.latitude, lng = position.coords.longitude;
                markerOptions.position = new google.maps.LatLng(lat, lng);
                var marker = getMarker();
                mapController.addMarker(marker);
              })

          } else { //assuming it is address

            GeoCoder.geocode({address: markerOptions.position})
              .then(function(results) {
                var latLng = results[0].geometry.location;
                markerOptions.position = latLng;
                var marker = getMarker();
                mapController.addMarker(marker);
              });

          } 
        } else {
          console.error('invalid marker position', markerOptions.position);
        }
      } //link
    }; // return
  } // function
]);
