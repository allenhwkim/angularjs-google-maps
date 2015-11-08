/**
 * @ngdoc directive
 * @name shape
 * @param Attr2MapOptions {service} convert html attribute to Gogole map api options
 * @description
 *   Initialize a Google map shape in map with given options and register events
 *   The shapes are:
 *     . circle
 *     . polygon
 *     . polyline
 *     . rectangle
 *     . groundOverlay(or image)
 *
 *   Requires:  map directive
 *
 *   Restrict To:  Element
 *
 * @attr {Boolean} centered if set, map will be centered with this marker
 * @attr {Expression} geo-callback if shape is a circle and the center is
 *   an address, the expression is will be performed when geo-lookup
 *   is successful. e.g., geo-callback="showDetail()"
 * @attr {String} &lt;OPTIONS>
 *   For circle, [any circle options](https://developers.google.com/maps/documentation/javascript/reference#CircleOptions)
 *   For polygon, [any polygon options](https://developers.google.com/maps/documentation/javascript/reference#PolygonOptions)
 *   For polyline, [any polyline options](https://developers.google.com/maps/documentation/javascript/reference#PolylineOptions)
 *   For rectangle, [any rectangle options](https://developers.google.com/maps/documentation/javascript/reference#RectangleOptions)
 *   For image, [any groundOverlay options](https://developers.google.com/maps/documentation/javascript/reference#GroundOverlayOptions)
 * @attr {String} &lt;MapEvent> [Any Shape events](https://developers.google.com/maps/documentation/javascript/reference)
 * @example
 * Usage:
 *   <map MAP_ATTRIBUTES>
 *    <shape name=SHAPE_NAME ANY_SHAPE_OPTIONS ANY_SHAPE_EVENTS"></MARKER>
 *   </map>
 *
 * Example:
 *
 *   <map zoom="11" center="[40.74, -74.18]">
 *     <shape id="polyline" name="polyline" geodesic="true"
 *       stroke-color="#FF0000" stroke-opacity="1.0" stroke-weight="2"
 *       path="[[40.74,-74.18],[40.64,-74.10],[40.54,-74.05],[40.44,-74]]" >
 *     </shape>
 *   </map>
 *
 *   <map zoom="11" center="[40.74, -74.18]">
 *     <shape id="polygon" name="polygon" stroke-color="#FF0000"
 *       stroke-opacity="1.0" stroke-weight="2"
 *       paths="[[40.74,-74.18],[40.64,-74.18],[40.84,-74.08],[40.74,-74.18]]" >
 *     </shape>
 *   </map>
 *
 *   <map zoom="11" center="[40.74, -74.18]">
 *     <shape id="rectangle" name="rectangle" stroke-color='#FF0000'
 *       stroke-opacity="0.8" stroke-weight="2"
 *       bounds="[[40.74,-74.18], [40.78,-74.14]]" editable="true" >
 *     </shape>
 *   </map>
 *
 *   <map zoom="11" center="[40.74, -74.18]">
 *     <shape id="circle" name="circle" stroke-color='#FF0000'
 *       stroke-opacity="0.8"stroke-weight="2"
 *       center="[40.70,-74.14]" radius="4000" editable="true" >
 *     </shape>
 *   </map>
 *
 *   <map zoom="11" center="[40.74, -74.18]">
 *     <shape id="image" name="image"
 *       url="https://www.lib.utexas.edu/maps/historical/newark_nj_1922.jpg"
 *       bounds="[[40.71,-74.22],[40.77,-74.12]]" opacity="0.7"
 *       clickable="true">
 *     </shape>
 *   </map>
 *
 *  For full-working example, please visit
 *    [shape example](https://rawgit.com/allenhwkim/angularjs-google-maps/master/build/shape.html)
 */
/* global google */
(function() {
  'use strict';

  var getShape = function(options, events) {
    var shape;

    var shapeName = options.name;
    delete options.name;  //remove name bcoz it's not for options
    console.log("shape", shapeName, "options", options, 'events', events);

    /**
     * set options
     */
    switch(shapeName) {
      case "circle":
        if (!(options.center instanceof google.maps.LatLng)) {
          options.center = new google.maps.LatLng(0,0);
        } 
        shape = new google.maps.Circle(options);
        break;
      case "polygon":
        shape = new google.maps.Polygon(options);
        break;
      case "polyline":
        shape = new google.maps.Polyline(options);
        break;
      case "rectangle":
        shape = new google.maps.Rectangle(options);
        break;
      case "groundOverlay":
      case "image":
        var url = options.url;
        var opts = {opacity: options.opacity, clickable: options.clickable, id:options.id};
        shape = new google.maps.GroundOverlay(url, options.bounds, opts);
        break;
    }

    /**
     * set events
     */
    for (var eventName in events) {
      if (events[eventName]) {
        google.maps.event.addListener(shape, eventName, events[eventName]);
      }
    }
    return shape;
  };

  var shape = function(Attr2MapOptions, $parse, NgMap) {
    var parser = Attr2MapOptions;

    var linkFunc = function(scope, element, attrs, mapController) {
      mapController = mapController[0]||mapController[1];

      var orgAttrs = parser.orgAttributes(element);
      var filtered = parser.filter(attrs);
      var shapeOptions = parser.getOptions(filtered);
      var shapeEvents = parser.getEvents(scope, filtered);

      var address, shapeType;
      shapeType = shapeOptions.name;
      if (!(shapeOptions.center instanceof google.maps.LatLng)) {
        address = shapeOptions.center;
      }
      var shape = getShape(shapeOptions, shapeEvents);
      mapController.addObject('shapes', shape);

      if (address && shapeType == 'circle') {
        NgMap.getGeoLocation(address).then(function(latlng) {
          shape.setCenter(latlng);
          shape.centered && shape.map.setCenter(latlng);
          var geoCallback = attrs.geoCallback;
          geoCallback && $parse(geoCallback)(scope);
        });
      }

      //set observers
      mapController.observeAttrSetObj(orgAttrs, attrs, shape);
      element.bind('$destroy', function() {
        mapController.deleteObject('shapes', shape);
      });
    };

    return {
      restrict: 'E',
      require: ['?^map','?^ngMap'],
      link: linkFunc
     }; // return
  };
  shape.$inject = ['Attr2MapOptions', '$parse', 'NgMap'];

  angular.module('ngMap').directive('shape', shape);

})();
