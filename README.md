GoogleMap AngularJS Directive
=============================

To Get Started
---------------

 1. include ng-map.js or ng-map.min.js
    `<script src="https://rawgithub.com/allenhwkim/ng-map/master/dist/ng-map.min.js"></script>
 
 2. include 'ngMap' as dependency to your app.

     var app = angular.module('myApp', ['ngMap']); 

 3. use map directive
 
    <div ng-controller="MyCtrl" style="height:600px; height:400px">
       <map zoom="11" center="[40.74, -74.18]"></map>
    </div


Examples:

  * https://rawgithub.com/allenhwkim/ng-map/master/examples/hello_map.html
  * https://rawgithub.com/allenhwkim/ng-map/master/examples/marker.html
  * https://rawgithub.com/allenhwkim/ng-map/master/examples/map_control.html
  * https://rawgithub.com/allenhwkim/ng-map/master/examples/map_options.html
  * https://rawgithub.com/allenhwkim/ng-map/master/examples/shape.html
  * https://rawgithub.com/allenhwkim/ng-map/master/examples/events.html
