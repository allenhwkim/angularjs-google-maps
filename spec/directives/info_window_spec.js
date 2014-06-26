/* global google, waitsFor */
/* mock Attr2Options, knowns as parser */
describe('info_window', function() {
  var elm, scope;

  // load the tabs code
  beforeEach(function() {
    module('ngMap');
    inject(function($rootScope, $compile) {
      elm = angular.element(
        '<map center="[40.74, -74.18]">'+ 
        ' <info-window '+
        '   id="marker-info" '+
        '   max-width="400"'+
        '   on-closeclick="myFunc()" '+
        '  >'+
        '   <h1> I am an InfoWindow </h1>'+
        '   I am here at [[this.getPosition()]] '+
        '   and the store name is [[store.name]] '+
        ' </info-window>'+
        '</map>');
      scope = $rootScope;
      $compile(elm)(scope);
      scope.$digest();
      waitsFor(function() {
        return scope.map;
      });
    });
  });

  it('should set scope.showInfoWindows with options ', function() {
    // scope.infoWindows
    expect(Object.keys(scope.infoWindows).length).toEqual(1);
    // options from attribute
    expect(scope.infoWindows["marker-info"].maxWidth).toEqual(400);
    // contents from html
    expect(scope.infoWindows["marker-info"].contents).toEqual(elm.find('info-window').html());
    // don't show when initialized
    expect(elm.find("info-window")[0].style.display).toEqual('none');
  });

  it('should set infoWindow events', function() {
    //TODO: don't know how to get events of an infoWindow
  });
});
