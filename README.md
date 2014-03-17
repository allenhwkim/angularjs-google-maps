GoogleMap AngularJS Directive
=============================

There is already [one](https://github.com/nlaplante/angular-google-maps) for this.
However, I found myself doing totally different approach for this purpose than the existing one, such as;
  
  1. Everything in tag and attributes  
     Therefore, basic users does not even have to know what Javascript is. Tag does it all.

  2. Expose the original Google Maps V3 api  
     By doing so, programmers don't need to learn this module.
  
There is a blog that introduces this module.   
The title of it is '[Google Map As The Simplest Way](http://allenhwkim.tumblr.com/post/70986888283/google-map-as-the-simplest-way)'

To Get Started
---------------

 1. include ng-map.js or ng-map.min.js and ngMap module to be active. 
    
  <pre>
  &lt;script src="http://maps.google.com/maps/api/js?sensor=false">&lt;/script>
  &lt;script src="http://code.angularjs.org/1.2.5/angular.js">&lt;/script>
  &lt;script src="http://rawgithub.com/allenhwkim/angularjs-google-maps/master/dist/ng-map.min.js">&lt;/script>
  </pre>


 2. name angular app as ngMap, or add it as a dependency   
 
    `<html ng-app="ngMap">`

 3. use `map` tag, and optionally, `marker`, and `shape` tags  
 
    <pre>
    &lt;map style="display:block;height:300px" />  
    </pre>

Examples
--------

  * [Hello Map](https://rawgithub.com/allenhwkim/angularjs-google-maps/master/examples/hello_map.html)
  * [Markers](https://rawgithub.com/allenhwkim/angularjs-google-maps/master/examples/marker.html)
  * [Dynamic Markers] (https://rawgithub.com/allenhwkim/angularjs-google-maps/master/examples/dynamic_markers.html)
  * [My Address](https://rawgithub.com/allenhwkim/angularjs-google-maps/master/examples/marker_with_address.html)
  * [Where am I?](https://rawgithub.com/allenhwkim/angularjs-google-maps/master/examples/marker_with_current_position.html)
  * [Controls](https://rawgithub.com/allenhwkim/angularjs-google-maps/master/examples/map_control.html)
  * [Map Options](https://rawgithub.com/allenhwkim/angularjs-google-maps/master/examples/map_options.html)
  * [Shapes(Rectangle, Triangle, Image)](https://rawgithub.com/allenhwkim/angularjs-google-maps/master/examples/shape.html)
  * [Events](https://rawgithub.com/allenhwkim/angularjs-google-maps/master/examples/events.html)
  * [Bird Eyes View/Street View](https://rawgithub.com/allenhwkim/angularjs-google-maps/master/examples/bird_eyes_and_street_view.html)
  * [Multiple Maps On A Page](https://rawgithub.com/allenhwkim/angularjs-google-maps/master/examples/multiple_maps_on_a_page.html)
  * [Index of Examples](https://rawgithub.com/allenhwkim/angularjs-google-maps/master/examples/index.html)

To use it in your app, please include 'ngMap' as dependency.

   `var myApp = angular.module('myApp', ['ngMap']); `
   `<html ng-app="myApp">`


You will also have these three scope variables after these directives are initialized.

    * $scope.map
    * $scope.markers as a hash
    * $scope.shapes as a hash

Directives
-----------
There are three directives defined with ng-map module.
  1. map
  2. marker
  3. shape

#### **map** Tag(Directive) ####


[As documented](https://developers.google.com/maps/documentation/javascript/reference#MapOptions),
it requires minimum two options, center and zoom. You can specify all map options as attributes.

These are attributes of map tag which is EXACTLY the same as the documentation.

<table>
<tr><th>Attributes<th>Description                                     
<tr><td>background-color <td> i.e. 'yellow', 'red'
<tr><td>center<td>address or latitude/langitude<br/>   
                  i.e. center="[40.79,-54,18]", center="toronto, canada"
<tr><td>disable-default-u-i <td> true or false
<tr><td>disable-double-click-zoom <td> true of false 
<tr><td>draggable           <td> true of false
<tr><td>draggable-cursor     <td> i.e. pointer
<tr><td>dragging-cursor      <td> i.e. hand
<tr><td>heading             <td> The heading for aerial imagery in degrees measured clockwise from cardinal direction North. Headings are snapped to the nearest available angle for which imagery is available.
<tr><td>keyboard-shortcuts   <td> true or false
<tr><td>map-maker            <td> true or false
<tr><td>map-type-id  <td> i.e. mapTypeId="HYBRID"
<tr><td>max-zoom             <td> number, i.e. 12, 13
<tr><td>min-zoom             <td> numer, i.e. 4, 5
<tr><td>no-clear             <td> true or false
<tr><td>scrollwheel         <td> true or false
<tr><td>street-view <td>i.e. streetView="StreetViewPanorama($("#pano")[0], {position:fenway, pov:{heading: 34, pitch: 10}})"
<tr><td>styles     <td>i.e. styles='{featureType: "poi"}'
<tr><td>zoom       <td> initial map zoom level, required. i.e. 12
<tr><td>EVENTS     <td> You can also specify any href="https://developers.google.com/maps/documentation/javascript/reference#Map">map events</a> as an attribute.  
   <br/> i.e. on-click="myfunc"
</table>

These are full list of controls that can be used as map attributes; 

  * [overviewMap](https://developers.google.com/maps/documentation/javascript/reference#OverviewMapControlOptions)
  * [pan](https://developers.google.com/maps/documentation/javascript/reference#PanControlOptions)
  * [rotate](https://developers.google.com/maps/documentation/javascript/reference#RotateControlOptions)
  * [scale](https://developers.google.com/maps/documentation/javascript/reference#ScaleControlOptions)
  * [streetView](https://developers.google.com/maps/documentation/javascript/reference#StreetViewControlOptions)
  * [zoom](https://developers.google.com/maps/documentation/javascript/reference#ZoomControlOptions)
  * [mapType](https://developers.google.com/maps/documentation/javascript/reference#MapTypeControlOptions)

For usage of map controls, please refer to [this example](https://rawgithub.com/allenhwkim/angularjs-google-maps/master/examples/map_control.html).


#### **marker** Tag(Directive) ####

[As documented](https://developers.google.com/maps/documentation/javascript/reference#Marker), it reqires `position` as an attribute.
You can list any [maker options](https://developers.google.com/maps/documentation/javascript/reference#MarkerOptions) as attribute of marker tag

These are attributes of marker tag which ate EXACTLY the same as the documentation.


<table>
<tr><th>Attribute<th>Description
  <tr><td> id <td> Used for programming purpose. i.e. $scope.markers.myId
  <tr><td> anchor-point <td> i.e. Point(x:number, y:number)
  <tr><td> animation <td> i.e. Animation.Bounce, Animation.Drop
  <tr><td> clickable <td> true or false
  <tr><td> cross-on-drag <td> true or false
  <tr><td> cursor <td> Mouse cursor to show on hover
  <tr><td> draggable <td> true or false
  <tr><td> flat <td> not to show shadow, true or false
  <tr><td> icon <td> icon for the foreground
  <tr><td> optimized <td> true or false, to show markers as canvas tag or not
  <tr><td> position   <td>
    'current', address, or latitude/longitude  <br/>
    i.e. 'current location', 'current position', 'Toronto, Canada', or [40.74, -74.18]
  <tr><td> raise-on-drag  <td> true or false
  <tr><td> shadow <td> shadow image
  <tr><td> shape <td> Image map region definition used for drag/click.
  <tr><td> title <td> hover text
  <tr><td> visible <td> true or false
  <tr><td> zIndex <td> number
  <tr><td> EVENTS <td>
    You can also specify any [marker events](https://developers.google.com/maps/documentation/javascript/reference#Marker) as an attribute.  
    i.e. on-click="myfunc"
</table>

#### **shape** Tag(Directive) ####

  shape tag always requires `name` attribute
  
  * name (the name of shape)  
    i.e. `polygon`, `image`, `polyline`, or `circle`.

  * optionally, you can provide `id` for programming purpose. i.e. $scope.shapes.myCircle


All other attributes are based on the `name` you specified.  
To see the full list of options of a shape for attributes, please visit the documentation.

  * [polygon](https://developers.google.com/maps/documentation/javascript/reference#PolygonOptions)
  * [polyline](https://developers.google.com/maps/documentation/javascript/reference#PolylineOptions)
  * [image](https://developers.google.com/maps/documentation/javascript/reference#GroundOverlayOptions)
  * [circle](https://developers.google.com/maps/documentation/javascript/reference#CircleOptions)


license
=======
[MIT License](https://github.com/allenhwkim/angularjs-google-maps/blob/master/LICENSE)

