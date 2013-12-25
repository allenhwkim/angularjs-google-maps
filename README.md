GoogleMap AngularJS Directive
=============================

There is already [one](https://github.com/nlaplante/angular-google-maps) for this.
However, I found myself doing totally different approach for this purpose than the existing one, such as;
  
  1. Everything in tag and attributes  
     Therefore, basic users does not even have to what the controller is. Tag does it all.

  2. Expose the original Google Maps V3 api  
     By doing so, programmers don't need to learn this module.
  
To Get Started
---------------

 1. include ng-map.js or ng-map.min.js and ngMap module to be active.
    `<script src="https://rawgithub.com/allenhwkim/ng-map/master/dist/ng-map.min.js"></script>`

    `<html ng-app="ngMap">`

 2. use `map` tag, and optionally, `control`, `marker`, and `shape` tags  
 
    <pre>
    &lt;map style="display:block;height:300px" />  
    </pre>

Examples
--------

  * [Hello Map](https://rawgithub.com/allenhwkim/angularjs-google-maps/master/examples/hello_map.html)
  * [Markers](https://rawgithub.com/allenhwkim/angularjs-google-maps/master/examples/marker.html)
  * [My Address](https://rawgithub.com/allenhwkim/angularjs-google-maps/master/examples/marker_with_address.html)
  * [Where am I?](https://rawgithub.com/allenhwkim/angularjs-google-maps/master/examples/marker_with_current_position.html)
  * [Controls](https://rawgithub.com/allenhwkim/angularjs-google-maps/master/examples/map_control.html)
  * [Map Options](https://rawgithub.com/allenhwkim/angularjs-google-maps/master/examples/map_options.html)
  * [Shapes(Rectangle, Triangle, Image)](https://rawgithub.com/allenhwkim/angularjs-google-maps/master/examples/shape.html)
  * [Events](https://rawgithub.com/allenhwkim/angularjs-google-maps/master/examples/events.html)
  * [Bird Eyes View/Street View](https://rawgithub.com/allenhwkim/angularjs-google-maps/master/examples/bird_eyes_and_street_view.html)
  * [Multiple Maps On A Page](https://rawgithub.com/allenhwkim/angularjs-google-maps/master/examples/multiple_maps_on_a_page.html)

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

<table>
<tr><th>Attributes<th>Description                                     
<tr><td>backgroundColor <td>
<tr><td>center<td>address or latitude/langitude<br/>   
                  i.e. center="[40.79,-54,18]", center="toronto, canada"
<tr><td>disableDefaultUI <td>
<tr><td>disableDoubleClickZoom <td>
<tr><td>draggable           <td>
<tr><td>draggableCursor     <td>
<tr><td>draggingCursor      <td>
<tr><td>heading             <td>
<tr><td>keyboardShortcuts   <td>
<tr><td>mapMaker            <td>
<tr><td>mapTypeId  <td> i.e. mapTypeId="HYBRID"
<tr><td>maxZoom             <td>
<tr><td>minZoom             <td>
<tr><td>noClear             <td>
<tr><td>scrollwheel         <td>
<tr><td>streetView <td>i.e. streetView="StreetViewPanorama($("#pano")[0], {position:fenway, pov:{heading: 34, pitch: 10}})"
<tr><td>styles     <td>i.e. styles='{featureType: "poi"}'
<tr><td>zoom       <td>
<tr><td>EVENTS     <td> You can also specify any href="https://developers.google.com/maps/documentation/javascript/reference#Map">map events</a> as an attribute.  
   <br/> i.e. on-click="myfunc"
</table>


#### **marker** Tag(Directive) ####

[As documented](https://developers.google.com/maps/documentation/javascript/reference#Marker), it reqires `position` as an attribute.
You can list any [maker options](https://developers.google.com/maps/documentation/javascript/reference#MarkerOptions) as attribute of marker tag

These are attributes of marker tag

<table>
<tr><th>Attribute<th>Description
  <tr><td> anchorPoint <td>
  <tr><td> animation <td>
  <tr><td> clickable <td>
  <tr><td> crossOnDrag <td>
  <tr><td> cursor <td>
  <tr><td> draggable <td>
  <tr><td> flat <td>
  <tr><td> icon <td>
  <tr><td> optimized <td>
  <tr><td> position   <td>
    'current', address, or latitude/longitude  <br/>
    i.e. 'current location', 'current position', 'Toronto, Canada', or [40.74, -74.18]
  <tr><td> raiseOnDrag  <td>
  <tr><td> shadow <td>
  <tr><td> shape <td>
  <tr><td> title <td>
  <tr><td> visible <td>
  <tr><td> zIndex <td>
  <tr><td> EVENTS <td>
    You can also specify any [marker events](https://developers.google.com/maps/documentation/javascript/reference#Marker) as an attribute.  
    i.e. on-click="myfunc"
</table>

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

