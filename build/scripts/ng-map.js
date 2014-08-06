/** @module ngMap */
var ngMap = {
  services: {},
  directives: {}
};

/**
 * @ngdoc service
 * @name Attr2Options
 * @description 
 *   Converts tag attributes to options used by google api v3 objects, map, marker, polygon, circle, etc.
 */
ngMap.services.Attr2Options = function() { 
  return {
    /**
     * filters attributes by skipping angularjs methods $.. $$..
     * @memberof Attr2Options
     * @param {Hash} attrs tag attributes
     * @returns {Hash} filterd attributes
     */
    filter: function(attrs) {
      var options = {};
      for(var key in attrs) {
        if (!key.match(/^\$/)) {
          options[key] = attrs[key];
        }
      }
      return options;
    },

    /**
     * converts attributes hash to Google Maps API v3 options  
     * ```
     *  . converts numbers to number   
     *  . converts class-like string to google maps instance   
     *    i.e. `LatLng(1,1)` to `new google.maps.LatLng(1,1)`  
     *  . converts constant-like string to google maps constant    
     *    i.e. `MapTypeId.HYBRID` to `google.maps.MapTypeId.HYBRID`   
     *    i.e. `HYBRID"` to `google.maps.MapTypeId.HYBRID`  
     * ```
     * @memberof Attr2Options
     * @param {Hash} attrs tag attributes
     * @param {scope} scope angularjs scope
     * @returns {Hash} options converted attributess
     */
    getOptions: function(attrs, scope) {
      var options = {};
      for(var key in attrs) {
        if (attrs[key]) {
          if (key.match(/^on[A-Z]/)) { //skip events, i.e. on-click
            continue;
          } else if (key.match(/ControlOptions$/)) { // skip controlOptions
            continue;
          }

          var val = attrs[key];
          try { // 1. Number?
            var num = Number(val);
            if (isNaN(num)) {
              throw "Not a number";
            } else  {
              options[key] = num;
            }
          } catch(err) { 
            try { // 2.JSON?
              options[key] = JSON.parse(val);
            } catch(err2) {
              // 3. Object Expression. i.e. LatLng(80,-49)
              if (val.match(/^[A-Z][a-zA-Z0-9]+\(.*\)$/)) {
                try {
                  var exp = "new google.maps."+val;
                  options[key] = eval(exp); // TODO, still eval
                } catch(e) {
                  options[key] = val;
                } 
              // 4. Object Expression. i.e. MayTypeId.HYBRID 
              } else if (val.match(/^[A-Z][a-zA-Z0-9]+\.[A-Z]+$/)) {
                try {
                  options[key] = scope.$eval("google.maps."+val);
                } catch(e) {
                  options[key] = val;
                } 
              // 5. Object Expression. i.e. HYBRID 
              } else if (val.match(/^[A-Z]+$/)) {
                try {
                  var capitializedKey = key.charAt(0).toUpperCase() + key.slice(1);
                  options[key] = scope.$eval("google.maps."+capitializedKey+"."+val);
                } catch(e) {
                  options[key] = val;
                } 
              } else {
                options[key] = val;
              }
            } // catch(err2)
          } // catch(err)
        } // if (attrs[key])
      } //for(var key in attrs)
      return options;
    },

    /**
     * converts attributes hash to scope-specific event function 
     * @memberof Attr2Options
     * @param {scope} scope angularjs scope
     * @param {Hash} attrs tag attributes
     * @returns {Hash} events converted events
     */
    getEvents: function(scope, attrs) {
      var events = {};
      var toLowercaseFunc = function($1){
        return "_"+$1.toLowerCase();
      };
      var eventFunc = function(attrValue) {
        var matches = attrValue.match(/([^\(]+)\(([^\)]*)\)/);
        var funcName = matches[1];
        var argsStr = matches[2].replace(/event[ ,]*/,'');  //remove string 'event'
        
        var args = scope.$eval("["+argsStr+"]");
        return function(event) {
          scope[funcName].apply(this, [event].concat(args));
        }
      }

      for(var key in attrs) {
        if (attrs[key]) {
          if (!key.match(/^on[A-Z]/)) { //skip if not events
            continue;
          }
          
          //get event name as underscored. i.e. zoom_changed
          var eventName = key.replace(/^on/,'');
          eventName = eventName.charAt(0).toLowerCase() + eventName.slice(1);
          eventName = eventName.replace(/([A-Z])/g, toLowercaseFunc);

          var attrValue = attrs[key];
          events[eventName] = new eventFunc(attrValue);
        }
      }
      return events;
    },

    /**
     * control means map controls, i.e streetview, pan, etc, not a general control
     * @memberof Attr2Options
     * @param {Hash} filtered filtered tag attributes
     * @returns {Hash} Google Map options
     */
    getControlOptions: function(filtered) {
      var controlOptions = {};
      if (typeof filtered != 'object')
        return false;

      for (var attr in filtered) {
        if (filtered[attr]) {
          if (!attr.match(/(.*)ControlOptions$/)) { 
            continue; // if not controlOptions, skip it
          }

          //change invalid json to valid one, i.e. {foo:1} to {"foo": 1}
          var orgValue = filtered[attr];
          var newValue = orgValue.replace(/'/g, '"');
          newValue = newValue.replace(/([^"]+)|("[^"]+")/g, function($0, $1, $2) {
            if ($1) {
              return $1.replace(/([a-zA-Z0-9]+?):/g, '"$1":');
            } else {
              return $2; 
            } 
          });
          try {
            var options = JSON.parse(newValue);
            for (var key in options) { //assign the right values
              if (options[key]) {
                var value = options[key];
                if (typeof value === 'string') {
                  value = value.toUpperCase();
                } else if (key === "mapTypeIds") {
                  value = value.map( function(str) {
                    return google.maps.MapTypeId[str.toUpperCase()];
                  });
                } 
                
                if (key === "style") {
                  var str = attr.charAt(0).toUpperCase() + attr.slice(1);
                  var objName = str.replace(/Options$/,'')+"Style";
                  options[key] = google.maps[objName][value];
                } else if (key === "position") {
                  options[key] = google.maps.ControlPosition[value];
                } else {
                  options[key] = value;
                }
              }
            }
            controlOptions[attr] = options;
          } catch (e) {
            console.error('invald option for', attr, newValue, e, e.stack);
          }
        }
      } // for

      return controlOptions;
    } // function
  }; // return
}; // function


/**
 * @ngdoc service
 * @name GeoCoder
 * @description
 *   Provides [defered/promise API](https://docs.angularjs.org/api/ng/service/$q) service for Google Geocoder service
 */
ngMap.services.GeoCoder = function($q) {
  return {
    /**
     * @memberof GeoCoder
     * @param {Hash} options https://developers.google.com/maps/documentation/geocoding/#geocoding
     * @example
     * ```
     *   GeoCoder.geocode({address: 'the cn tower'}).then(function(result) {
     *     //... do something with result
     *   });
     * ```
     * @returns {HttpPromise} Future object
     */
    geocode : function(options) {
      var deferred = $q.defer();
      var geocoder = new google.maps.Geocoder();
      geocoder.geocode(options, function (results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
          deferred.resolve(results);
        } else {
          deferred.reject('Geocoder failed due to: '+ status);
        }
      });
      return deferred.promise;
    }
  }
};
ngMap.services.GeoCoder.$inject = ['$q'];


/**
 * @ngdoc service
 * @name NavigatorGeolocation
 * @description
 *  Provides [defered/promise API](https://docs.angularjs.org/api/ng/service/$q) service for navigator.geolocation methods
 */
ngMap.services.NavigatorGeolocation =  function($q) {
  return {
    /**
     * @memberof NavigatorGeolocation
     * @param {function} success success callback function
     * @param {function} failure failure callback function
     * @example
     * ```
     *  NavigatorGeolocation.getCurrentPosition()
     *    .then(function(position) {
     *      var lat = position.coords.latitude, lng = position.coords.longitude;
     *      .. do something lat and lng
     *    });
     * ```
     * @returns {HttpPromise} Future object
     */
    getCurrentPosition: function() {
      var deferred = $q.defer();
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          function(position) {
            deferred.resolve(position);
          }, function(evt) {
            console.error(evt);
            deferred.reject(evt);
          }
        );
      } else {
        deferred.reject("Browser Geolocation service failed.");
      }
      return deferred.promise;
    },

    watchPosition: function() {
      return "TODO";
    },

    clearWatch: function() {
      return "TODO";
    }
  };
} // func
ngMap.services.NavigatorGeolocation.$inject = ['$q'];


