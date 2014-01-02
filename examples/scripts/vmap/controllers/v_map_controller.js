ngMap.controller("vMapController", function($scope, Venue) {
  $scope.venues = Venue.query();
});
