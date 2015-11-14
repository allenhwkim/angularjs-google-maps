/*global jasmine*/
var excludes = [ // these examples has no ng-map
  "all-examples.html",
  "map_events.html",
  "map_lazy_init.html",
  "map-lazy-load.html",
  "map-lazy-load-params.html",
  "places-auto-complete.html"
];

function using(values, func){
  'use strict';
  for (var i = 0, count = values.length; i < count; i++) {
    (!Array.isArray(values[i])) && (values[i] = [values[i]]);
    func.apply(this, values[i]); //jshint ignore:line
    jasmine.currentEnv_.currentSpec.description +=
      ' (with using ' + values[i].join(', ') + ')';
  }
}

describe('testapp directory', function() {
  'use strict';
  var files = require('fs').readdirSync(__dirname + "/../../testapp");
  files = files.filter(function(filename) {
    return filename.match(/\.html$/) && excludes.indexOf(filename) === -1;
  });

  var urls = {};
  for (var i=0;i<files.length; i++) {
    var groupId = Math.floor(i/10);
    urls[groupId] = urls[groupId] || [];
    urls[groupId].push(files[i]);
  }
  console.log('urls', urls);

  for (var key in urls) {
    using(urls[key], function(url){
      it('testapp/'+url, function() {
        browser.get('testapp/'+url);

        browser.wait( function() {
          return browser.executeScript( function() {
            var el = document.querySelector("ng-map");  
            var injector = angular.element(el).injector();
            var NgMap = injector.get('NgMap');
            return NgMap.getMap();
          }).then(function(map) {
            return map;
          });
        }, 5000);
      });
    });
  }

});
