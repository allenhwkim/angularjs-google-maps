/*global jasmine*/
var excludes = [
    "map_events.html", 
    "map_lazy_init.html", 
    "map-lazy-load.html", 
    "marker_with_dynamic_position.html",
    "marker_with_dynamic_address.html",
    "marker_with_info_window.html",
    "places-auto-complete.html"
  ];

function using(values, func){
  for (var i = 0, count = values.length; i < count; i++) {
    if (Object.prototype.toString.call(values[i]) !== '[object Array]') {
      values[i] = [values[i]];
    }
    func.apply(this, values[i]);
    jasmine.currentEnv_.currentSpec.description += ' (with using ' + values[i].join(', ') + ')';
  }
}

describe('testapp directory', function() {
  'use strict';
  //var urls = ["aerial-rotate.html", "aerial-simple.html", "hello_map.html", "map_control.html"];
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
          //return scope.map.getCenter().lat();
          return scope.map.getCenter();
        }).then(function(result) {
          return result;
        });
      }, 5000);
      //element(by.css("map")).evaluate('map.getCenter().lat()').then(function(lat) {
      //  console.log('lat', lat);
      //  expect(lat).toNotEqual(0);
      //});
      browser.manage().logs().get('browser').then(function(browserLog) {
        (browserLog.length > 0) && console.log('log: ' + require('util').inspect(browserLog));
        expect(browserLog).toEqual([]);
      });
    });

  });

});
