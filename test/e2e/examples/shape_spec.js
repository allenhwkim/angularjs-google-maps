
describe('Shape', function() {

  it('sets shapes', function() {
    browser.get('shape.html');
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
