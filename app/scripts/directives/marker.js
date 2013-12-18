ngMap.directive('marker', ['Attr2Options', function(Attr2Options) {
  
  return {
    restrict: 'E',
    require: '^map',
    link: function(scope, element, attrs, mapController) {
      var filtered = new Attr2Options(attrs);
      var markerOptions = mapController.getOptions(filtered);
      if (markerOptions.position instanceof Array) {
        var lat = markerOptions.position[0], lng= markerOptions.position[1];
        markerOptions.position = new google.maps.LatLng(lat,lng);
      }
      console.log("marker options", markerOptions);
      
      var marker = new google.maps.Marker(markerOptions);
      mapController.addMarker(marker);
      
      //marker events
      var events = mapController.getEvents(scope, filtered);
      console.log("markerEvents", events);
      for (var eventName in events) {
        google.maps.event.addListener(marker, eventName, events[eventName]);
      }
    }
  };
}]);
