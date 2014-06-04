describe('Map Control', function() {

  it('sets map control', function() {
    browser.get('map_control.html');
    element(by.css("map")).evaluate('map.getCenter().lat()').then(function(lat) {
      expect(lat).toBeGreaterThan(0);
    });
    element(by.css("map")).evaluate('map.getCenter().lng()').then(function(lng) {
      expect(lng).toBeLessThan(0);
    });
    element(by.css("map")).evaluate('map.zoomControl').then(function(res) {
      expect(res).toBe(true);
    });
    element(by.css("map")).evaluate('map.zoomControlOptions').then(function(res) {
      expect(res.style).toEqual(1);
      expect(res.position).toEqual(10);
    });
    element(by.css("map")).evaluate('map.mapTypeControl').then(function(res) {
      expect(res).toBe(true);
    });
    element(by.css("map")).evaluate('map.mapTypeControlOptions').then(function(res) {
      expect(res.style).toEqual(2);
      expect(res.position).toEqual(3);
      expect(res.mapTypeIds.length).toEqual(4);
    });
    element(by.css("map")).evaluate('map.overviewMapControl').then(function(res) {
      expect(res).toBe(true);
    });
    element(by.css("map")).evaluate('map.overviewMapControl').then(function(res) {
      expect(res).toBe(true);
    });
    element(by.css("map")).evaluate('map.panControl').then(function(res) {
      expect(res).toBe(true);
    });
    element(by.css("map")).evaluate('map.panControlOptions').then(function(res) {
      expect(res.position).toEqual(4);
    });
    element(by.css("map")).evaluate('map.rotateControl').then(function(res) {
      expect(res).toBe(true);
    });
    element(by.css("map")).evaluate('map.rotateControlOptions').then(function(res) {
      expect(res.position).toEqual(8);
    });
  });

});
