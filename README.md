GoogleMap AngularJS Directive
=============================

[![Build Status](https://travis-ci.org/allenhwkim/angularjs-google-maps.png?branch=master)](https://travis-ci.org/allenhwkim/angularjs-google-maps)

[![Marker Cluster](http://i.imgur.com/tVEUg88.png)](https://rawgithub.com/allenhwkim/angularjs-google-maps/master/build/index.html)

[Demo](https://rawgithub.com/allenhwkim/angularjs-google-maps/master/build/index.html) &nbsp; &nbsp;[Documentation](https://rawgithub.com/allenhwkim/angularjs-google-maps/master/build/docs/index.html)

There is already [one](https://github.com/nlaplante/angular-google-maps) for this. However, I found myself doing totally different approach for this purpose than the existing one, such as;

1. Everything in tag and attributes Therefore, basic users does not even have to know what Javascript is. Tag does it all.
2. Expose the original Google Maps V3 api By doing so, programmers don't need to learn this module.

There is a blog that introduces this module. The title of it is '[Google Map As The Simplest Way](http://allenhwkim.tumblr.com/post/70986888283/google-map-as-the-simplest-way)'

To Get Started
--------------

1. include ng-map.js or ng-map.min.js and ngMap module to be active.

<pre> &lt;script src="http://maps.google.com/maps/api/js?sensor=false">&lt;/script> &lt;script src="http://code.angularjs.org/1.2.5/angular.js">&lt;/script> &lt;script src="http://rawgit.com/allenhwkim/angularjs-google-maps/master/build/scripts/ng-map.min.js">&lt;/script> </pre>

1. name angular app as ngMap, or add it as a dependency

`<html ng-app="ngMap">` 2. use `map` tag, and optionally, `marker`, and `shape` tags

<pre>
&lt;map style="display:block;height:300px" />  
</pre>

Examples
--------

- [All Examples](https://rawgithub.com/allenhwkim/angularjs-google-maps/master/build/index.html)
- [Hello Map](https://rawgithub.com/allenhwkim/angularjs-google-maps/master/build/hello_map.html)
- [Markers](https://rawgithub.com/allenhwkim/angularjs-google-maps/master/build/marker.html)
- [Dynamic Markers](https://rawgithub.com/allenhwkim/angularjs-google-maps/master/build/dynamic_markers.html)
- [My Address](https://rawgithub.com/allenhwkim/angularjs-google-maps/master/build/marker_with_address.html)
- [Where am I?](https://rawgithub.com/allenhwkim/angularjs-google-maps/master/build/marker_with_current_position.html)
- [Controls](https://rawgithub.com/allenhwkim/angularjs-google-maps/master/build/map_control.html)
- [Map Options](https://rawgithub.com/allenhwkim/angularjs-google-maps/master/build/map_options.html)
- [Shapes(Rectangle, Triangle, Image)](https://rawgithub.com/allenhwkim/angularjs-google-maps/master/build/shape.html)
- [Events](https://rawgithub.com/allenhwkim/angularjs-google-maps/master/build/events.html)
- [Bird Eyes View/Street View](https://rawgithub.com/allenhwkim/angularjs-google-maps/master/build/bird_eyes_and_street_view.html)
- [Multiple Maps On A Page](https://rawgithub.com/allenhwkim/angularjs-google-maps/master/build/multiple_maps_on_a_page.html)
- [Street View](https://rawgithub.com/allenhwkim/angularjs-google-maps/master/build/street_view.html)
- [Marker Clusterer](https://rawgithub.com/allenhwkim/angularjs-google-maps/master/build/marker_clusterer.html)
- [Starbucks World Wide](https://rawgithub.com/allenhwkim/angularjs-google-maps/master/build/map_app.html)

To use it in your app, please include 'ngMap' as dependency.

`var myApp = angular.module('myApp', ['ngMap']);` `<html ng-app="myApp">`

You will also have these three scope variables after these directives are initialized.

- $scope.map
- $scope.markers as a hash
- $scope.shapes as a hash
- $scope.infoWindow as a hash
- $scope.markerCluster as a hash

In case your map directive scope is different from your controller scope, there are event emitted when each is initialized. There are three events emitted;

- `mapInitialized`
- `markersInitialized`
- `shpaesInitialized`
- `infoWindowInitialized`
- `markerClusterInitialized`

Example Usage:

```
app.controller('parentParentController', function($scope) {
  $scope.$on('mapInitialized', function(event, map) {
    map.setCenter( .... )
    ..
  });
});
```

Directives
----------

There are five directives defined with ng-map module. 1. map 2. marker 3. shape 4. info-window 5. marker-cluster

#### **map** Tag(Directive)

[As documented](https://developers.google.com/maps/documentation/javascript/reference#MapOptions), it requires minimum two options, center and zoom. You can specify all map options as attributes.

These are attributes of map tag which is EXACTLY the same as the documentation except the following for the convenience

<table>
<tr><th>Attributes<th>Description
<tr><td>center<td>address or latitude/longitude<br/>
                  i.e. center="[40.79,-54,18]", center="toronto, canada"
<tr><td>geoFallbackCenter<td>latitude/longitude<br/>
                   Coordinates to be loaded when no center is defined and retrieving current location fails<br/> 
                  i.e. geoFallbackCenter="[40.79,-54,18]"
<tr><td>EVENTS     <td> You can also specify any <a href="https://developers.google.com/maps/documentation/javascript/reference#Map">map events</a> as an attribute.  
   <br/> i.e. on-click="myfunc"
</table>

For usage of map controls, please refer to [this example](https://rawgithub.com/allenhwkim/angularjs-google-maps/master/build/map_control.html).

#### **marker** Tag(Directive)

[As documented](https://developers.google.com/maps/documentation/javascript/reference#Marker), it reqires `position` as an attribute. You can list any [maker options](https://developers.google.com/maps/documentation/javascript/reference#MarkerOptions) as attribute of marker tag

These are attributes of marker tag which ate EXACTLY the same as the documentation except the following for the convenienece.

<table>
<tr><th>Attribute<th>Description
  <tr><td> id <td> Used for programming purpose. i.e. $scope.markers.myId
  <tr><td> position   <td>
    'current', address, or latitude/longitude  <br/>
    i.e. 'current location', 'current position', 'Toronto, Canada', or [40.74, -74.18]
  <tr><td> EVENTS <td>
    You can also specify any <a href="https://developers.google.com/maps/documentation/javascript/reference#Marker">marker events</a>
    i.e. on-click="myfunc"
</table>

#### **shape** Tag(Directive)

shape tag always requires `name` attribute

- name (the name of shape) i.e. `polygon`, `image`, `polyline`, or `circle`.
- optionally, you can provide `id` for programming purpose. i.e. $scope.shapes.myCircle

All other attributes are based on the `name` you specified. To see the full list of options of a shape for attributes, please visit the documentation.

- [polygon](https://developers.google.com/maps/documentation/javascript/reference#PolygonOptions)
- [polyline](https://developers.google.com/maps/documentation/javascript/reference#PolylineOptions)
- [image](https://developers.google.com/maps/documentation/javascript/reference#GroundOverlayOptions)
- [circle](https://developers.google.com/maps/documentation/javascript/reference#CircleOptions)

license
=======

[MIT License](https://github.com/allenhwkim/angularjs-google-maps/blob/master/LICENSE)