/**
 * @ngdoc service
 * @name StreetView
 * @description
 *  Provides [defered/promise API](https://docs.angularjs.org/api/ng/service/$q) service 
 *  for [Google StreetViewService](https://developers.google.com/maps/documentation/javascript/streetview)
 */
ngMap.services.StreetView = function($q) {
  return {
    /**
     * Retrieves panorama id from the given map (and or position)
     * @memberof StreetView
     * @param {map} map Google map instance
     * @param {LatLng} latlng Google LatLng instance  
     *   default: the center of the map
     * @example
     *   StreetView.getPanorama(map).then(function(panoId) {
     *     $scope.panoId = panoId;
     *   });
     * @returns {HttpPromise} Future object
     */
    getPanorama : function(map, latlng) {
      latlng = latlng || map.getCenter();
      var deferred = $q.defer();
      var svs = new google.maps.StreetViewService();
      svs.getPanoramaByLocation( (latlng||map.getCenter), 100, function (data, status) {
        // if streetView available
        if (status === google.maps.StreetViewStatus.OK) {
          deferred.resolve(data.location.pano);
        } else {
          // no street view available in this range, or some error occurred
          deferred.resolve(false);
          //deferred.reject('Geocoder failed due to: '+ status);
        }
      });
      return deferred.promise;
    },
    /**
     * Set panorama view on the given map with the panorama id
     * @memberof StreetView
     * @param {map} map Google map instance
     * @param {String} panoId Panorama id fro getPanorama method
     * @example
     *   StreetView.setPanorama(map, panoId);
     */
    setPanorama : function(map, panoId) {
      var svp = new google.maps.StreetViewPanorama(map.getDiv(), {enableCloseButton: true});
      svp.setPano(panoId);
    }
  }; // return
} // func
ngMap.services.StreetView.$inject =  ['$q'];

