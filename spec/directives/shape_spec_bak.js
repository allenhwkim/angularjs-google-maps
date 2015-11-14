/* global google, waitsFor */
describe('shape', function() {
  var elm, scope;

  // load the marker code
  beforeEach(function() {
    module('ngMap');
    inject(function($rootScope, $compile) {
      elm = angular.element(
         '<map zoom="11" center="[40.74, -74.18]">'+
         '   <shape id="polyline" name="polyline" geodesic="true" stroke-color="#FF0000" stroke-opacity="1.0" stroke-weight="2"'+
         '     path="[[40.74,-74.18],[40.64,-74.10],[40.54,-74.05],[40.44,-74]]" />'+
         '   <shape id="polygon" name="polygon" stroke-color="#FF0000" stroke-opacity="1.0" stroke-weight="2"'+
         '     paths="[[40.74,-74.18],[40.64,-74.18],[40.84,-74.08],[40.74,-74.18]]" />'+
         '   <shape id="rectangle" name="rectangle" stroke-color="#FF0000" stroke-opacity="0.8" stroke-weight="2"'+
         '     bounds="[[40.74,-74.18], [40.78,-74.14]]" editable="true" />'+
         '   <shape id="circle" name="circle" stroke-color="#FF0000" stroke-opacity="0.8"stroke-weight="2" '+
         '     center="[40.70,-74.14]" radius="4000" editable="true" />'+
         '   <shape id="image" name="image" url="https://www.lib.utexas.edu/maps/historical/newark_nj_1922.jpg"'+
         '     bounds="[[40.71,-74.22],[40.77,-74.12]]" opacity="0.7" clickable="true" />'+
         '</map>');
      scope = $rootScope;
      $compile(elm)(scope);
      scope.$digest();
      waitsFor(function() { 
        return scope.map; 
      });
    });
  });

  it('should set scope.shapes with options ', function() {
    // scope.shapes
    expect(Object.keys(scope.map.shapes).length).toEqual(5);
    // polyline
    expect(scope.map.shapes.polyline.geodesic).toBe(true);
    // polygon
    expect(scope.map.shapes.polygon.strokeColor).toEqual('#FF0000');
    // rectangle
    expect(scope.map.shapes.rectangle.editable).toBe(true);
    // circle
    expect(scope.map.shapes.circle.radius).toEqual(4000);
    // image
    expect(scope.map.shapes.image.getUrl()).toEqual("https://www.lib.utexas.edu/maps/historical/newark_nj_1922.jpg");
  });

  it('should set shape events', function() {
    //TODO: should test events, but don't know how to get events of a shape
  });

  it('should set shape observers', function() {
    //TODO: need to test observers
  });
});
