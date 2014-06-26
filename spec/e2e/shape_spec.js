
describe('Shape', function() {

  it('sets shapes', function() {
    browser.get('shape.html');
    browser.wait( function() {
      return browser.executeScript( function() {
        var el = document.querySelector("map");  
        var scope = angular.element(el).scope();
        return scope.map.getCenter().lat();
      }).then(function(result) {
        return result;
      });
    }, 5000);
    element(by.css("map")).evaluate('shapes.polyline.map.getCenter().lat()').then(function(lat) {
      expect(lat).toBeGreaterThan(0);
    });
    element(by.css("map")).evaluate('shapes.polygon.map.getCenter().lat()').then(function(lat) {
      expect(lat).toBeGreaterThan(0);
    });
    element(by.css("map")).evaluate('shapes.rectangle.map.getCenter().lat()').then(function(lat) {
      expect(lat).toBeGreaterThan(0);
    });
    element(by.css("map")).evaluate('shapes.circle.map.getCenter().lat()').then(function(lat) {
      expect(lat).toBeGreaterThan(0);
    });
    element(by.css("map")).evaluate('shapes.image.map.getCenter().lat()').then(function(lat) {
      expect(lat).toBeGreaterThan(0);
    });
  });

});
