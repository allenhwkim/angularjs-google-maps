/**
 * @ngdoc directive
 * @name shape
 * @requires Attr2Options 
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
 *   Restrict To:  Element Or Attribute
 *
 * @param {Boolean} centered if set, map will be centered with this marker
 * @param {String} &lt;OPTIONS>
 *   For circle, [any circle options](https://developers.google.com/maps/documentation/javascript/reference#CircleOptions)  
 *   For polygon, [any polygon options](https://developers.google.com/maps/documentation/javascript/reference#PolygonOptions)  
 *   For polyline, [any polyline options](https://developers.google.com/maps/documentation/javascript/reference#PolylineOptions)   
 *   For rectangle, [any rectangle options](https://developers.google.com/maps/documentation/javascript/reference#RectangleOptions)   
 *   For image, [any groundOverlay options](https://developers.google.com/maps/documentation/javascript/reference#GroundOverlayOptions)   
 * @param {String} &lt;MapEvent> Any Shape events, https://developers.google.com/maps/documentation/javascript/reference
 * @example
 * Usage: 
 *   <map MAP_ATTRIBUTES>
 *    <shape name=SHAPE_NAME ANY_SHAPE_OPTIONS ANY_SHAPE_EVENTS"></MARKER>
 *   </map>
 *
 * Example: 
 *
 *   <map zoom="11" center="[40.74, -74.18]">
 *     <shape id="polyline" name="polyline" geodesic="true" stroke-color="#FF0000" stroke-opacity="1.0" stroke-weight="2"
 *      path="[[40.74,-74.18],[40.64,-74.10],[40.54,-74.05],[40.44,-74]]" ></shape>
 *    </map>
 *
 *   <map zoom="11" center="[40.74, -74.18]">
 *     <shape id="polygon" name="polygon" stroke-color="#FF0000" stroke-opacity="1.0" stroke-weight="2"
 *      paths="[[40.74,-74.18],[40.64,-74.18],[40.84,-74.08],[40.74,-74.18]]" ></shape>
 *   </map>
 *   
 *   <map zoom="11" center="[40.74, -74.18]">
 *     <shape id="rectangle" name="rectangle" stroke-color='#FF0000' stroke-opacity="0.8" stroke-weight="2"
 *      bounds="[[40.74,-74.18], [40.78,-74.14]]" editable="true" ></shape>
 *   </map>
 *
 *   <map zoom="11" center="[40.74, -74.18]">
 *     <shape id="circle" name="circle" stroke-color='#FF0000' stroke-opacity="0.8"stroke-weight="2" 
 *      center="[40.70,-74.14]" radius="4000" editable="true" ></shape>
 *   </map>
 *
 *   <map zoom="11" center="[40.74, -74.18]">
 *     <shape id="image" name="image" url="https://www.lib.utexas.edu/maps/historical/newark_nj_1922.jpg"
 *      bounds="[[40.71,-74.22],[40.77,-74.12]]" opacity="0.7" clickable="true" ></shape>
 *   </map>
 *
 *  For full-working example, please visit 
 *    [shape example](https://rawgit.com/allenhwkim/angularjs-google-maps/master/build/shape.html)
 */
ngMap.directives.shape = function(Attr2Options) {
  var parser = Attr2Options;
  
  var getBounds = function(points) {
    return new google.maps.LatLngBounds(points[0], points[1]);
  };
  
  var getShape = function(options, events) {
    var shape;

    var shapeName = options.name;
    delete options.name;  //remove name bcoz it's not for options

    /**
     * set options
     */
    console.log("shape", shapeName, "options", options);
    switch(shapeName) {
      case "circle":
        if (options.center instanceof google.maps.LatLng) {
          shape = new google.maps.Circle(options);
        } else {
          var orgCenter = options.center;
          options.center = new google.maps.LatLng(0,0);
          shape = new google.maps.Circle(options);
          parser.setDelayedGeoLocation(shape, 'setCenter', orgCenter);
        }
        break;
      case "polygon":
        shape = new google.maps.Polygon(options);
        break;
      case "polyline": 
        shape = new google.maps.Polyline(options);
        break;
      case "rectangle": 
        options.bounds = getBounds(options.bounds);
        shape = new google.maps.Rectangle(options);
        break;
      case "groundOverlay":
      case "image":
        var url = options.url;
        var bounds = getBounds(options.bounds);
        var opts = {opacity: options.opacity, clickable: options.clickable, id:options.id};
        shape = new google.maps.GroundOverlay(url, bounds, opts);
        break;
    }

    /**
     * set events
     */
    console.log("shape", shapeName, "events", events);
    for (var eventName in events) {
      if (events[eventName]) {
        console.log(eventName, events[eventName]);
        google.maps.event.addListener(shape, eventName, events[eventName]);
      }
    }
    return shape;
  };
  
  return {
    restrict: 'AE',
    require: '^map',
    /**
     * link function
     * @private
     */
    link: function(scope, element, attrs, mapController) {
      var filtered = parser.filter(attrs);
      var shapeOptions = parser.getOptions(filtered);
      var shapeEvents = parser.getEvents(scope, filtered);

      var shape = getShape(shapeOptions, shapeEvents);
      mapController.addShape(shape);

      var orgAttributes = {};
      for (var i=0; i<element[0].attributes.length; i++) {
        var attr = element[0].attributes[i];
        orgAttributes[attr.name] = attr.value;
      }

      /**
       * set observers
       */
      var attrsToObserve = parser.getAttrsToObserve(orgAttributes);
      console.log('shape attrs to observe', attrsToObserve);
      for (var i=0; i<attrsToObserve.length; i++) {
        parser.observeAndSet(attrs, attrsToObserve[i], shape);
      }
    }
   }; // return
}; // function
ngMap.directives.shape.$inject  = ['Attr2Options'];