/**
 * @ngdoc directive
 * @name info-window
 * @requires Attr2Options 
 * @description 
 *   Initialize a Google map InfoWindow and set a scope method `showInfoWindow` 
 *   
 *   Requires:  map directive
 *
 *   Restrict To:  Element Or Attribute
 *
 * @param {String} &lt;InfoWindowOption> Any InfoWindow options, https://developers.google.com/maps/documentation/javascript/reference?csw=1#InfoWindowOptions
 * @param {String} &lt;InfoWindowEvent> Any InfoWindow events, https://developers.google.com/maps/documentation/javascript/reference
 * @example
 * Example: 
 *   <map center="[40.74, -74.18]">
 *     <marker position="the cn tower" on-click="showInfoWindow(event, 'marker-info'"></marker>
 *     <info-window id="marker-info" style="display: none;">
 *       <h1> I am an InfoWindow </h1>
 *       I am here at [[this.getPosition()]]
 *     </info-window>
 *   </map>
 *
 * For working example, please visit:  
 *   https://rawgit.com/allenhwkim/angularjs-google-maps/master/build/marker_with_info_window.html
 */
ngMap.directives.infoWindow = function(Attr2Options) {
  var parser = Attr2Options;

  return {
    restrict: 'AE',
    require: '^map',
    link: function(scope, element, attrs, mapController) {
      var filtered = parser.filter(attrs);

      /**
       * set infoWindow options
       */
      scope.google = google;
      var options = parser.getOptions(filtered, scope);
      if (options.pixelOffset) {
        options.pixelOffset = google.maps.Size.apply(this, options.pixelOffset);
      }
      var infoWindow = new google.maps.InfoWindow(options);
      infoWindow.contents = element.html();

      /**
       * set infoWindow events
       */
      var events = parser.getEvents(scope, filtered);
      for(var eventName in events) {
        if (eventName) {
          google.maps.event.addListener(infoWindow, eventName, events[eventName]);
        }
      }

      // set infoWindows to map controller
      mapController.infoWindows.push(infoWindow);

      // do NOT show this
      element.css({display:'none'});

      //provide showInfoWindow function to scope
      scope.showInfoWindow = function(event, id, options) {
        var infoWindow = scope.infoWindows[id];
        var contents = infoWindow.contents;
        var matches = contents.match(/\[\[[^\]]+\]\]/g);
        if (matches) {
          for(var i=0, length=matches.length; i<length; i++) {
            var expression = matches[i].replace(/\[\[/,'').replace(/\]\]/,'');
            try {
              contents = contents.replace(matches[i], eval(expression));
            } catch(e) {
              expression = "options."+expression;
              contents = contents.replace(matches[i], eval(expression));
            }
          }
        }
        infoWindow.setContent(contents);
        infoWindow.open(scope.map, this);
      };
    } // link
  };// return
};// function
ngMap.directives.infoWindow.$inject = ['Attr2Options'];

