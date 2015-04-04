/* global ngMap, google */
describe('MapController', function() {
  'use strict';

  var scope, ctrl;
  var el = document.body;

  beforeEach(function() {
    module('ngMap');
    inject( function($controller, $rootScope){
        scope = $rootScope;
        ctrl = $controller('MapController', {
          $scope: scope, 
          'NavigatorGeolocation': {},
          'GeoCoder': {}
        });
    });
  });

  describe('addObject', function() {
    it('should add a marker to the existing map', function() {
      ctrl.map  = new google.maps.Map(el, {}); //each method require ctrl.map;
      ctrl.map.markers = {};
      var marker = new google.maps.Marker({
        position: new google.maps.LatLng(1,1),
        centered: true
      });
      ctrl.addObject('markers', marker);
      // set map for this marker
      expect(marker.getMap()).toBe(ctrl.map);
      // set center of the map with this marker
      expect(marker.getPosition()).toBe(ctrl.map.getCenter());
      // ctrl.map.markers
      expect(Object.keys(ctrl.map.markers).length).toEqual(1);
    });
    
    it('should add a marker to ctrl._objects when ctrl.map is not init', function() {
      ctrl._objects = [];
      var marker = new google.maps.Marker({position: new google.maps.LatLng(1,1)});
      ctrl.addObject('markers', marker);
      expect(ctrl._objects[0]).toBe(marker);
    });
  });

  describe('addShape', function() {
    it('should add a shape to ctrl._objects when ctrl.map is not init', function() {
      ctrl._objects = [];
      var circle = new google.maps.Circle({center: new google.maps.LatLng(1,1)});
      ctrl.addObject('shapes', circle);
      expect(ctrl._objects[0]).toBe(circle);
    });
    
    it('should add a shape to the existing map', function() {
      ctrl.map  = new google.maps.Map(el, {}); //each method require ctrl.map;
      ctrl.map.shapes = {};
      var circle = new google.maps.Circle({center: new google.maps.LatLng(1,1)});
      ctrl.addObject('shapes', circle);
      expect(ctrl.map.shapes[0]).toBe(circle);
      expect(ctrl.map.shapes[0].getMap()).toBe(ctrl.map);
    });
  });

  describe('addObjects', function() {
    it('should add objects; markers and shapes when map is init', function() {
      var marker = new google.maps.Marker({position: new google.maps.LatLng(1,1)});
      var circle = new google.maps.Circle({center: new google.maps.LatLng(1,1)});
      var objects = [marker, circle];

      ctrl.map  = new google.maps.Map(el, {}); //each method require ctrl.map;
      ctrl.addObjects(objects);
      expect(marker.getMap()).toBe(ctrl.map);
      expect(circle.getMap()).toBe(ctrl.map);
    });
  });

});
