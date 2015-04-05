/* global google, waitsFor */

describe('street-view-panorama', function() {
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
      $provide.value('Attr2Options', MockAttr2Options);
    });
    module('ngMap');
    inject(function($rootScope, $compile) {
      elm = angular.element(
        '<map zoom="11" center="[40.688738,-74.043871]">' +
        '  <street-view-panorama container="streetview">' + 
        '  </street-view-panorama>' +
        '</map>');
      scope = $rootScope;
      $compile(elm)(scope);
      scope.$digest();
      waitsFor(function() { 
        return scope.map; 
      });
    });
  });

  it('should set map streetview with options ', function() {
    var svp = scope.map.getStreetView();
    expect(svp instanceof google.maps.StreetViewPanorama).toBe(true);
    expect(svp.getPosition().lat()).toEqual(40.688738);
  });

});
