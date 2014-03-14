app.controller('mapController', function($scope, $http, $interval)
{
  var markers = [];
  for (var i = 0; i < 8; i++) {
    markers[i] = new google.maps.Marker({
      title: "Marker: " + i
    })
  }

  $scope.GenerateMapMarkers = function() {
    var d = new Date();
    $scope.date = d.toLocaleString();

    var numMarkers = Math.floor(Math.random() * 4) + 4; //between 4 to 8 markers
    for (i = 0; i < numMarkers; i++) {
      var lat = 43.7001100 + (Math.random() / 100);
      var lng = -79.4163000 + (Math.random() / 100);

      var loc = new google.maps.LatLng(lat, lng);
      markers[i].setPosition(loc);
      markers[i].setMap($scope.map);
    }
  };

  $interval($scope.GenerateMapMarkers, 2000);
});