/**
 * @ngdoc directive
 * @name map
 * @requires Attr2Options
 * @requires $parse
 * @requires NavigatorGeolocation
 * @requires GeoCoder
 * @requires $compile
 * @description
 *   Implementation of {@link MapController}
 *   Initialize a Google map within a `<div>` tag with given options and register events
 *   It accepts children directives; marker, shape, info-window, or marker-clusterer
 *
 *   It initialize map, children tags, then emits message as soon as the action is done
 *   The message emitted from this directive are;
 *     . mapInitialized
 *     . markersInitialized
 *     . shapesInitialized
 *     . infoWindowInitialized
 *     . markerClustererInitializd
 *
 *   Restrict To:
 *     Element Or Attribute
 *
 * @param {Array} geo-fallback-center 
 *    The center of map incase geo location failed. 
 *    This should not be used with `center`, since `center` overrides `geo-fallback-center`
 * @param {String} &lt;MapOption> Any Google map options, https://developers.google.com/maps/documentation/javascript/reference?csw=1#MapOptions
 * @param {String} &lt;MapEvent> Any Google map events, https://rawgit.com/allenhwkim/angularjs-google-maps/master/build/map_events.html
 * @example
 * Usage:
 *   <map MAP_OPTIONS_OR_MAP_EVENTS ..>
 *     ... Any children directives
 *   </map>
 *   Or,
 *   <ANY map MAP_OPTIONS_OR_MAP_EVENTS ..>
 *     ... Any children directives
 *   </ANY>
 *
 * Example:
 *   <map center="[40.74, -74.18]" on-click="doThat()">
 *   </map>
 *
 *   <div map center="[40.74, -74.18]" on-click="doThat()">
 *   </div>
 *
 *   <map geo-fallback-center="[40.74, -74.18]">
 *   </div>
 */
