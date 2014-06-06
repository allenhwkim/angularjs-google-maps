describe('Marker With Address', function() {

  it('sets marker with address', function() {
    browser.get('marker_with_address.html');
    browser.wait( function() {
      return browser.executeScript( function() {
        var el = document.querySelector("map");  
        var scope = angular.element(el).scope();
        return scope.markers && scope.markers[0] && scope.markers[0].position;
      }).then(function(result) {
        return result;
      });
    }, 5000);

    element(by.css("map")).evaluate('markers[0].position.lat()').then(function(lat) {
      expect(lat).toBeGreaterThan(0);
    });

    element(by.css("map")).evaluate('markers[0].position.lng()').then(function(lng) {
      expect(lng).toBeLessThan(0);
    });
  });

});
