/* global ngMap, google */
describe('MapController', function() {

  var scope, ctrl;

  beforeEach(inject(function($controller, $rootScope, $q) {
    scope = $rootScope;
    scope.map = new google.maps.Map(document.body, {}); //each method requires $scope.map
    ctrl = $controller(ngMap.directives.MapController, { $scope: scope });
  }));

  describe('initMap', function() {
    it('should init map with options, center and events', function() {
      var options = {zoom: 10};
      var center = new google.maps.LatLng(1,1);
      var events = { click: function() {} };
      ctrl.initMap(options, center, events);
      // options
      expect(scope.map.getZoom()).toEqual(10);
      // center
      expect(scope.map.getCenter().lat()).toEqual(1);
      expect(scope.map.getCenter().lng()).toEqual(1);
      // events
      // TODO: don't know how to test this
    });
  });

  describe('addMarker', function() {
    it('should set map for the marker', function() {
      var marker = new google.maps.Marker({
        position: new google.maps.LatLng(1,1),
        centered: true
      });
      scope.markers = {};
      ctrl.addMarker(marker);
      // set map for this marker
      expect(marker.getMap()).toBe(scope.map);
      // set center of the map with this marker
      expect(marker.getPosition()).toBe(scope.map.getCenter());
      // scope.markers
      expect(Object.keys(scope.markers).length).toEqual(1);
    });
  });

  describe('initMarkers', function() {
    it('should set $scope.markers', function() {
      var marker1 = new google.maps.Marker({id: 1, position: new google.maps.LatLng(1,1)});
      var marker2 = new google.maps.Marker({id: 2, position: new google.maps.LatLng(2,2)});
      ctrl.markers = [ marker1, marker2 ];
      ctrl.initMarkers();
      expect(scope.markers[1]).toBe(marker1);
      expect(scope.markers[2]).toBe(marker2);
    });
  });

  describe('initShapes', function() {
    it('should set $scope.shapes', function() {
      var circle1 = new google.maps.Circle({id: 1, center: new google.maps.LatLng(1,1)});
      var circle2 = new google.maps.Circle({id: 2, center: new google.maps.LatLng(2,2)});
      ctrl.shapes = [ circle1, circle2 ];
      ctrl.initShapes();
      expect(scope.shapes[1]).toBe(circle1);
      expect(scope.shapes[2]).toBe(circle2);
      expect(scope.shapes[1].getMap()).toBe(scope.map);
    });
  });

  describe('initInfoWindows', function() {
    it('should set $scope.infoWindows', function() {
      var infowin1 = new google.maps.InfoWindow({id: 1, contents: 'foo'});
      var infowin2 = new google.maps.InfoWindow({id: 2, contents: 'bar'});
      ctrl.infoWindows = [ infowin1, infowin2 ];
      ctrl.initInfoWindows();
      expect(scope.infoWindows[1]).toBe(infowin1);
      expect(scope.infoWindows[2]).toBe(infowin2);
    });
  });

  describe('initMarkerClusterer', function() {
    it('should set $scope.markerClusterer', function() {
      ctrl.markerClusterer = {data: [], options: {}};
      ctrl.initMarkerClusterer();
      expect(scope.markerClusterer.getMap()).toBe(scope.map);
      expect(scope.markerClusterer.getMarkers().length).toEqual(0);
    });
  });

});
