GoogleMap AngularJS Directive
=============================

[![Build Status](https://travis-ci.org/allenhwkim/angularjs-google-maps.png?branch=master)](https://travis-ci.org/allenhwkim/angularjs-google-maps)

IMPORTANT NOTICE
-----------------

 - `$scope.map` is deprecated. Use `NgMap.getMap().then(function(map) {...})`
    instead to get a map instance.
 - `$scope.$on('mapInitialized', function(event, map) {..}` is deprecated.
    Use `NgMap.getMap().then(function(map) {...})` instead to get a map instance.
 - `$scope.showInfoWindow(id)` is deprecated. `map.showInfoWindow(id)` instead.
    You need to get map instance usng `NgMap.getMap().then()` in advance.
 - `map` tag is deprecated. Use `ng-map` tag instead

[Demo](http://ngmap.github.io)  
[Documentation](https://rawgithub.com/allenhwkim/angularjs-google-maps/master/build/docs/index.html)  
[Road Trip By StreetView](https://rawgit.com/allenhwkim/angularjs-google-maps/master/testapp/street-view_road_trip.html)  
[Maps Can Talk](https://rawgit.com/allenhwkim/angularjs-google-maps/master/testapp/custom-marker.html) |
[Custom Marker](https://rawgit.com/allenhwkim/angularjs-google-maps/master/testapp/custom-marker-2.html)  

There is already [one](https://github.com/nlaplante/angular-google-maps) for this. However, I found myself doing totally different approach than the existing one, such as;

1. **Everything in tag and attributes.**   
   Thus, basic users don't even have to know what Javascript is. 

2. **Expose all original Google Maps V3 api to the user.**   
   No hiding, no wraping, or whatsoever. 
   By doing so, programmers don't need to learn how to use this module.
   You only need to know Google Maps V3 API.

There is a blog that introduces this module. The title of it is '[Google Map As The Simplest Way](http://allenhwkim.tumblr.com/post/70986888283/google-map-as-the-simplest-way)'

To Get Started
--------------
For Bower users, 

  `$ bower install ngmap`

1. Include `ng-map.min.js`:
   `<script src="/bower_components/ngmap/build/scripts/ng-map.min.js"></script>`

2. Include Google maps:  
    `<script src="http://maps.google.com/maps/api/js"></script>`  

2. Name your angular app ngMap, or add it as a dependency

   `var myApp = angular.module('myApp', ['ngMap']);`

To get the map instance use the `NgMap.getMap()` function

    app.controller('MyController', function(NgMap) {
      NgMap.getMap().then(function(map) {
        console.log(map.getCenter());
        console.log('markers', map.markers);
        console.log('shapes', map.shapes);
      });
    });

Lazy Loading of Google Maps Javascript
---------------------------------------
  Simply wrap the map tag with `map-lazy-load="https://maps.google.com/maps/api/js"`.

    <div map-lazy-load="https://maps.google.com/maps/api/js">
      <ng-map center="41,-87" zoom="3"></ng-map>
    </div>

  If you need to pass in an API key to the javascript, you can set a scope
  variable in your controller (e.g. `$scope.googleMapsUrl="https://maps.googleapis.com/maps/api/js?key=YOUR_KEY_HERE";`).
  This can be set from a constant value in your app to standardise the API key to pass to google for multiple controllers.

    <div map-lazy-load="https://maps.google.com/maps/api/js"
      map-lazy-load-params="{{googleMapsUrl}}">
      <ng-map center="41,-87" zoom="3"></ng-map>
    </div>

Directives
----------

 * bicycling-layer
 * custom-control
 * custom-marker (NEW)
 * directions (NEW)
 * drawing-manager (NEW)
 * dynamic-maps-engine-layer
 * fusion-tables-layer
 * heatmap-layer
 * info-window
 * kml-layer
 * map
 * map-data
 * map-lazy-load (NEW)
 * map-type
 * map_controller
 * maps-engine-layer
 * marker
 * overlay-map-type
 * places-auto-complete
 * shape
 * street-view-panorama (NEW)
 * traffic-layer
 * transit-layer

Advanced Examples
-------------------
- [Marker Clusterer](https://rawgit.com/allenhwkim/angularjs-google-maps/master/testapp/marker-clusterer.html)
- [Starbucks World Wide](https://rawgit.com/allenhwkim/angularjs-google-maps/master/testapp/map_app.html)
- [Road Trip By StreetView](https://rawgit.com/allenhwkim/angularjs-google-maps/master/testapp/street-view_road_trip.html)
- [Maps Can Talk](https://rawgit.com/allenhwkim/angularjs-google-maps/master/testapp/custom-marker.html)
- [Custom Marker](https://rawgit.com/allenhwkim/angularjs-google-maps/master/testapp/custom-marker-2.html)

[Contributors](CONTRIBUTORS.md)
===============================

Contributing
============
- Clone the repository from github
- Change to the folder dowloaded
- **npm install** to install the build tools
- **gulp build** to build the javascript & doc files in the /build folder & run the unit tests.
- **gulp clean** to cleanup the repository by removing files and folders from previous build.
- **gulp test** to run the Karma unit test suite.
- **gulp test:e2e** to run the Protractor test suite. For the first test run, you may need to update the protractor webdriver manager. It will show the command on screen if this is required (node_modules/gulp-protractor/node_modules/protractor/bin/webdriver-manager update).
- **gulp test:server** will start a web server for the testapp on http://localhost:8888

license
=======

[MIT License](https://github.com/allenhwkim/angularjs-google-maps/blob/master/LICENSE)