ngMap.directives.map = function(Attr2Options, $parse, NavigatorGeolocation, GeoCoder, $compile) {
  var parser = Attr2Options;

  return {
    restrict: 'AE',
    controller: ngMap.directives.MapController,
    /**
     * Initialize map and events
     * @memberof map
     * @param {$scope} scope
     * @param {angular.element} element
     * @param {Hash} attrs
     * @ctrl {MapController} ctrl
     */
    link: function (scope, element, attrs, ctrl) {
      scope.google = google; // ??

      /**
       * create a new `div` inside map tag, so that it does not touch map element
       * http://stackoverflow.com/questions/20955356
       */
      var el = document.createElement("div");
      el.style.width = "100%";
      el.style.height = "100%";
      element.prepend(el);
      scope.map = new google.maps.Map(el, {});
      console.log('scope.map', scope.map);

      /**
       * get map optoins
       */
      var filtered = parser.filter(attrs);
      console.log('filtered', filtered);
      var options = parser.getOptions(filtered, scope);
      var controlOptions = parser.getControlOptions(filtered);
      var mapEvents = parser.getEvents(scope, filtered);
      var mapOptions = angular.extend(options, controlOptions);
      mapOptions.zoom = mapOptions.zoom || 15;
      console.log("mapOptions", mapOptions, "mapEvents", mapEvents);

      /**
       * initialize map
       */
      if (mapOptions.center instanceof Array) {
        var lat = mapOptions.center[0], lng= mapOptions.center[1];
        ctrl.initMap(mapOptions, new google.maps.LatLng(lat,lng), mapEvents);
      } else if (typeof mapOptions.center == 'string') { //address
        GeoCoder.geocode({address: mapOptions.center})
          .then(function(results) {
            ctrl.initMap(mapOptions, results[0].geometry.location, mapEvents);
          });
      } else if (!mapOptions.center) { //no center given, use current location
        NavigatorGeolocation.getCurrentPosition()
          .then(function(position) {
            var lat = position.coords.latitude, lng = position.coords.longitude;
            ctrl.initMap(mapOptions, new google.maps.LatLng(lat,lng), mapEvents);
          },function(){//current location failed, use fallback
            if(mapOptions.geoFallbackCenter instanceof Array){
              var lat = mapOptions.geoFallbackCenter[0], lng= mapOptions.geoFallbackCenter[1];
              ctrl.initMap(mapOptions, new google.maps.LatLng(lat,lng), mapEvents);
            } else{
              ctrl.initMap(mapOptions, new google.maps.LatLng(0,0), mapEvents);//no fallback set, go to 0/0
            }
          });
      }

      var markers = ctrl.initMarkers();
      scope.$emit('markersInitialized', markers);

      var shapes = ctrl.initShapes();
      scope.$emit('shapesInitialized', shapes);

      var infoWindows = ctrl.initInfoWindows();
      scope.$emit('infoWindowsInitialized', [infoWindows, scope.showInfoWindow]);

      var markerClusterer= ctrl.initMarkerClusterer();
      scope.$emit('markerClustererInitialized', markerClusterer);
    }
  }; // return
}; // function
ngMap.directives.map.$inject = ['Attr2Options', '$parse', 'NavigatorGeolocation', 'GeoCoder', '$compile'];

/**
 * @ngdoc directive
 * @name MapController
 * @requires $scope
 * @property {Hash} controls collection of Controls initiated within `map` directive
 * @property {Hash} markersi collection of Markers initiated within `map` directive
 * @property {Hash} shapes collection of shapes initiated within `map` directive
 * @property {Hash} infoWindows collection of InfoWindows initiated within `map` directive
 * @property {MarkerClusterer} markerClusterer MarkerClusterer initiated within `map` directive
 */
