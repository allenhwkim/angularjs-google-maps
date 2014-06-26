/**
 * @ngdoc directive
 * @memberof ngMap
 * @name MapController
 */
ngMap.directives.MapController = function($scope) { 

  this.controls = {};
  this.markers = [];
  this.shapes = [];
  this.infoWindows = [];
  this.markerClusterer = null;

  /**
   * Initialize map with options, center and events
   * @returns mapOptions
   */
  this.initMap = function(options, center, events) {
    options.center = null; // use parameter center instead
    $scope.map.setOptions(options);
    $scope.map.setCenter(center);
    for (var eventName in events) {
      if (eventName) {
        google.maps.event.addListener($scope.map, eventName, events[eventName]);
      }
    }
    $scope.$emit('mapInitialized', $scope.map);  
  };

  /**
   * Add marker to the map
   * @param marker
   */
  this.addMarker = function(marker) {
    marker.setMap($scope.map);
    if (marker.centered) {
      $scope.map.setCenter(marker.position);
    }
    var len = Object.keys($scope.markers).length;
    $scope.markers[marker.id || len] = marker;
  };

  /**
   * Initialize markers
   * @returns markers
   */
  this.initMarkers = function() {
    $scope.markers = {};
    for (var i=0; i<this.markers.length; i++) {
      var marker = this.markers[i];
      this.addMarker(marker);
    }
    return $scope.markers;
  };

  /**
   * Initialize shapes for this map
   * @returns shapes
   */
  this.initShapes = function() {
    $scope.shapes = {};
    for (var i=0; i<this.shapes.length; i++) {
      var shape = this.shapes[i];
      shape.setMap($scope.map);
      $scope.shapes[shape.id || i] = shape; // can have id as key
    }
    return $scope.shapes;
  };

  /**
   * Initialize infoWindows for this map
   * @returns infoWindows
   */
  this.initInfoWindows = function() {
    $scope.infoWindows = {};
    for (var i=0; i<this.infoWindows.length; i++) {
      var obj = this.infoWindows[i];
      $scope.infoWindows[obj.id || i] = obj; 
    }
    return $scope.infoWindows;
  };

  /**
   * Initialize markerClusterere for this map
   * @returns markerClusterer
   */
  this.initMarkerClusterer = function() {
    if (this.markerClusterer) {
      $scope.markerClusterer = new MarkerClusterer(
        $scope.map, 
        this.markerClusterer.data, 
        this.markerClusterer.options
      );
    }
    return $scope.markerClusterer;
  };
};
ngMap.directives.MapController.$inject = ['$scope'];
