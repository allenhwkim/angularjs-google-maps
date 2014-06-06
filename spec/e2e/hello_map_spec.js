describe('Hello Map', function() {


  it('sets map and its center', function() {
  browser.get('hello_map.html');
    // expect(browser.getLocationAbsUrl()).toMatch("/hello_map.html");
    element(by.css("map")).evaluate('map.getCenter().lat()').then(function(lat) {
      expect(lat).toBeGreaterThan(0);
    });
    element(by.css("map")).evaluate('map.getCenter().lng()').then(function(lng) {
      expect(lng).toBeLessThan(0);
    });
  });

});
