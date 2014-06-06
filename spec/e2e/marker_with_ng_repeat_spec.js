describe('Marker With Ng-Repeat', function() {

  it('sets markers', function() {
    browser.get('marker_with_ng_repeat.html');
    element(by.css("map")).evaluate('markers[0].position.lat()').then(function(lat) {
      expect(lat).toBeGreaterThan(0);
    });
    element(by.css("map")).evaluate('markers[6].position.lng()').then(function(lng) {
      expect(lng).toBeLessThan(0);
    });
  });

});
