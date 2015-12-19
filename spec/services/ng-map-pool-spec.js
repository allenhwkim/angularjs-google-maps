describe('NgMapPool', function() {
  'use strict';
   var scope, $window, NgMapPool;

   beforeEach(module('ngMap', function($provide) { //jshint ignore:line
   }));

   beforeEach(inject(function ($rootScope, _NgMapPool_, _$window_) {
     scope = $rootScope;
     NgMapPool = _NgMapPool_, $window = _$window_;
     $window.google = {
       maps: {
         Map: function() {
          this.getDiv = function() {};
         }
       }
     };
   }));

  describe("#getMapInstance #returnMapInstance", function() {
    it('it should create a new map instance and return', function() {
      var el = {
        style: {},
        appendChild: function(){},
        getAttribute: function() {return "true";},
        currentStyle: {}
      };
      var map1, map2, map3;
      expect(NgMapPool.mapInstances.length).toEqual(0);
      map1 = NgMapPool.getMapInstance(el);
      expect(NgMapPool.mapInstances.length).toEqual(1);
      expect(map1.inUse).toEqual(true);
      map2 = NgMapPool.getMapInstance(el);
      expect(NgMapPool.mapInstances.length).toEqual(2);
      expect(map2.inUse).toEqual(true);
      map3 = NgMapPool.getMapInstance(el);
      expect(NgMapPool.mapInstances.length).toEqual(3);
      expect(map3.inUse).toEqual(true);

      NgMapPool.returnMapInstance(map1);
      NgMapPool.returnMapInstance(map2);
      expect(NgMapPool.mapInstances.length).toEqual(3);
      expect(map1.inUse).toEqual(false);
      expect(map2.inUse).toEqual(false);
      expect(map3.inUse).toEqual(true);

      var map4 = NgMapPool.getMapInstance(el);
      var map5 = NgMapPool.getMapInstance(el);
      expect(map1).toEqual(map4);
      expect(map2).toEqual(map5);
    });
  });

});