ngMap.directives.MapController = function($scope) { 

  this.controls = {};
  this.markers = [];
  this.shapes = [];
  this.infoWindows = [];
  this.markerClusterer = null;

  /**
   * Initialize map with options, center and events
   * This emits a message `mapInitialized` with the parmater of map, Google Map Object
   * @memberof MapController
   * @name initMap
   * @param {MapOptions} options google map options
   * @param {LatLng} center the center of the map
   * @param {Hash} events  google map events. The key is the name of the event
   */
  this.initMap = function(options, center, events) {
    options.center = null; // use parameter center instead
    $scope.map.setOptions(options);
    $scope.map.setCenter(center);
    for (var eventName in events) {
      if (eventName) {
        google.maps.event.addListener($scope.map, eventName, events[eventName]);
      }
    }
    $scope.$emit('mapInitialized', $scope.map);  
  };

  /**
   * Add a marker to map and $scope.markers
   * @memberof MapController
   * @name addMarker
   * @param {Marker} marker google map marker
   *    if marker has centered attribute with the key of the value,
   *    the map will be centered with the marker
   */
  this.addMarker = function(marker) {
    marker.setMap($scope.map);
    if (marker.centered) {
      $scope.map.setCenter(marker.position);
    }
    var len = Object.keys($scope.markers).length;
    $scope.markers[marker.id || len] = marker;
  };

  /**
   * Initialize markers
   * @memberof MapController
   * @name initMarkers
   * @returns {Hash} markers collection of markers
   */
  this.initMarkers = function() {
    $scope.markers = {};
    for (var i=0; i<this.markers.length; i++) {
      var marker = this.markers[i];
      this.addMarker(marker);
    }
    return $scope.markers;
  };

  /**
   * Add a shape to map and $scope.shapes
   * @memberof MapController
   * @name addShape
   * @param {Shape} shape google map shape
   */
  this.addShape = function(shape) {
    shape.setMap($scope.map);
    var len = Object.keys($scope.shapes).length;
    $scope.shapes[shape.id || len] = shape;
  };

  /**
   * Initialize shapes
   * @memberof MapController
   * @name initShapes
   * @returns {Hash} shapes collection of shapes
   */
  this.initShapes = function() {
    $scope.shapes = {};
    for (var i=0; i<this.shapes.length; i++) {
      var shape = this.shapes[i];
      shape.setMap($scope.map);
      $scope.shapes[shape.id || i] = shape; // can have id as key
    }
    return $scope.shapes;
  };

  /**
   * Initialize infoWindows for this map
   * @memberof MapController
   * @name initInfoWindows
   * @returns {Hash} infoWindows collection of InfoWindows
   */
  this.initInfoWindows = function() {
    $scope.infoWindows = {};
    for (var i=0; i<this.infoWindows.length; i++) {
      var obj = this.infoWindows[i];
      $scope.infoWindows[obj.id || i] = obj; 
    }
    return $scope.infoWindows;
  };

  /**
   * Initialize markerClusterere for this map
   * @memberof MapController
   * @name initMarkerClusterer
   * @returns {MarkerClusterer} markerClusterer
   */
  this.initMarkerClusterer = function() {
    if (this.markerClusterer) {
      $scope.markerClusterer = new MarkerClusterer(
        $scope.map, 
        this.markerClusterer.data, 
        this.markerClusterer.options
      );
    }
    return $scope.markerClusterer;
  };
};
ngMap.directives.MapController.$inject = ['$scope'];

/**
 * @ngdoc directive
 * @name marker
 * @requires Attr2Options 
 * @requires GeoCoder
 * @requires NavigatorGeolocation
 * @description 
 *   Initialize a Google map marker in map with given options and register events  
 *   
 *   Requires:  map directive
 *
 *   Restrict To:  Element Or Attribute
 *
 * @param {String} position address, 'current', or [latitude, longitude]  
 *    example:  
 *      '1600 Pennsylvania Ave, 20500  Washingtion DC',   
 *      'current position',  
 *      '[40.74, -74.18]'  
 * @param {Boolean} centered if set, map will be centered with this marker
 * @param {String} &lt;MarkerOption> Any Marker options, https://developers.google.com/maps/documentation/javascript/reference?csw=1#MarkerOptions  
 * @param {String} &lt;MapEvent> Any Marker events, https://developers.google.com/maps/documentation/javascript/reference
 * @example
 * Usage: 
 *   <map MAP_ATTRIBUTES>
 *    <marker ANY_MARKER_OPTIONS ANY_MARKER_EVENTS"></MARKER>
 *   </map>
 *
 * Example: 
 *   <map center="[40.74, -74.18]">
 *    <marker position="[40.74, -74.18]" on-click="myfunc()"></div>
 *   </map>
 *
 *   <map center="the cn tower">
 *    <marker position="the cn tower" on-click="myfunc()"></div>
 *   </map>
 */
