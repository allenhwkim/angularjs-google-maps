describe('Marker Clusterer', function() {

  it('sets marker cluster', function() {
  browser.get('marker_clusterer.html');
    // expect(browser.getLocationAbsUrl()).toMatch("/hello_map.html");
    browser.wait( function() {
      return browser.executeScript( function() {
        var el = document.querySelector("map");  
        var scope = angular.element(el).scope();
        return scope.markerClusterer.getMarkers() && scope.markerClusterer.getMarkers().length;
      }).then(function(result) {
        return result;
      });
    }, 5000);
    element(by.css("map")).evaluate('markerClusterer.getMarkers().length').then(function(len1) {
      expect(len1).toBeGreaterThan(1000);
    });
  });

});
