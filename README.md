GoogleMap AngularJS Directive
=============================

To Get Started
---------------

 1. include ng-map.js or ng-map.min.js
    `<script src="https://rawgithub.com/allenhwkim/ng-map/master/dist/ng-map.min.js"></script>`

 2. use `map` tag, and optionally, `control`, `marker`, and `shape` tags  
 
    <pre>
    &lt;map zoom="11" center="[40.74, -74.18]">
      &lt;marker position="[40.74, -74.18]" />
      &lt;shape name="circle" radius="400" center="[40.74,-74.18]" radius="4000" />
      &lt;control name="overviewMap" opened="true" />
    &lt;/map>`  
    </pre>

Examples
--------

  * [Hello Map](https://rawgithub.com/allenhwkim/ng-map/master/examples/hello_map.html)
  * [Markers](https://rawgithub.com/allenhwkim/ng-map/master/examples/marker.html)
  * [Controls](https://rawgithub.com/allenhwkim/ng-map/master/examples/map_control.html)
  * [Map Options](https://rawgithub.com/allenhwkim/ng-map/master/examples/map_options.html)
  * [Shapes(Rectangle, Triangle, Image)](https://rawgithub.com/allenhwkim/ng-map/master/examples/shape.html)
  * [Events](https://rawgithub.com/allenhwkim/ng-map/master/examples/events.html)

To use it in your app, please include 'ngMap' as dependency to your app.

   `var myApp = angular.module('myApp', ['ngMap']); `

Directives
-----------
There are four directives defined with ng-map module.
  1. map
  2. marker
  3. shape
  4. control

#### **map** Tag(Directive) ####


[As documented](https://developers.google.com/maps/documentation/javascript/reference#MapOptions),
it requires minimum two options, center and zoom. You can specify all map options as attributes
except control-related ones. Those are seperately handled by control directives and will be safely ignored.

These are attributes of map tag

  * backgroundColor
  * center  
    i.e. center="[40.79,-54,18]"
  * disableDefaultUI
  * disableDoubleClickZoom
  * draggable
  * draggableCursor
  * draggingCursor
  * heading
  * keyboardShortcuts
  * mapMaker
  * mapTypeId  
    i.e. mapTypeId="HYBRID"
  * maxZoom
  * minZoom
  * noClear
  * scrollwheel
  * streetView  
    i.e. streetView="StreetViewPanorama($("#pano")[0], {position:fenway, pov:{heading: 34, pitch: 10}})"
  * styles  
    i.e. styles='{featureType: "poi"}'
  * zoom  
  * EVENTS  
    You can also specify any [map events](https://developers.google.com/maps/documentation/javascript/reference#Map) as an attribute.  
    i.e. on-click="myfunc"


#### **marker** Tag(Directive) ####

[As documented](https://developers.google.com/maps/documentation/javascript/reference#Marker), it reqires `position` as an attribute.
You can list any [maker options](https://developers.google.com/maps/documentation/javascript/reference#MarkerOptions) as attribute of marker tag

These are attributes of marker tag

  * anchorPoint
  * animation
  * clickable
  * crossOnDrag
  * cursor
  * draggable
  * flat
  * icon
  * optimized
  * position
  * raiseOnDrag
  * shadow
  * shape
  * title
  * visible
  * zIndex
  * EVENTS   
    You can also specify any [marker events](https://developers.google.com/maps/documentation/javascript/reference#Marker) as an attribute.  
    i.e. on-click="myfunc"

#### **shape** Tag(Directive) ####

  shape tag always requires `name` attribute
  
  * name (the name of shape)  
    i.e. `polygon`, `image`, `polyline`, or `circle`.

All other attributes are based on the `name` you specified.  
To see the full list of options of a shape for attributes, please visit the documentation.

  * [polygon](https://developers.google.com/maps/documentation/javascript/reference#PolygonOptions)
  * [polyline](https://developers.google.com/maps/documentation/javascript/reference#PolylineOptions)
  * [image](https://developers.google.com/maps/documentation/javascript/reference#GroundOverlayOptions)
  * [circle](https://developers.google.com/maps/documentation/javascript/reference#CircleOptions)

#### **control** Tag(Directive) ####

  control tag always requires `name` attribute and optionally `enabled`.
  All other attributes are based on the `name` you specified.

  `<control name="maptype" attributes>`

  * name (the name of the control)  
    i.e. `mapType`, `overviewMap`, `pan`, `rotate`, `scale`, `streetView`, or `zoom`
  * enabled (default true)

To see the full list of options to be used as attributes, please visit;

  * [overviewMap](https://developers.google.com/maps/documentation/javascript/reference#OverviewMapControlOptions)
  * [pan](https://developers.google.com/maps/documentation/javascript/reference#PanControlOptions)
  * [rotate](https://developers.google.com/maps/documentation/javascript/reference#RotateControlOptions)
  * [scale](https://developers.google.com/maps/documentation/javascript/reference#ScaleControlOptions)
  * [streetView](https://developers.google.com/maps/documentation/javascript/reference#StreetViewControlOptions)
  * [zoom](https://developers.google.com/maps/documentation/javascript/reference#ZoomControlOptions)
  * [mapType](https://developers.google.com/maps/documentation/javascript/reference#MapTypeControlOptions)

