/* global google */
describe('Attr2MapOptions', function() {
  'use strict';
   var scope, $parse, $timeout, $log, $interpolate,
     NavigatorGeolocation, GeoCoder, cameCaseFilter,
     jsonnizeFilter, parser, google;

   beforeEach(module('ngMap', function($provide) {
     // Do some other stuff before each test run if you want...
   }));

   beforeEach(inject(function (
     $rootScope,
     _$parse_, _$timeout_, _$log_, _$interpolate_,
     _NavigatorGeolocation_, _GeoCoder_, _camelCaseFilter_,
     _jsonizeFilter_, _Attr2MapOptions_
   ) {
     scope = $rootScope;
     $parse = _$parse_;
     $timeout    = _$timeout_;
     $log = _$log_;
     $interpolate = _$interpolate_;
     NavigatorGeolocation = _NavigatorGeolocation_;
     GeoCoder = _GeoCoder_;
     cameCaseFilter = _camelCaseFilter_;
     jsonnizeFilter = _jsonizeFilter_;
     parser = _Attr2MapOptions_;
   }));

  describe("#filter", function() {
    it('should filter all angularjs methods', function() {
      var attrs ={a:1, $a:1, $$a:1};
      expect(parser.filter(attrs).a).toEqual(1);
      expect(parser.filter(attrs).$a).toEqual(undefined);
      expect(parser.filter(attrs).$$a).toEqual(undefined);
    });
  });

  describe("#getOptions", function() {

    it('should filter out ControlOptions', function() {
      var attrs ={a:1, aControlOptions:1};
      expect(parser.getOptions(attrs).aControlOptions).toEqual(undefined);
    });

    it('should filter out events', function() {
      var attrs ={a:1, onClick:'func'};
      expect(parser.getOptions(attrs).onClick).toEqual(undefined);
    });

    it('should convert string to number', function() {
      var attrs ={a:'100.99'};
      expect(parser.getOptions(attrs).a).toEqual(100.99);
    });

    it('should convert JSON to an object', function() {
      var attrs = {a:'{"foo":123}'};
      expect(parser.getOptions(attrs).a.foo).toEqual(123);
    });

    it('should convert object-like JSON string to an object', function() {
      var attrs = {a:"{ hello: 'world',foo:1,  bar  : '2', foo1: 1, _bar : 2, $2: 3,"+
        " 'xxx': 5, \"fuz\": 4, places: ['Africa', 'America', 'Asia', 'Australia'] }"
      };
      expect(parser.getOptions(attrs).a.hello).toEqual("world");
    });

    it('should convert Class name to google object', function() {
      var attrs = {a:'Marker()'};
      expect(typeof parser.getOptions(attrs, scope).a).toEqual('object');
    });

    it('should convert constant to google constant', function() {
      var attrs = {a:'MapTypeId.HYBRID'};
      expect(parser.getOptions(attrs, scope).a).toEqual('hybrid');
      attrs = {MapTypeId:'HYBRID'};
      expect(parser.getOptions(attrs, scope).MapTypeId).toEqual('hybrid');
    });

    it('should convert ISO date strings to Date objects', function() {
      var attrs = {a:'2015-08-13T04:11:23.005Z'};
      expect(parser.getOptions(attrs, scope).a instanceof Date).toBe(true);
    });

    it('should convert nested date to Date object', function() {
      var attrs = {a: '{"departureTime":"2015-08-13T18:00:21.846Z"}'};
      expect(typeof parser.getOptions(attrs, scope).a).toEqual('object');
      expect(parser.getOptions(attrs, scope).a.departureTime instanceof Date).toEqual(true);
    });

    it('should convert nested value to google object', function() {
      var attrs = {circleOptions: '{"center": "LatLng(80,-49)"}'};
      expect(parser.getOptions(attrs, scope).circleOptions.center.lat()).toEqual(80);
      expect(parser.getOptions(attrs, scope).circleOptions.center.lng()).toEqual(-49);
    });

    it('should not ignore 0', function() {
      var attrs = {pov: '{heading: 90, pitch: 0}'};
      expect(parser.getOptions(attrs, scope).pov.heading).toEqual(90);
      expect(parser.getOptions(attrs, scope).pov.pitch).toEqual(0);
    });

    it('should parse {{foo}}', function() {
      var attrs = {'dynamic': '{{foo}}'};
      scope.foo = 1234;
      expect(parser.getOptions(attrs, {scope:scope}).dynamic).toEqual(1234);
    });

  });

  describe("#getControlOptions", function() {
    it('should filter out non control options', function() {
      var attrs ={a:1};
      expect(parser.getControlOptions(attrs).a).toEqual(undefined);
    });
    it('should accept object notation, i.e {foo:1}', function() {
      var attrs ={aControlOptions: '{foo:1}'};
      expect(parser.getControlOptions(attrs).aControlOptions.foo).toEqual(1);
    });
    it('should convert string to uppercase. i.e {"a":"foo"}', function() {
      var attrs ={aControlOptions: '{"foo":"bar"}'};
      expect(parser.getControlOptions(attrs).aControlOptions.foo).toEqual("BAR");
    });
    it('should convert mapTypeIds to google MapTypeIds', function() {
      var attrs ={aControlOptions: '{"mapTypeIds":["HYBRID"]}'};
      expect(parser.getControlOptions(attrs).aControlOptions.mapTypeIds).toEqual(["hybrid"]);
    });
    it('should convert style to matching google ones, i.e. ZoomControlStyle', function() {
      var attrs ={zoomControlOptions: '{"style":"SMALL"}'};
      expect(parser.getControlOptions(attrs).zoomControlOptions.style).toEqual(1);
    });
    it('should convert position to matching google ones, i.e. google.maps.ControlPosition', function() {
      var attrs ={zoomControlOptions: '{"position":"TOP_LEFT"}'};
      expect(parser.getControlOptions(attrs).zoomControlOptions.position).toEqual(1);
    });
  });

  describe("#getEvents", function() {
    it('should filter out non events', function() {
      var attrs ={a:1};
      expect(parser.getEvents(scope, attrs).a).toEqual(undefined);
    });
    it('should set scope function as events', function() {
      scope.scopeFunc = function() {};
      var attrs ={onClick:'scopeFunc()'};
      var events = parser.getEvents(scope, attrs);
      expect(typeof events.click).toEqual('function');
    });
    it('should pass arguments to callback', function() {
      scope.name = 'dave';
      scope.scopeFunc = function() {};
      var attrs ={onClick:'scopeFunc(name)'};
      var events = parser.getEvents(scope, attrs);
      var event = {};
      spyOn(scope, 'scopeFunc'); /*jshint ignore:line*/
      events.click(event);
      expect(scope.scopeFunc).toHaveBeenCalledWith(event, scope.name);
    });
    it('should respond to scope model changes', function() {
      scope.name = 'dave';
      scope.scopeFunc = function() {};
      var attrs ={onClick:'scopeFunc(name)'};
      var events = parser.getEvents(scope, attrs);
      var event;
      spyOn(scope, 'scopeFunc'); /*jshint ignore:line*/
      scope.name = 'george';
      events.click(event);
      expect(scope.scopeFunc).toHaveBeenCalledWith(event, scope.name);
    });
  });

  describe("#getAttrsToObserve", function() {
    //it('should return no attributes to observe with ng-repeat', function() {
    //  var attrs ={a:"1", b:"{{foo}}", 'ng-repeat': "bar"};
    //  expect([]).toEqual(parser.getAttrsToObserve(attrs));
    //});
    it('should return attributes to observe', function() {
      var attrs ={a:"1", b:"{{foo}}", c:"{{bar}}"};
      expect(['b', 'c']).toEqual(parser.getAttrsToObserve(attrs));
    });
  });

  describe("#observeAndSet", function() {
    //TODO
    // var observeAndSet = function(attrs, attrName, object) {
    // check object[setMethod] is called when attribute value is changed
  });

  describe("#observeAttrSetSet", function() {
    //TODO
    // var observeAttrSetObj = function(orgAttrs, attrs, obj) {}
    // check if observeAndSet is called
  });

  describe("#orgAttributes", function() {
    //TODO
    //var orgAttributes = function(el) { return orgAttributes }
  });

  describe("#setDelayedGeoLocation", function() {
    //TODO: need some mock jobs for object, NavigatorGeolocation and GeoCoder
  });

  describe("#observeAndSet", function() {
    //TODO: needs some mock jobs for object and attrs
  });

});
