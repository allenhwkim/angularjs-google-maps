GoogleMap AngularJS Directive
=============================

[![Build Status](https://travis-ci.org/allenhwkim/angularjs-google-maps.png?branch=master)](https://travis-ci.org/allenhwkim/angularjs-google-maps)

[Demo](http://ngmap.github.io)  
[Documentation](https://rawgithub.com/allenhwkim/angularjs-google-maps/master/build/docs/index.html)  
**[Road Trip By StreetView](https://rawgit.com/allenhwkim/angularjs-google-maps/master/testapp/street-view_road_trip.html)**   

There is already [one](https://github.com/nlaplante/angular-google-maps) for this. However, I found myself doing totally different approach for this purpose than the existing one, such as;

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

1. Include `ng-map.min.js` as well as google maps.  
    `<script src="http://maps.google.com/maps/api/js"></script>`  
    `<script src="http://rawgit.com/allenhwkim/angularjs-google-maps/master/build/scripts/ng-map.min.js"></script>`

2. name angular app as ngMap, or add it as a dependency

   `var myApp = angular.module('myApp', ['ngMap']);`

After map is initialized, you will have one event and map instances

Event:

  * `mapInitialized` with parameter with map

    In case your map directive scope is different from your controller scope,
    use this event to get the map instance.

    <pre>
      app.controller('parentParentController', function($scope) {
        $scope.$on('mapInitialized', function(event, map) {
          map.setCenter( .... )
          ..
        });
      });
    </pre>
      
Instances:

  * `$scope.map`
  * `$scope.map.markers`
  * `$scope.map.shapes`
  * etc

Lazy Loading
------------
  Simply wrap the map tag with `map-lazy-load="http://maps.google.com/maps/api/js"`.

    <div map-lazy-load="http://maps.google.com/maps/api/js">
      <map center="41,-87" zoom="3"></map>
    </div>

Release Notes
---------------

**1.7.0**

  * added **directions** directive
    [Example](https://rawgit.com/allenhwkim/angularjs-google-maps/master/testapp/directions.html)
  * added **places-auto-complete** for input tag.
    [Example](https://rawgit.com/allenhwkim/angularjs-google-maps/master/testapp/places-auto-complete.html)

**1.6.0**  

  * added **street-view-panorama** directive with its examples;
    [street view with marker](https://rawgit.com/allenhwkim/angularjs-google-maps/master/testapp/street-view-panorama.html) and
    [street view in its own container](https://rawgit.com/allenhwkim/angularjs-google-maps/master/testapp/street-view-panorama_container.html)

**1.5.0**

  * added **geo-callback attribute** for map, marker, shape, and info-window. 
    [Example](https://rawgit.com/allenhwkim/angularjs-google-maps/master/testapp/map_with_current_position.html)

**1.4.0**

  * support lazy loading of maps js with directive, **map-lazy-load**, which does not require to `https://maps.google.com/maps/api/js`
    [Example](https://rawgit.com/allenhwkim/angularjs-google-maps/master/testapp/map-lazy-load.html)

**1.3.0**

  * added **drawing-manager** directive. Thanks to Fangming Du
    [Example](https://rawgit.com/allenhwkim/angularjs-google-maps/master/testapp/drawing-manager.html)
 
**1.2.0**

  * events with `controller as` syntax, thanks to Simon
 
**1.1.0**

  * marker directive can have icon attribute as JSON
  * map with init-event attribute for initialization by an event
  
**1.0.0 (covers all official google examples using directives).**  

  * marker
  * shapes
     
    * circle
    * polyline
    * polygon
    * rectangle
    * image 

  * layers

    * traffic-layer 
    * transit-layer
    * bicycling-layer
    * dynamic-maps-engine-layer
    * fusion-tables-layer
    * heatmap-layer
    * kml-layer
    * maps-engine-layer

  * custom-control
  * info-window
  * map-data
  * map-type
  * overlay-map-type

Directives
----------

#### &lt;map .. > 

  As defined on [MapOptions](https://developers.google.com/maps/documentation/javascript/reference#MapOptions), you can add any attributes, and events starting witn `on-`. Please note that event value must be a function.

  Example: 

    <map zoom="11" 
      center="[40.74, -74.18]" 
      disable-default-u-i="true"
      disable-double-click-zoom="true"
      draggable="false"
      draggable-cursor="help"
      dragging-cursor="move"
      keyboard-shortcuts="false"
      max-zoom="12"
      min-zoom="8"
      tilt="45"
      map-type-id="TERRAIN">
    </map>
  i.e. < zoom="11" center="[40.74, -74.18]"

#### &lt;marker .. > 

  As defined on [MarkerOptions](https://developers.google.com/maps/documentation/javascript/reference#MarkerOptions), you can add any attributes, and events starting witn `on-`.

    <map center="[40.74, -74.18]">
      <marker
          position="[40.76, -74.16]"
          title="Hello Marker"
          animation="Animation.BOUNCE"
          draggable="true"
          visible="true"
          icon="beachflag.png"></marker>
    </map>

#### &lt;shape .. >
  Polyline, Circle, Polygon, Rectangle, and Images

     <map zoom="11" center="[40.74, -74.18]">
        <shape id="polyline" name="polyline" 
          geodesic="true" stroke-color="#FF0000" stroke-opacity="1.0" stroke-weight="2"
          path="[[40.74,-74.18],[40.64,-74.10],[40.54,-74.05],[40.44,-74]]" ></shape>
        <shape id="polygon" name="polygon" 
          stroke-color="#FF0000" stroke-opacity="1.0" stroke-weight="2"
          paths="[[40.74,-74.18],[40.64,-74.18],[40.84,-74.08],[40.74,-74.18]]" ></shape>
        <shape id="rectangle" name="rectangle" stroke-color='#FF0000' 
          stroke-opacity="0.8" stroke-weight="2"
          bounds="[[40.74,-74.18], [40.78,-74.14]]" editable="true" ></shape>
        <shape id="circle" name="circle" stroke-color='#FF0000'
          stroke-opacity="0.8"stroke-weight="2" 
          center="[40.70,-74.14]" radius="4000" editable="true" ></shape>
        <shape id="image" name="image" 
          url="https://www.lib.utexas.edu/maps/historical/newark_nj_1922.jpg"
          bounds="[[40.71,-74.22],[40.77,-74.12]]" opacity="0.7" clickable="true" ></shape>
     </map>

#### &lt;info-window .. >
Example:

    <map center="-25.363882,131.044922" zoom="4">
      <info-window id="bar" position="-25.363882,131.044922" visible="true">
        <div ng-non-bindable>
          <div id="siteNotice"></div>
        </div>
      </info-window>
    </map>

#### &lt;custom-control .. > 
Example:

      <map center="41.850033, -87.6500523" zoom="6">
        <custom-control id="home" position="TOP_RIGHT" index="1" on-click="click()">
          <div style="background-color: black; color:#fff;cursor:pointer">Home1</div>
        </custom-control>
      </map>

#### &lt;map-data .. > 
Example:

      <map zoom="4" center="-28, 137.883">
        <map-data 
          load-geo-json="https://storage.googleapis.com/maps-devrel/google.json"></map-data>
      </map>

### Layer Directives 

#### &lt;bicycling-layer .. > 

      <map zoom="14" center="42.3726399, -71.1096528">
        <bicycling-layer></bicycling-layer>
      </map>

#### &lt;weather-layer .. > (deprecated) and &lt;cloud-layer .. > (deprecated)

      <map zoom="6" center="49.265984,-123.127491">
        <weather-layer temperature-units="FAHRENHEIT"></weather-layer>
        <cloud-layer></cloud-layer>
      </map>

#### &lt;fusion-tables-layer .. > 

      <map zoom="11" center="41.850033, -87.6500523">
        <fusion-tables-layer query="{
          select: 'Geocodable address',
          from: '1mZ53Z70NsChnBMm-qEYmSDOvLXgrreLTkQUvvg'}">
        </fusion-tables-layer>
      </map>

#### &lt;heatmap-layer .. > 

      <map zoom="13" center="37.774546, -122.433523" map-type-id="SATELLITE">
        <heatmap-layer id="foo" data="taxiData"></heatmap>
      </map>

#### &lt;maps-engine-layer .. > 

      <map center="59.322506, 18.010025" zoom="14">
        <maps-engine-layer
          layer-id="06673056454046135537-08896501997766553811">
        </maps-engine-layer>
      </map>

#### &lt;traffic-layer> 

      <map zoom="13" center="34.04924594193164, -118.24104309082031">
        <traffic-layer></traffic-layer>
      </map>

#### &lt;transit-layer> 

      <map zoom="13" center="51.501904,-0.115871">
        <transit-layer></transit-layer>
      </map>

#### &lt;dynamic-maps-engine-layer .. > 

      <map center="59.322506, 18.010025" zoom="14">
        <dynamic-maps-engine-layer
          suppress-info-windows="true"
          clickable="true"
          on-mouseover="onMouseover()"
          on-mouseout="onMouseout()"
          layer-id="06673056454046135537-08896501997766553811">
        </dynamic-maps-engine-layer>
      </map>

#### &lt;kml-layer .. > 

      <map zoom="11" center="41.875696,-87.624207">
        <kml-layer url="http://gmaps-samples.googlecode.com/svn/trunk/ggeoxml/cta.kml"></kml-layer>
      </map>

### MapType Directives 

#### &lt;map-type .. >

      <map zoom="10" center="41.850033,-87.6500523"
        <map-type name="coordinate" object="CoordMapType">
        </map-type>
      </map>

#### &lt;overlay-map-type .. >

      <map zoom="10" center="41.850033,-87.6500523">
        <overlay-map-type object="CoordMapType" index="0">
        </overlay-map-type>
      </map>

Advanced Examples
-------------------
- [Marker Clusterer](https://rawgit.com/allenhwkim/angularjs-google-maps/master/testapp/marker-clusterer.html)
- [Starbucks World Wide](https://rawgit.com/allenhwkim/angularjs-google-maps/master/testapp/map_app.html)

Contributors
==============

    285  Allen Kim
     13  Hamza Azeem
      4  Fangming Du
      3  Antonio Salumbides
      2  Alexandre Kilian
      2  Prem Prakash
      2  Romain Maneschi
      2  jpagand
      1  martinmicunda
      1  Simon Hampton
      1  Will
      1  Ishaan Puniani
      1  Michael Liu
      1  unknown

license
=======

[MIT License](https://github.com/allenhwkim/angularjs-google-maps/blob/master/LICENSE)
