describe('Marker', function() {

  it('sets markers', function() {
    browser.get('marker.html');
    element(by.css("map")).evaluate('markers[0].position.lat()').then(function(lat) {
      expect(lat).toBeGreaterThan(0);
    });
    element(by.css("map")).evaluate('markers[7].position.lng()').then(function(lng) {
      expect(lng).toBeLessThan(0);
    });
  });

});
