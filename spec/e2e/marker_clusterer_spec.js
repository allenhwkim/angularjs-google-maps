describe('Marker Clusterer', function() {

  it('sets marker cluster', function() {
  browser.get('marker_clusterer.html');
    // expect(browser.getLocationAbsUrl()).toMatch("/hello_map.html");
    browser.wait( function() {
      return browser.executeScript( function() {
        var el = document.querySelector("map");  
        var scope = angular.element(el).scope();
        return scope.map.getCenter().lat();
      }).then(function(result) {
        return result;
      });
    }, 5000);
    element(by.css("map")).evaluate('markerClusterer.markers.length').then(function(len1) {
      element(by.css("map")).evaluate('map.markers.length').then(function(len2) {
        expect(len2).toBeGreaterThanl(1000);
        expect(len2).toEqual(len1);
      });
    });
  });

});
