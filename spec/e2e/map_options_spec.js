describe('Map Options', function() {

  it('sets map options', function() {
    browser.get('map_options.html');
    element(by.css("map")).evaluate('map.disableDefaultUI').then(function(res) {
      expect(res).toBe(true);
    });
    element(by.css("map")).evaluate('map.disableDoubleClickZoom').then(function(res) {
      expect(res).toBe(true);
    });
    element(by.css("map")).evaluate('map.draggable').then(function(res) {
      expect(res).toBe(false);
    });
    element(by.css("map")).evaluate('map.draggingCursor').then(function(res) {
      expect(res).toMatch("move");
    });
    element(by.css("map")).evaluate('map.draggableCursor').then(function(res) {
      expect(res).toMatch("help");
    });
    element(by.css("map")).evaluate('map.keyboardShortcuts').then(function(res) {
      expect(res).toBe(false);
    });
    element(by.css("map")).evaluate('map.minZoom').then(function(res) {
      expect(res).toEqual(8);
    });
    element(by.css("map")).evaluate('map.tilt').then(function(res) {
      expect(res).toEqual(0);
    });
    element(by.css("map")).evaluate('map.mapTypeId').then(function(res) {
      expect(res).toMatch('terrain');
    });
  });

});
