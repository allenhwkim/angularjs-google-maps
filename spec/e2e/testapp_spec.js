'use strict';
var argv = require('yargs').argv; 

/*global document, afterEach*/
var excludes = [ // these examples has no ng-map
  "all-examples.html",
  "map_events.html",
  "map_lazy_init.html",
  "map-lazy-load.html",
  "map-lazy-load-params.html",
  "places-auto-complete.html"
];

var filesRE = argv.files == 'undefined' ? null : new RegExp(argv.files);
console.log('filesRE', filesRE);

function using(filename, func){
  func.apply(this, [filename]); //jshint ignore:line
}

describe('testapp directory', function() {
  var allFiles = require('fs').readdirSync(__dirname + "/../../testapp");
  allFiles = allFiles.filter(function(filename) {
    return (
      filename.match(/\.html$/) &&
      excludes.indexOf(filename) === -1 &&
      (filesRE ? filename.match(filesRE) : true)
    );
  });
  console.log('files to run', allFiles);

  //TODO: apply retry when it has console error. e.g. google image 404 error
  allFiles.forEach(function(filename) {
    using(filename, function(url){
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
        }, 2000);

        browser.manage().logs().get('browser').then(function(browserLog) {
          expect(browserLog.length).toEqual(0);
          browserLog.length && console.log(JSON.stringify(browserLog));
        });

      });
    });
  });

});
