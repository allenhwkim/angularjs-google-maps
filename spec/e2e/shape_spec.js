
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
    element(by.css("map")).evaluate('shapes[1].map.getCenter().lat()').then(function(lat) {
      expect(lat).toBeGreaterThan(0);
    });
    element(by.css("map")).evaluate('shapes[2].map.getCenter().lat()').then(function(lat) {
      expect(lat).toBeGreaterThan(0);
    });
    element(by.css("map")).evaluate('shapes[3].map.getCenter().lat()').then(function(lat) {
      expect(lat).toBeGreaterThan(0);
    });
    element(by.css("map")).evaluate('shapes[4].map.getCenter().lat()').then(function(lat) {
      expect(lat).toBeGreaterThan(0);
    });
    element(by.css("map")).evaluate('shapes[5].map.getCenter().lat()').then(function(lat) {
      expect(lat).toBeGreaterThan(0);
    });
  });

});
