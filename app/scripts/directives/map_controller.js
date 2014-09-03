/**
 * @ngdoc directive
 * @name MapController
 * @requires $scope
 * @requires NavigatorGeolocation
 * @requires GeoCoder
 * @property {Hash} controls collection of Controls initiated within `map` directive
 * @property {Hash} markersi collection of Markers initiated within `map` directive
 * @property {Hash} shapes collection of shapes initiated within `map` directive
 * @property {MarkerClusterer} markerClusterer MarkerClusterer initiated within `map` directive
 */
ngMap.directives.MapController = function($scope, NavigatorGeolocation, GeoCoder) { 

  this.map = null;
  this.controls = {};
  this.markers = [];
  this.shapes = [];
  this.markerClusterer = null;

  /**
   * Initialize map with options, center and events
   * @memberof MapController
   * @name initMap
   * @param {HtmlElement} el element that a map is drawn
   * @param {MapOptions} options google map options
   * @param {Hash} events google map events. The key is the name of the event
   */
  this.initMap = function(el, options, events) {
    this.map = new google.maps.Map(el, {});
    var center = options.center;
    if (!(center instanceof google.maps.LatLng)) {
      delete options.center;
    }
    var _this = this;
    if (typeof center == 'string') { // address
      GeoCoder.geocode({address: center})
        .then(function(results) {
          _this.map.setCenter(results[0].geometry.location);
        });
    } else if (!center) { //no center given, use current location
      NavigatorGeolocation.getCurrentPosition()
        .then(
          function(position) {
            var lat = position.coords.latitude, 
                lng = position.coords.longitude;
            _this.map.setCenter(new google.maps.LatLng(lat,lng));
          },
          function() { //current location failed, use fallback
            if(options.geoFallbackCenter instanceof Array) {
              var lat = options.geoFallbackCenter[0],
                  lng = options.geoFallbackCenter[1];
              _this.map.setCenter(new google.maps.LatLng(lat,lng));
            } else {
              this.map.setCenter(new google.maps.LatLng(0,0)); //default lat, lng
            }
          }
        ); // then
    }

    this.map.setOptions(options);
    for (var eventName in events) {
      if (eventName) {
        google.maps.event.addListener(this.map, eventName, events[eventName]);
      }
    }
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
    marker.setMap(this.map);
    if (marker.centered) {
      this.map.setCenter(marker.position);
    }
    var len = Object.keys(this.map.markers).length;
    this.map.markers[marker.id || len] = marker;
  };

  /**
   * Initialize markers
   * @memberof MapController
   * @name initMarkers
   */
  this.initMarkers = function() {
    this.map.markers = {};
    for (var i=0; i<this.markers.length; i++) {
      var marker = this.markers[i];
      this.addMarker(marker);  //set this.map.markers
    }
  };

  /**
   * Add a shape to map and $scope.shapes
   * @memberof MapController
   * @name addShape
   * @param {Shape} shape google map shape
   */
  this.addShape = function(shape) {
    shape.setMap(this.map);
    var len = Object.keys(this.map.shapes).length;
    this.map.shapes[shape.id || len] = shape;
  };

  /**
   * Initialize shapes
   * @memberof MapController
   * @name initShapes
   */
  this.initShapes = function() {
    this.map.shapes = {};
    for (var i=0; i<this.shapes.length; i++) {
      var shape = this.shapes[i];
      this.addShape(shape);
    }
  };

  /**
   * Initialize markerClusterere for this map
   * @memberof MapController
   * @name initMarkerClusterer
   */
  this.initMarkerClusterer = function() {
    if (this.markerClusterer) {
      this.map.markerClusterer = new MarkerClusterer(
        this.map, 
        this.markerClusterer.data, 
        this.markerClusterer.options
      );
    }
  };
};
ngMap.directives.MapController.$inject = ['$scope', 'NavigatorGeolocation', 'GeoCoder'];
