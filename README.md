GoogleMap AngularJS Directive
=============================

[![Build Status](https://travis-ci.org/allenhwkim/angularjs-google-maps.png?branch=master)](https://travis-ci.org/allenhwkim/angularjs-google-maps)

[![Marker Cluster](http://i.imgur.com/tVEUg88.png)](https://rawgithub.com/allenhwkim/angularjs-google-maps/master/build/index.html)

[Demo](https://rawgithub.com/allenhwkim/angularjs-google-maps/master/build/index.html) &nbsp; &nbsp;[Documentation](https://rawgithub.com/allenhwkim/angularjs-google-maps/master/build/docs/index.html)

There is already [one](https://github.com/nlaplante/angular-google-maps) for this. However, I found myself doing totally different approach for this purpose than the existing one, such as;

1. Everything in tag and attributes. Therefore, basic users does not even have to know what Javascript is. Tag and attribute does it all.
2. Expose all Original Google Maps V3 api to the user through this directive. No hiding, no wraping, or whatsoever. By doing so, programmers don't need to learn this module again for AngularJS Google Map. You only need to know Google Maps V3 API.

There is a blog that introduces this module. The title of it is '[Google Map As The Simplest Way](http://allenhwkim.tumblr.com/post/70986888283/google-map-as-the-simplest-way)'

To Get Started
--------------
For Bower users, 

  `$ bower install ngMap`

1. Include `ng-map.min.js` as well as google maps.  
    `<script src="http://maps.google.com/maps/api/js?sensor=false"></script>`  
    `<script src="http://rawgit.com/allenhwkim/angularjs-google-maps/master/build/scripts/ng-map.min.js"></script>`

2. name angular app as ngMap, or add it as a dependency

    `<html ng-app="ngMap">`

3. use `map` tag, and optionally, `marker`, and `shape` tags

    `<map style="display:block;height:300px" />`  

To use it in your app, please include 'ngMap' as dependency.

      <script>
      var myApp = angular.module('myApp', ['ngMap']);
      </script>
      <div ng-app="myApp">
      ...
      </div>

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

    app.controller('parentParentController', function($scope) {
      $scope.$on('mapInitialized', function(event, map) {
        map.setCenter( .... )
        ..
      });
    });

Advanced Examples
-------------------
- [All Examples](https://rawgithub.com/allenhwkim/angularjs-google-maps/master/build/index.html)
- [Marker Clusterer](https://rawgithub.com/allenhwkim/angularjs-google-maps/master/build/marker_clusterer.html)
- [Starbucks World Wide](https://rawgithub.com/allenhwkim/angularjs-google-maps/master/build/map_app.html)


Directives
----------

There are five directives defined with ng-map module. 1. map 2. marker 3. shape 4. info-window 5. marker-cluster

#### **map** Directive
It is used as a tag or an attribute.

These are attributes of map tag which is EXACTLY the same as the documentation except the following for the convenience

<table>
<tr><th>Attributes<th>Description
<tr><td>center<td>address or latitude/longitude<br/>
                  i.e. center="[40.79,-54,18]", center="toronto, canada"
<tr><td>geo-fallback-center<td>latitude/longitude<br/>
                  Coordinates to be loaded when no center is defined and retrieving current location fails  
                  i.e. geoFallbackCenter="[40.79,-54,18]"
<tr><td>ANY OPTIONS<td><a href=https://developers.google.com/maps/documentation/javascript/reference#MapOptions>As Documented</a><br/>
                   It requires minimum two options, center and zoom. You can specify all map options as attributes. <br/><pre>
  i.e.  zoom="11" center="[40.74, -74.18]"
        zoom-control="true"
        zoom-control-options='{style:"small",position:"bottom_left"}'
        map-type-control="true"
        overview-map-control="true"
        overview-map-control-options="{opened:true}"
        pan-control="true"
        pan-control-options='{position:"left_center"}'
        rotate-control="true"
        rotate-control-options='{position:"right_center"}'
        scale-control="true"
        scale-control-options='{position:"bottom_right", style:"default"}'
        street-view-control="true
        street-view-control-options='{position:"right_center"}'
  </pre>
<tr><td>EVENTS     <td> You can also specify any <a href="https://developers.google.com/maps/documentation/javascript/reference#Map">map events</a> as an attribute.  
   <br/> i.e. on-click="myfunc"
          on-click="getRadius()" 
</table>

For usage of map controls, please refer to [this example](https://rawgithub.com/allenhwkim/angularjs-google-maps/master/build/map_control.html).

Map Examples

- [Hello Map](https://rawgithub.com/allenhwkim/angularjs-google-maps/master/build/hello_map.html)
- [Map Options](https://rawgithub.com/allenhwkim/angularjs-google-maps/master/build/map_options.html)
- [Controls](https://rawgithub.com/allenhwkim/angularjs-google-maps/master/build/map_control.html)
- [Street View](https://rawgithub.com/allenhwkim/angularjs-google-maps/master/build/street_view.html)
- [Bird Eyes View/Street View](https://rawgithub.com/allenhwkim/angularjs-google-maps/master/build/bird_eyes_and_street_view.html)
- [Multiple Maps On A Page](https://rawgithub.com/allenhwkim/angularjs-google-maps/master/build/multiple_maps_on_a_page.html)
    
#### **marker** Directive
It is used as a tag or an attribute.

<table>
<tr><th>Attribute<th>Description
  <tr><td> id <td> Used for programming purpose. i.e. $scope.markers.myId
  <tr><td> position   <td>
    'current', address, or latitude/longitude  <br/>
    i.e. 'current location', 'current position', 'Toronto, Canada', or [40.74, -74.18]
  <tr><td>ANY OPTIONS<td>
    <a href=https://developers.google.com/maps/documentation/javascript/reference#Marker>As Documented</a> 
    It reqires `position` as an attribute. You can list <<a href=https://developers.google.com/maps/documentation/javascript/reference#MarkerOptions>marker options</a> as attribute of marker tag<br/>
<pre>
    i.e. position="[40.76, -74.16]"
        title="Hello Marker"
        animation="Animation.BOUNCE"
        draggable="true"
        visible="true"
        icon="beachflag.png"
</pre>
  <tr><td> EVENTS <td>
    You can also specify any <a href="https://developers.google.com/maps/documentation/javascript/reference#Marker">marker events</a>
    i.e. on-click="myfunc"
</table>

Marker Examples

- [Markers](https://rawgithub.com/allenhwkim/angularjs-google-maps/master/build/marker.html)
- [Dynamic Markers](https://rawgithub.com/allenhwkim/angularjs-google-maps/master/build/dynamic_markers.html)
- [My Address](https://rawgithub.com/allenhwkim/angularjs-google-maps/master/build/marker_with_address.html)
- [Where am I?](https://rawgithub.com/allenhwkim/angularjs-google-maps/master/build/marker_with_current_position.html)
- [Events](https://rawgithub.com/allenhwkim/angularjs-google-maps/master/build/events.html)

#### **shape** Directive
It is used as a tag or an attribute.

<table>
<tr><th>Attribute<th>Description
  <tr><td> name <td> Required, The name of the shape i.e `polygon`, `image`, `polyline`, or `circle`
  <tr><td> id   <td> Optinal, Used for programming purpose. i.e. $scope.shapes.myCircle
  <tr><td>ANY SHAPE OPTIONS<td>
    You can specify any options as attribute that are specified in documentation following;
    To see the full list of options of a shape for attributes, please visit the documentation. <br/>
    
     - <a href=https://developers.google.com/maps/documentation/javascript/reference#PolygonOptions>polygon</a><br/>
     - <a href=https://developers.google.com/maps/documentation/javascript/reference#PolylineOptions>polyline</a><br/>
     - <a href=https://developers.google.com/maps/documentation/javascript/reference#GroundOverlayOptions>image</a><br/>
     - <a href=https://developers.google.com/maps/documentation/javascript/reference#CircleOptions>circle</a><br/>

<pre>    i.e. position="[40.76, -74.16]"
        title="Hello Marker"
        animation="Animation.BOUNCE" 
        draggable="true"
        visible="true"
        icon="beachflag.png"
</pre>
  <tr><td>ANY SHAPE EVENTS <td>
    You can also specify any shape options with the prefix of `on-` <br/>
    - <a href=https://developers.google.com/maps/documentation/javascript/reference#Polygon>polygon events</a><br/>
    - <a href=https://developers.google.com/maps/documentation/javascript/reference#Polyline>polyline events</a><br/>
    - <a href=https://developers.google.com/maps/documentation/javascript/reference#GroundOverlay>image events</a><br/>
    - <a href=https://developers.google.com/maps/documentation/javascript/reference#Circle>circle events</a><br/>
</table>

Shape Examples

- [Shapes(Rectangle, Triangle, Image)](https://rawgithub.com/allenhwkim/angularjs-google-maps/master/build/shape.html)

#### **info-window** Directive
It is used as a tag or an attribute

<table>
<tr><th>Attribute<th>Description
  <tr><td>ANY OPTION<td> Optional, 
   <a href=https://developers.google.com/maps/documentation/javascript/reference?csw=1#InfoWindowOptions>Any InfoWindow options</a>
  <tr><td>ANY EVENT <td> Optional, 
   <a href=https://developers.google.com/maps/documentation/javascript/reference> Any InfoWindow events</a>
</table>

Example: 

    <map center="[40.74, -74.18]">
      <marker position="the cn tower" on-click="showInfoWindow(event, 'marker-info')"></marker>
      <info-window id="marker-info" style="display: none;">
        <h1> I am an InfoWindow </h1>
        I am here at [[this.getPosition()]]
      </info-window>
    </map>
 
For working example,   
please visit: https://rawgit.com/allenhwkim/angularjs-google-maps/master/build/marker_with_info_window.html

#### **marker-clusterer** Directive

<table>
<tr><th>Attribute<th>Description
  <tr><td>markers<td> Required, the initial markers for this marker clusterer  
    The properties of each marker must be exactly the same as options of marker directive.  
    The markers are also will be set to `$scope.markers`
  <tr><td>ANY OPTION<td> 
    <a href=http://google-maps-utility-library-v3.googlecode.com/svn/trunk/markerclustererplus/docs/reference.html#MarkerClustererOptions>Any MarkerClusterer options</a>
</table>

Example: 

    <map zoom="1" center="[43.6650000, -79.4103000]">
       <marker-clusterer markers="markersData" max-zoom="2">
    </marker-clusterer>

For full working example,  
please visit https://rawgit.com/allenhwkim/angularjs-google-maps/master/build/marker_clusterer.html

license
=======

[MIT License](https://github.com/allenhwkim/angularjs-google-maps/blob/master/LICENSE)