ngMap.directives.marker  = function(Attr2Options, GeoCoder, NavigatorGeolocation) {
  var parser = Attr2Options;

  return {
    restrict: 'AE',
    require: '^map',
    link: function(scope, element, attrs, mapController) {
      //var filtered = new parser.filter(attrs);
      var filtered = parser.filter(attrs);
      scope.google = google;
      var markerOptions = parser.getOptions(filtered, scope);
      var markerEvents = parser.getEvents(scope, filtered);

      var getMarker = function(options, events) {
        var marker = new google.maps.Marker(options);
        if (Object.keys(events).length > 0) {
          console.log("markerEvents", events);
        }
        for (var eventName in events) {
          if (eventName) {
            google.maps.event.addListener(marker, eventName, events[eventName]);
          }
        }
        return marker;
      };

      if (markerOptions.position instanceof Array) {

        var lat = markerOptions.position[0]; 
        var lng = markerOptions.position[1];
        markerOptions.position = new google.maps.LatLng(lat,lng);

        console.log("adding marker with options, ", markerOptions);

        /**
         * ng-repeat does not happen while map tag is initialized
         * so add markers after it is initialized
         */
        var marker = getMarker(markerOptions, markerEvents);
        if (markerOptions.ngRepeat) { 
          mapController.addMarker(marker);
        } else {
          mapController.markers.push(marker);
        }
      } else if (typeof markerOptions.position == 'string') { //need to get lat/lng

        var position = markerOptions.position;

        if (position.match(/^current/i)) { // sensored position

          NavigatorGeolocation.getCurrentPosition()
            .then(function(position) {
              var lat = position.coords.latitude, lng = position.coords.longitude;
              markerOptions.position = new google.maps.LatLng(lat, lng);
              var marker = getMarker(markerOptions, markerEvents);
              mapController.addMarker(marker);
            });

        } else { //assuming it is address

          GeoCoder.geocode({address: markerOptions.position})
            .then(function(results) {
              var latLng = results[0].geometry.location;
              markerOptions.position = latLng;
              var marker = getMarker(markerOptions, markerEvents);
              mapController.addMarker(marker);
            });

        } 
      } else {
        console.error('invalid marker position', markerOptions.position);
      }
    } //link
  }; // return
};// function
ngMap.directives.marker.$inject  = ['Attr2Options', 'GeoCoder', 'NavigatorGeolocation'];

/**
 * @ngdoc directive
 * @name marker-clusterer
 * @requires Attr2Options 
 * @description 
 *   Initialize a Google map with marker-clusterer
 *   
 *   Requires:  map directive
 *
 *   Restrict To:  Element Or Attribute
 *
 * @param {Array} markers The initial markers for this marker clusterer  
 *   The options of each marker must be exactly the same as options of marker directive.  
 *   The markers are also will be set to $scope.markers
 * @param {String} &lt;MarkerClustererOption> Any MarkerClusterer options,  
 *   http://google-maps-utility-library-v3.googlecode.com/svn/trunk/markerclustererplus/docs/reference.html#MarkerClustererOptions
 *
 * @example
 * Usage: 
 *   <map MAP_ATTRIBUTES>
 *    <marker-clusterer markers="DATA" ANY_MARKER_CLUSTERER_OPTIONS"></marker-clusterer>
 *   </map>
 *
 * Example: 
 *   <map zoom="1" center="[43.6650000, -79.4103000]">
 *      <marker-clusterer markers="markersData" max-zoom="2">
 *   </marker-clusterer>
 *
 *   For full working example, please visit https://rawgit.com/allenhwkim/angularjs-google-maps/master/build/marker_clusterer.html
 */
