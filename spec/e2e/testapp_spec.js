/*global jasmine*/
var excludes = [
  "index.html",
  "map_events.html", 
  "map_lazy_init.html", 
  "map-lazy-load.html", 
  "marker_with_dynamic_position.html",
  "marker_with_dynamic_address.html",
  "marker_with_info_window.html",
  "places-auto-complete.html",
  "street-view_road_trip.html"
];

function using(values, func){
  'use strict';
  for (var i = 0, count = values.length; i < count; i++) {
    (!Array.isArray(values[i])) && (values[i] = [values[i]]);
    func.apply(this, values[i]);
    jasmine.currentEnv_.currentSpec.description += ' (with using ' + values[i].join(', ') + ')';
  }
}

describe('testapp directory', function() {
  'use strict';
  var files = require('fs').readdirSync(__dirname + "/../../testapp");
  var urls = files.filter(function(filename) { 
    return filename.match(/\.html$/) && excludes.indexOf(filename) === -1; 
  });
  console.log('urls', urls);

  using(urls, function(url){

    it('testapp/'+url, function() {
      browser.get(url);
      browser.wait( function() {
        return browser.executeScript( function() {
          var el = document.querySelector("map");  
          var scope = angular.element(el).scope();
          return scope.map.getCenter();
        }).then(function(result) {
          return result;
        });
      }, 5000);
      browser.manage().logs().get('browser').then(function(browserLog) {
        (browserLog.length > 0) && console.log('log: ' + require('util').inspect(browserLog));
        expect(browserLog).toEqual([]);
      });
    });

  });

});
