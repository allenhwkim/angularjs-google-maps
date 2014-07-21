/**
 * @ngdoc directive
 * @name MapController
 * @requires $scope
 * @property {Hash} controls collection of Controls initiated within `map` directive
 * @property {Hash} markersi collection of Markers initiated within `map` directive
 * @property {Hash} shapes collection of shapes initiated within `map` directive
 * @property {Hash} infoWindows collection of InfoWindows initiated within `map` directive
 * @property {MarkerClusterer} markerClusterer MarkerClusterer initiated within `map` directive
 */
ngMap.directives.MapController = function($scope) { 

  this.controls = {};
  this.markers = [];
  this.shapes = [];
  this.infoWindows = [];
  this.markerClusterer = null;

  /**
   * Initialize map with options, center and events
   * This emits a message `mapInitialized` with the parmater of map, Google Map Object
   * @memberof MapController
   * @name initMap
   * @param {MapOptions} options google map options
   * @param {LatLng} center the center of the map
   * @param {Hash} events  google map events. The key is the name of the event
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
   * Add a marker to map and $scope.markers
   * @memberof MapController
   * @name addMarker
   * @param {Marker} marker google map marker
   *    if marker has centered attribute with the key of the value,
   *    the map will be centered with the marker
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
   * @memberof MapController
   * @name initMarkers
   * @returns {Hash} markers collection of markers
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
   * Add a shape to map and $scope.shapes
   * @memberof MapController
   * @name addShape
   * @param {Shape} shape google map shape
   */
  this.addShape = function(shape) {
    shape.setMap($scope.map);
    var len = Object.keys($scope.shapes).length;
    $scope.shapes[shape.id || len] = shape;
  };

  /**
   * Initialize shapes
   * @memberof MapController
   * @name initShapes
   * @returns {Hash} shapes collection of shapes
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
   * @memberof MapController
   * @name initInfoWindows
   * @returns {Hash} infoWindows collection of InfoWindows
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
   * @memberof MapController
   * @name initMarkerClusterer
   * @returns {MarkerClusterer} markerClusterer
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
