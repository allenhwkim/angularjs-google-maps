/* global google, waitsFor */

describe('marker', function() {
  var elm, scope;

  /* mock Attr2Options, knowns as parser */
  var MockAttr2Options = function() { 
    var hashFilter = function(hash) {
      var newHash = {};
      for (var key in hash) {
        if (hash[key].match(regexp)) {
          newHash[key] = hash[key];
        } 
      };
      return newHash;
    };
    return {
      filter: function(attrs) {return attrs;},
      getOptions: function(attrs) {return attrs;},
      getControlOptions: function(attrs) {return hashFilter(attrs, /ControlOptions$/);},
      getEvents: function(attrs) {return hashFilter(attrs, /^on[A-E]/);}
    };
  };

  // load the marker code
  beforeEach(function() {
    module(function($provide) {
      $provide.value('Attr2MapOptions', MockAttr2Options);
    });
    module('ngMap');
    inject(function($rootScope, $compile) {
      elm = angular.element(
        '<map center="[40.74, -74.18]">'+ 
        '  <marker position="[40.74, -74.18]" draggable="true"></marker>'+
        '  <marker position="[40.74, -74.18]" on-click="alert(1)"></marker>'+
        '</map>');
      scope = $rootScope;
      $compile(elm)(scope);
      scope.$digest();
      waitsFor(function() { 
        return scope.map; 
      });
    });
  });

  it('should set scope.markers with options ', function() {
    // scope.markers
    expect(Object.keys(scope.map.markers).length).toEqual(2);
    // options from attribute
    expect(scope.map.markers[0].draggable).toEqual(true);
    // contents from html
  });

  it('should set marker events', function() {
    //TODO:  need to test marker events, but don't know don't know how to get events of a marker
  });

  it('should set marker observers', function() {
    //TODO: need to test marker observers
  });
});