ngMap.directives.markerClusterer  = function(Attr2Options) {
  //var parser = new Attr2Options();
  var parser = Attr2Options;

  return {
    restrict: 'AE',
    require: '^map',
    link: function(scope, element, attrs, mapController) {
      var markersData = scope.$eval(attrs.markers);
      delete attrs.markers;
      //var options = new parser.filter(attrs);
      var options = parser.filter(attrs);

      var markers = [];
      for (var i=0; i< markersData.length; i++) {
        var data = markersData[i];

        var lat = data.position[0], lng = data.position[1];
        data.position = new google.maps.LatLng(lat,lng);
        var marker = new google.maps.Marker(data);
        
        var markerEvents = parser.getEvents(scope, data);
        for (var eventName in markerEvents) {
          if (eventName) {
            google.maps.event.addListener(marker, eventName, markerEvents[eventName]);
          }
        }
        markers.push(marker);
      } // for (var i=0;..
      mapController.markers = markers;
      mapController.markerClusterer =  { data: markers, options:options };
      console.log('markerClusterer', mapController.markerClusterer);
    } //link
  }; // return
};// function
ngMap.directives.markerClusterer.$inject  = ['Attr2Options'];

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
  //var parser = new Attr2Options();
  var parser = Attr2Options;
  
  var getPoints = function(array) { // return latitude && longitude points
    if (array[0] && array[0] instanceof Array) { // [[1,2],[3,4]] 
      return array.map(function(el) {
        return new google.maps.LatLng(el[0], el[1]);
      });
    } else {
      return new google.maps.LatLng(array[0],array[1]);      
    }
  };
  
  var getBounds = function(array) {
    var points = getPoints(array);
    return new google.maps.LatLngBounds(points[0], points[1]);
  };
  
  var getShape = function(shapeName, options) {
    switch(shapeName) {
    case "circle":
      options.center = getPoints(options.center);
      return new google.maps.Circle(options);
    case "polygon":
      options.paths = getPoints(options.paths);
      return new google.maps.Polygon(options);
    case "polyline": 
      options.path = getPoints(options.path);
      return new google.maps.Polyline(options);
    case "rectangle": 
      options.bounds = getBounds(options.bounds);
      return new google.maps.Rectangle(options);
    case "groundOverlay":
    case "image":
      var url = options.url;
      var bounds = getBounds(options.bounds);
      var opts = {opacity: options.opacity, clickable: options.clickable, id:options.id};
      return new google.maps.GroundOverlay(url, bounds, opts);
    }
    return null;
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
      var shapeName = filtered.name;
      delete filtered.name;  //remove name bcoz it's not for options
      
      var shapeOptions = parser.getOptions(filtered);
      console.log('shape', shapeName, 'options', shapeOptions);
      var shape = getShape(shapeName, shapeOptions);

      if (shapeOptions.ngRepeat) { 
      mapController.addShape(shape);
      } else if (shape) {
      mapController.shapes.push(shape);
      } else {
      console.error("shape", shapeName, "is not defined");
      }
      
      //shape events
      var events = parser.getEvents(scope, filtered);
      console.log("shape", shapeName, "events", events);
      for (var eventName in events) {
        if (events[eventName]) {
          console.log(eventName, events[eventName]);
          google.maps.event.addListener(shape, eventName, events[eventName]);
        }
      }
    }
   }; // return
}; // function
ngMap.directives.shape.$inject  = ['Attr2Options'];

var ngMapModule = angular.module('ngMap', []);

for (var key in ngMap.services) {
  ngMapModule.service(key, ngMap.services[key]);
}

for (var key in ngMap.directives) {
  if(key != "MapController") {   // MapController is a controller for directives
    ngMapModule.directive(key, ngMap.directives[key]);
  }
}
