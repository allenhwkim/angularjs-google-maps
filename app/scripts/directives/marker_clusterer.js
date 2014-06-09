/* global ngMap */
/* global google */
/* global MarkerClusterer */
ngMap.directive('markerClusterer', [ 'Attr2Options',
  function(Attr2Options) {
    var parser = new Attr2Options();

    return {
      restrict: 'E',
      require: '^map',
      link: function(scope, element, attrs, mapController) {
        var markersData = scope.$eval(attrs.markers);
        delete attrs.markers;
        var options = new parser.filter(attrs);

        var markers = [];
        for (var i=0; i< markersData.length; i++) {
          var data = markersData[i];

          var lat = data.position[0], lng = data.position[1];
          data.position = new google.maps.LatLng(lat,lng);
          var marker = new google.maps.Marker(data);
          
          var markerEvents = parser.getEvents(scope, data);
          for (var eventName in markerEvents) {
            if (eventName) {
              google.maps.event.addListener(marker, eventName, markerEvents[eventName]);
            }
          }
          markers.push(marker);
        } // for (var i=0;..
        mapController.markers = markers;
        mapController.markerClusterer =  { data: markers, options:options };
        console.log('markerClusterer', mapController.markerClusterer);
      } //link
    }; // return
  } // function
]);
