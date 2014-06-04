describe('Marker With Info Window', function() {

  it('sets info window', function() {
    browser.get('marker_with_info_window.html');
    browser.executeScript(
      'var scope = angular.element(document.querySelector("map")).scope();'+
      'var markers = scope.markers;'+
      'google.maps.event.trigger(markers[0], "click");'
    );
    expect(element(by.cssContainingText('h1', 'I am an InfoWindow')).isPresent()).toBe(true);
    browser.executeScript(
      'var scope = angular.element(document.querySelector("map")).scope();'+
      'var markers = scope.markers;'+
      'google.maps.event.trigger(markers[1], "click");'
    );
    expect(element(by.cssContainingText('h1', 'I am an InfoWindow')).isPresent()).toBe(true);
    browser.executeScript(
      'var scope = angular.element(document.querySelector("map")).scope();'+
      'var markers = scope.markers;'+
      'google.maps.event.trigger(markers[2], "click");'
    );
    expect(element(by.cssContainingText('h1', 'I am an InfoWindow')).isPresent()).toBe(true);
  });

});
