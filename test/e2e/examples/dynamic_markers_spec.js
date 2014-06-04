describe('Dynamic Markers', function() {

  it('sets dynamic markers', function() {
    browser.get('dynamic_markers.html');
    browser.wait( function() {
      return browser.executeScript( function() {
        var el = document.querySelector("map");  
        var scope = angular.element(el).scope();
        return scope.dynMarkers[1].position;
      }).then(function(result) {
        return result;
      });
    }, 5000);

    element(by.css("map")).evaluate('dynMarkers[0].position.lat()').then(function(lat) {
      expect(lat).toBeGreaterThan(0);
    });
    element(by.css("map")).evaluate('dynMarkers[1].position.lng()').then(function(lng) {
      expect(lng).toBeLessThan(0);
    });
  });

});
