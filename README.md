Google Maps AngularJS Directive
=============================
<!--
[![Build Status](https://travis-ci.org/allenhwkim/angularjs-google-maps.png?branch=master)](https://travis-ci.org/allenhwkim/angularjs-google-maps)
-->

[Demo](https://ngmap.github.io)  
[Documentation](https://rawgithub.com/allenhwkim/angularjs-google-maps/master/build/docs/index.html)  
[Road Trip By StreetView](https://rawgit.com/allenhwkim/angularjs-google-maps/master/testapp/street-view_road_trip.html)  
[Maps Can Talk](https://rawgit.com/allenhwkim/angularjs-google-maps/master/testapp/custom-marker.html) |
[Custom Marker](https://rawgit.com/allenhwkim/angularjs-google-maps/master/testapp/custom-marker-2.html)  

If you like this, you also may like these:
* [ng2-map](https://github.com/ng2-ui/map) Google Maps Wrapper for Angular 2+
* [react-openlayers](https://github.com/allenhwkim/react-openlayers) React + OpenLayers

Background
-----------------
There is already [one](https://github.com/nlaplante/angular-google-maps) for this. However, I found myself taking a totally different approach than the existing one, such as:

1. **Everything in tag and attributes.**   
   Thus, users don't even need knowledge of JavaScript.
   
2. **Expose all original Google Maps V3 API to the user.**   
   No hiding, no wrapping or whatsoever.
   By doing so, programmers don't need to learn how to use this module.
   You only need to know Google Maps V3 API.

There is a blog that introduces this module. The title of it is '[Google Map As The Simplest Way](http://allenhwkim.tumblr.com/post/70986888283/google-map-as-the-simplest-way)'

To get started
--------------
For Bower users,

  `$ bower install ngmap`

1. Include `ng-map.min.js`:
   `<script src="/bower_components/ngmap/build/scripts/ng-map.min.js"></script>`

2. Include Google Maps:  
    `<script src="http://maps.google.com/maps/api/js"></script>`  

2. Name your AngularJS app ngMap, or add it as a dependency

   `var myApp = angular.module('myApp', ['ngMap']);`

To get the map instance use the `NgMap.getMap()` function

    app.controller('MyController', function(NgMap) {
      NgMap.getMap().then(function(map) {
        console.log(map.getCenter());
        console.log('markers', map.markers);
        console.log('shapes', map.shapes);
      });
    });

For npm users,

  `$ npm install ngmap`

For Meteor users: https://atmospherejs.com/wormy/angularjs-google-maps

Lazy loading of Google Maps JavaScript
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

FAQ
----
## Grey area in Google Maps

The usual reason why this happens is that the size of the map is changed after the map has been initialized. If you for some reason change the size of the div, you need to trigger the "resize" event and possible recenter the map.

     var center = map.getCenter();
     google.maps.event.trigger(map, "resize");
     map.setCenter(center);

Ref.
  * http://stackoverflow.com/questions/13901520/grey-area-in-google-maps
  * http://blog.codebusters.pl/en/google-maps-in-hidden-div/

## Check if a marker is within `Map`, `Rectangle`, or `Circle`

    `map.getBounds().contains(marker.getPosition());`

  * http://stackoverflow.com/questions/3648545/how-can-i-check-the-marker-is-or-isnt-in-the-bounds-using-google-maps-v3
  * https://developers.google.com/maps/documentation/javascript/3.exp/reference#Map
  * https://developers.google.com/maps/documentation/javascript/3.exp/reference#Rectangle
  * https://developers.google.com/maps/documentation/javascript/3.exp/reference#Circle

## Calculate distance between two position

You can check this out: https://developers.google.com/maps/documentation/javascript/distancematrix.
As you see,  DistanceMatrix does not require map nor directive.

Another way to do this, is to use directions directive. As you see it here: https://rawgit.com/allenhwkim/angularjs-google-maps/master/testapp/directions2.html, you have access to DirectionsRenderer by using `map.directionsRenderers[id]`

https://developers.google.com/maps/documentation/javascript/reference?hl=en#DirectionsRenderer

You use `getDirections()` or `directions`, then calculate the distance from there. e.g.,

  Distance:
  `{{ map.directionsRenderers[0].directions.routes[0].legs[0].distance }}`

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

Advanced examples
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
- Clone the repository from GitHub.
- Change to the cloned directory.
- **npm install** to install the build tools
- **gulp build** to build the JavaScript & doc files in the /build folder & run the unit tests.
- **gulp clean** to clean up the repository by removing files and folders from previous build.
- **gulp test** to run the Karma unit test suite.
- **gulp test:e2e** to run the Protractor test suite. For the first test run, you may need to update the protractor webdriver manager. It will show the command on screen if this is required (node_modules/gulp-protractor/node_modules/protractor/bin/webdriver-manager update).
- **gulp test:server** will start a web server for the testapp on http://localhost:8888

License
=======

[MIT License](https://github.com/allenhwkim/angularjs-google-maps/blob/master/LICENSE)
