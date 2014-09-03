/* global ngMap, google */
describe('MapController', function() {

  var scope, ctrl;
  var el = document.body;

  beforeEach( function() {
    inject( function($controller, $rootScope){
      scope = $rootScope;
      ctrl = $controller(ngMap.directives.MapController, {$scope: scope, 'NavigatorGeolocation': {}, 'GeoCoder': {} });
      ctrl.map  = new google.maps.Map(el, {}); //each method require ctrl.map;
    });
  });

  describe('initMap', function() {
    it('should init map with options, center and events', function() {
      var options = {zoom: 10, center: new google.maps.LatLng(1,1)};
      var events = { click: function() {} };
      ctrl.initMap(el, options, events);
      // options
      expect(ctrl.map.getZoom()).toEqual(10);
      // center
      expect(ctrl.map.getCenter().lat()).toEqual(1);
      expect(ctrl.map.getCenter().lng()).toEqual(1);
      // events
      // TODO: don't know how to test this
    });
  });

  describe('addMarker', function() {
    it('should set map for the marker', function() {
      ctrl.map.markers = {};
      var marker = new google.maps.Marker({
        position: new google.maps.LatLng(1,1),
        centered: true
      });
      ctrl.addMarker(marker);
      // set map for this marker
      expect(marker.getMap()).toBe(ctrl.map);
      // set center of the map with this marker
      expect(marker.getPosition()).toBe(ctrl.map.getCenter());
      // ctrl.map.markers
      expect(Object.keys(ctrl.map.markers).length).toEqual(1);
    });
  });

  describe('initMarkers', function() {
    it('should set ctrl.map.markers', function() {
      var marker1 = new google.maps.Marker({id: 1, position: new google.maps.LatLng(1,1)});
      var marker2 = new google.maps.Marker({id: 2, position: new google.maps.LatLng(2,2)});
      ctrl.markers = [ marker1, marker2 ];
      ctrl.initMarkers();
      expect(ctrl.map.markers[1]).toBe(marker1);
      expect(ctrl.map.markers[2]).toBe(marker2);
    });
  });

  describe('initShapes', function() {
    it('should set ctrl.map.shapes', function() {
      var circle1 = new google.maps.Circle({id: 1, center: new google.maps.LatLng(1,1)});
      var circle2 = new google.maps.Circle({id: 2, center: new google.maps.LatLng(2,2)});
      ctrl.shapes = [ circle1, circle2 ];
      ctrl.initShapes();
      expect(ctrl.map.shapes[1]).toBe(circle1);
      expect(ctrl.map.shapes[2]).toBe(circle2);
      expect(ctrl.map.shapes[1].getMap()).toBe(ctrl.map);
    });
  });

  describe('initMarkerClusterer', function() {
    it('should set ctrl.map.markerClusterer', function() {
      ctrl.markerClusterer = {data: [], options: {}};
      ctrl.initMarkerClusterer();
      expect(ctrl.map.markerClusterer.getMap()).toBe(ctrl.map);
      expect(ctrl.map.markerClusterer.getMarkers().length).toEqual(0);
    });
  });

});
