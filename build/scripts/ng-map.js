angular.module('ngMap', []);

/**
 * @ngdoc service
 * @name Attr2Options
 * @description 
 *   Converts tag attributes to options used by google api v3 objects, map, marker, polygon, circle, etc.
 */
/* global google */
(function() {
  'use strict';

  var SPECIAL_CHARS_REGEXP = /([\:\-\_]+(.))/g;
  var MOZ_HACK_REGEXP = /^moz([A-Z])/;  

  function camelCase(name) {
    return name.
      replace(SPECIAL_CHARS_REGEXP, function(_, separator, letter, offset) {
        return offset ? letter.toUpperCase() : letter;
      }).
      replace(MOZ_HACK_REGEXP, 'Moz$1');
  }

  function JSONize(str) {
    try {       // if parsable already, return as it is
      JSON.parse(str);
      return str;
    } catch(e) { // if not parsable, change little
      return str
        // wrap keys without quote with valid double quote
        .replace(/([\$\w]+)\s*:/g, function(_, $1){return '"'+$1+'":'})
        // replacing single quote wrapped ones to double quote 
        .replace(/'([^']+)'/g, function(_, $1){return '"'+$1+'"'})
    }
  }

  var Attr2Options = function($parse, $timeout, NavigatorGeolocation, GeoCoder) { 

    /**
     * Returns the attributes of an element as hash
     * @memberof Attr2Options
     * @param {HTMLElement} el html element
     * @returns {Hash} attributes
     */
    var orgAttributes = function(el) {
      (el.length > 0) && (el = el[0]);
      var orgAttributes = {};
      for (var i=0; i<el.attributes.length; i++) {
        var attr = el.attributes[i];
        orgAttributes[attr.name] = attr.value;
      }
      return orgAttributes;
    };

    var toOptionValue = function(input, options) {
      var output, key=options.key, scope=options.scope;
      try { // 1. Number?
        var num = Number(input);
        if (isNaN(num)) {
          throw "Not a number";
        } else  {
          output = num;
        }
      } catch(err) { 
        try { // 2.JSON?
          if (input.match(/^[\+\-]?[0-9\.]+,[ ]*\ ?[\+\-]?[0-9\.]+$/)) { // i.e "-1.0, 89.89"
            input = "["+input+"]";
          }
          output = JSON.parse(JSONize(input));
          if (output instanceof Array) {
            var t1stEl = output[0];
            if (t1stEl.constructor == Object) { // [{a:1}] : not lat/lng ones
            } else if (t1stEl.constructor == Array) { // [[1,2],[3,4]] 
              output =  output.map(function(el) {
                return new google.maps.LatLng(el[0], el[1]);
              });
            } else if(!isNaN(parseFloat(t1stEl)) && isFinite(t1stEl)) {
              return new google.maps.LatLng(output[0], output[1]);
            }
          }
          else if (output === Object(output)) { // JSON is an object (not array or null)
            // check for nested hashes and convert to Google API options
            output = getOptions(output, options);
          }
        } catch(err2) {
          // 3. Object Expression. i.e. LatLng(80,-49)
          if (input.match(/^[A-Z][a-zA-Z0-9]+\(.*\)$/)) {
            try {
              var exp = "new google.maps."+input;
              output = eval(exp); // TODO, still eval
            } catch(e) {
              output = input;
            } 
          // 4. Object Expression. i.e. MayTypeId.HYBRID 
          } else if (input.match(/^([A-Z][a-zA-Z0-9]+)\.([A-Z]+)$/)) {
            try {
              var matches = input.match(/^([A-Z][a-zA-Z0-9]+)\.([A-Z]+)$/);
              output = google.maps[matches[1]][matches[2]];
            } catch(e) {
              output = input;
            } 
          // 5. Object Expression. i.e. HYBRID 
          } else if (input.match(/^[A-Z]+$/)) {
            try {
              var capitalizedKey = key.charAt(0).toUpperCase() + key.slice(1);
              if (key.match(/temperatureUnit|windSpeedUnit|labelColor/)) {
                capitalizedKey = capitalizedKey.replace(/s$/,"");
                output = google.maps.weather[capitalizedKey][input];
              } else {
                output = google.maps[capitalizedKey][input];
              }
            } catch(e) {
              output = input;
            }
          // 6. Date Object as ISO String i.e. "2015-08-12T06:12:40.858Z"
          } else if (input.match(/\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z)/)) {
            try {
              output = new Date(input);
            } catch(e) {
              output = input;
            }
          } else {
            output = input;
          }
        } // catch(err2)
      } // catch(err)
      return output;
    };

    var getAttrsToObserve = function(attrs) {
      var attrsToObserve = [];
      if (attrs["ng-repeat"] || attrs.ngRepeat) {  // if element is created by ng-repeat, don't observe any
        void(0);
      } else {
        for (var attrName in attrs) {
          var attrValue = attrs[attrName];
          if (attrValue && attrValue.match(/\{\{.*\}\}/)) { // if attr value is {{..}}
            void 0;
            attrsToObserve.push(camelCase(attrName));
          }
        }
      }
      return attrsToObserve;
    };

    /**
     * filters attributes by skipping angularjs methods $.. $$..
     * @memberof Attr2Options
     * @param {Hash} attrs tag attributes
     * @returns {Hash} filterd attributes
     */
    var filter = function(attrs) {
      var options = {};
      for(var key in attrs) {
        if (key.match(/^\$/) || key.match(/^ng[A-Z]/)) {
          void(0);
        } else {
          options[key] = attrs[key];
        }
      }
      return options;
    };

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
    var getOptions = function(attrs, scope) {
      var options = {};
      for(var key in attrs) {
        if (attrs[key]) {
          if (key.match(/^on[A-Z]/)) { //skip events, i.e. on-click
            continue;
          } else if (key.match(/ControlOptions$/)) { // skip controlOptions
            continue;
          } else {
            // nested conversions need to be typechecked (non-strings are fully converted)
            if (typeof attrs[key] !== 'string') {
              options[key] = attrs[key];
            } else {
              options[key] = toOptionValue(attrs[key], {scope:scope, key: key});
            }
          }
        } // if (attrs[key])
      } // for(var key in attrs)
      return options;
    };

    /**
     * converts attributes hash to scope-specific event function 
     * @memberof Attr2Options
     * @param {scope} scope angularjs scope
     * @param {Hash} attrs tag attributes
     * @returns {Hash} events converted events
     */
    var getEvents = function(scope, attrs) {
      var events = {};
      var toLowercaseFunc = function($1){
        return "_"+$1.toLowerCase();
      };
      var eventFunc = function(attrValue) {
        var matches = attrValue.match(/([^\(]+)\(([^\)]*)\)/);
        var funcName = matches[1];
        var argsStr = matches[2].replace(/event[ ,]*/,'');  //remove string 'event'
        var argsExpr = $parse("["+argsStr+"]"); //for perf when triggering event
        return function(event) {
          var args = argsExpr(scope); //get args here to pass updated model values
          function index(obj,i) {return obj[i];}
          var f = funcName.split('.').reduce(index, scope);
          f && f.apply(this, [event].concat(args));
          $timeout( function() {
            scope.$apply();
          });
        };
      };

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
    };

    /**
     * control means map controls, i.e streetview, pan, etc, not a general control
     * @memberof Attr2Options
     * @param {Hash} filtered filtered tag attributes
     * @returns {Hash} Google Map options
     */
    var getControlOptions = function(filtered) {
      var controlOptions = {};
      if (typeof filtered != 'object') {
        return false;
      }

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
                    if (str.match(/^[A-Z]+$/)) { // if constant
                      return google.maps.MapTypeId[str.toUpperCase()];
                    } else { // else, custom map-type
                      return str;
                    }
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
            void 0;
          }
        }
      } // for

      return controlOptions;
    };

    return {
      camelCase: camelCase,
      filter: filter,
      getOptions: getOptions,
      getEvents: getEvents,
      getControlOptions: getControlOptions,
      toOptionValue: toOptionValue,
      getAttrsToObserve: getAttrsToObserve,
      orgAttributes: orgAttributes
    }; // return

  }; 
  Attr2Options.$inject= ['$parse', '$timeout', 'NavigatorGeolocation', 'GeoCoder'];

  angular.module('ngMap').service('Attr2Options', Attr2Options);
})();

/**
 * @ngdoc service
 * @name GeoCoder
 * @description
 *   Provides [defered/promise API](https://docs.angularjs.org/api/ng/service/$q) service for Google Geocoder service
 */
/* global google */
(function() {
  'use strict';
  var GeoCoder = function($q) {
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
  GeoCoder.$inject = ['$q'];

  angular.module('ngMap').service('GeoCoder', GeoCoder);
})();

/**
 * @ngdoc service
 * @name NavigatorGeolocation
 * @description
 *  Provides [defered/promise API](https://docs.angularjs.org/api/ng/service/$q) service for navigator.geolocation methods
 */
/* global google */
(function() {
  'use strict';

  var NavigatorGeolocation = function($q) {
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
              void 0;
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
  }; 
  NavigatorGeolocation.$inject = ['$q'];

  angular.module('ngMap').service('NavigatorGeolocation', NavigatorGeolocation);
})();

/**
 * @ngdoc service
 * @name StreetView
 * @description
 *  Provides [defered/promise API](https://docs.angularjs.org/api/ng/service/$q) service 
 *  for [Google StreetViewService](https://developers.google.com/maps/documentation/javascript/streetview)
 */
/* global google */
(function() {
  'use strict';

  var StreetView = function($q) {

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
    var getPanorama = function(map, latlng) {
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
    };

    /**
     * Set panorama view on the given map with the panorama id
     * @memberof StreetView
     * @param {map} map Google map instance
     * @param {String} panoId Panorama id fro getPanorama method
     * @example
     *   StreetView.setPanorama(map, panoId);
     */
    var setPanorama = function(map, panoId) {
      var svp = new google.maps.StreetViewPanorama(map.getDiv(), {enableCloseButton: true});
      svp.setPano(panoId);
    };

    return {
      getPanorama: getPanorama,
      setPanorama: setPanorama
    }; // return

  };
  StreetView.$inject = ['$q'];

  angular.module('ngMap').service('StreetView', StreetView);
})();

/**
 * @ngdoc directive
 * @name bicycling-layer
 * @param Attr2Options {service} convert html attribute to Gogole map api options
 * @description 
 *   Requires:  map directive
 *   Restrict To:  Element
 *
 * @example
 * Example: 
 *
 *   <map zoom="13" center="34.04924594193164, -118.24104309082031">
 *     <bicycling-layer></bicycling-layer>
 *    </map>
 */
(function() {
  'use strict';
  angular.module('ngMap').directive('bicyclingLayer', ['Attr2Options', function(Attr2Options) {
    var parser = Attr2Options;
    
    var getLayer = function(options, events) {
      var layer = new google.maps.BicyclingLayer(options);
      for (var eventName in events) {
        google.maps.event.addListener(layer, eventName, events[eventName]);
      }
      return layer;
    };
    
    return {
      restrict: 'E',
      require: '^map',

      link: function(scope, element, attrs, mapController) {
        var orgAttrs = parser.orgAttributes(element);
        var filtered = parser.filter(attrs);
        var options = parser.getOptions(filtered);
        var events = parser.getEvents(scope, filtered);

        void 0;

        var layer = getLayer(options, events);
        mapController.addObject('bicyclingLayers', layer);
        mapController.observeAttrSetObj(orgAttrs, attrs, layer);  //observers
        element.bind('$destroy', function() {
          mapController.deleteObject('bicyclingLayers', layer);
        });
      }
     }; // return
  }]);
})();

/**
 * @ngdoc directive
 * @name cloud-layer
 * @param Attr2Options {service} convert html attribute to Gogole map api options
 * @description 
 *   Requires:  map directive
 *   Restrict To:  Element
 *
 * @example
 * Example: 
 *
 *   <map zoom="13" center="34.04924594193164, -118.24104309082031">
 *     <cloud-layer></cloud-layer>
 *    </map>
 */
(function() {
  'use strict';
  angular.module('ngMap').directive('cloudLayer', ['Attr2Options', function(Attr2Options) {
    var parser = Attr2Options;
    
    var getLayer = function(options, events) {
      var layer = new google.maps.weather.CloudLayer(options);
      for (var eventName in events) {
        google.maps.event.addListener(layer, eventName, events[eventName]);
      }
      return layer;
    };
    
    return {
      restrict: 'E',
      require: '^map',

      link: function(scope, element, attrs, mapController) {
        var orgAttrs = parser.orgAttributes(element);
        var filtered = parser.filter(attrs);
        var options = parser.getOptions(filtered);
        var events = parser.getEvents(scope, filtered);
        void 0;

        var layer = getLayer(options, events);
        mapController.addObject('cloudLayers', layer);
        mapController.observeAttrSetObj(orgAttrs, attrs, layer);  //observers
        element.bind('$destroy', function() {
          mapController.deleteObject('cloudLayers', layer);
        });
      }
     }; // return
  }]);
})();

/**
 * @ngdoc directive
 * @name custom-control
 * @param Attr2Options {service} convert html attribute to Gogole map api options
 * @param $compile {service} AngularJS $compile service
 * @description 
 *   Build custom control and set to the map with position
 *   
 *   Requires:  map directive
 *
 *   Restrict To:  Element
 *
 * @attr {String} position position of this control
 *        i.e. TOP_RIGHT
 * @attr {Number} index index of the control
 * @example
 *
 * Example: 
 *  <map center="41.850033,-87.6500523" zoom="3">
 *    <custom-control id="home" position="TOP_LEFT" index="1">
 *      <div style="background-color: white;">
 *        <b>Home</b>
 *      </div>
 *    </custom-control>
 *  </map>
 *
 */
(function() {
  'use strict';
  angular.module('ngMap').directive('customControl', ['Attr2Options', '$compile', function(Attr2Options, $compile)  {
    'use strict';
    var parser = Attr2Options;

    return {
      restrict: 'E',
      require: '^map',
      link: function(scope, element, attrs, mapController) {
        var orgAttrs = parser.orgAttributes(element);
        var filtered = parser.filter(attrs);
        var options = parser.getOptions(filtered, scope);
        var events = parser.getEvents(scope, filtered);
        void 0;

        /**
         * build a custom control element
         */
        var customControlEl = element[0].parentElement.removeChild(element[0]);
        $compile(customControlEl.innerHTML.trim())(scope);

        /**
         * set events
         */
        for (var eventName in events) {
          google.maps.event.addDomListener(customControlEl, eventName, events[eventName]);
        }

        mapController.addObject('customControls', customControlEl);
        scope.$on('mapInitialized', function(evt, map) {
          var position = options.position;
          map.controls[google.maps.ControlPosition[position]].push(customControlEl);
        });

      } //link
    }; // return
  }]);// function
})();

/**
 * @ngdoc directive
 * @memberof ngmap
 * @name custom-marker
 * @param Attr2Options {service} convert html attribute to Gogole map api options
 * @param $compile {service} AngularJS $compile service
 * @param $timeout {service} AngularJS $timeout
 * @description 
 *   Marker with html
 *   Requires:  map directive
 *   Restrict To:  Element
 *
 * @attr {String} position required, position on map
 * @attr {Number} z-index optional
 * @attr {Boolean} visible optional
 * @example
 *
 * Example: 
 *   <map center="41.850033,-87.6500523" zoom="3">
 *     <custom-marker position="41.850033,-87.6500523">
 *       <div>
 *         <b>Home</b>
 *       </div>
 *     </custom-marker>
 *   </map>
 *
 */
(function() {
  'use strict';
  var parser, $compile, $timeout;

  var cAbortEvent = function (e) {
    e.preventDefault && e.preventDefault();
    e.cancelBubble = true;
    e.stopPropagation && e.stopPropagation();
  }; 

  var CustomMarker = function(options) {
    options = options || {};

    this.el = document.createElement('div');
    this.el.style.display = 'inline-block';
    this.visible = true; for (var key in options) {
     this[key] = options[key];
    }
  };

  var setCustomMarker = function() {

    CustomMarker.prototype = new google.maps.OverlayView();

    CustomMarker.prototype.setContent = function(html, scope) {
      this.html = html;
      if (scope) {
        var compiledEl = $compile(html)(scope);
        var customMarkerEl = compiledEl[0];
        var me = this;
        $timeout(function() {
          me.content = customMarkerEl.innerHTML;
          me.el.innerHTML = me.content;
        });
      } else {
        this.content = html;
        this.el.innerHTML = this.content;
      }
      this.el.style.position = 'relative';
      this.el.className = 'custom-marker';
    };

    CustomMarker.prototype.setPosition = function(position) {
      position && (this.position = position);
      if (this.getProjection() && typeof this.position.lng == 'function') {
        var posPixel = this.getProjection().fromLatLngToDivPixel(this.position);
        var x = Math.round(posPixel.x - (this.el.offsetWidth/2));
        var y = Math.round(posPixel.y - this.el.offsetHeight - 10); // 10px for anchor
        this.el.style.left = x + "px";
        this.el.style.top = y + "px";
      }
    };

    CustomMarker.prototype.setZIndex = function(zIndex) {
      zIndex && (this.zIndex = zIndex);
      this.el.style.zIndex = this.zIndex;
    };

    CustomMarker.prototype.setVisible = function(visible) {
      this.el.style.display = visible ? 'inline-block' : 'none';
      this.visible = visible;
    };

    CustomMarker.prototype.addClass = function(className) {
      var classNames = this.el.className.split(' ');
      (classNames.indexOf(className) == -1) && classNames.push(className);
      this.el.className = classNames.join(' ');
    };
    
    CustomMarker.prototype.removeClass = function(className) {
      var classNames = this.el.className.split(' ');
      var index = classNames.indexOf(className);
      (index > -1) && classNames.splice(index, 1);
      this.el.className = classNames.join(' ');
    };

    CustomMarker.prototype.onAdd = function() {
      this.getPanes().overlayMouseTarget.appendChild(this.el);
    };
    
    CustomMarker.prototype.draw = function() {
      this.setPosition();
      this.setZIndex(this.zIndex);
      this.setVisible(this.visible);
    };
    
    CustomMarker.prototype.onRemove = function() {
      this.el.parentNode.removeChild(this.el);
      this.el = null;
    };
  };

  var customMarkerDirective = function(Attr2Options, _$compile_, _$timeout_)  {
    parser = Attr2Options;
    $compile = _$compile_;
    $timeout = _$timeout_;
    setCustomMarker();

    return {
      restrict: 'E',
      require: '^map',
      link: function(scope, element, attrs, mapController) {

        var orgAttrs = parser.orgAttributes(element);
        var filtered = parser.filter(attrs);
        var options = parser.getOptions(filtered, scope);
        var events = parser.getEvents(scope, filtered);

        /**
         * build a custom marker element
         */
        var removedEl = element[0].parentElement.removeChild(element[0]);
        void 0;
        var customMarker = new CustomMarker(options);
        customMarker.setContent(removedEl.innerHTML, scope);
        void 0;

        void 0;
        for (var eventName in events) {
          google.maps.event.addDomListener(
            customMarker.el, eventName, events[eventName]);
        }
        mapController.addObject('customMarkers', customMarker);

        if (!(options.position instanceof google.maps.LatLng)) {
          mapController.getGeoLocation(options.position).then(
            function(latlng) {
              customMarker.setPosition(latlng);
            }
          );
        }

        element.bind('$destroy', function() {
          //Is it required to remove event listeners when DOM is removed?
          mapController.deleteObject('customMarkers', marker);
        });

      } //link
    }; // return
  };// function
  customMarkerDirective.$inject = ['Attr2Options', '$compile', '$timeout'];

  angular.module('ngMap').directive('customMarker', customMarkerDirective);
})();

/**
 * @ngdoc directive
 * @name directions
 * @description 
 *   Enable directions on map. e.g., origin, destination, draggable, waypoints, etc
 *   
 *   Requires:  map directive
 *
 *   Restrict To:  Element 
 *
 * @attr {String} DirectionsRendererOptions [Any DirectionsRendererOptions](https://developers.google.com/maps/documentation/javascript/reference#DirectionsRendererOptions)
 * @attr {String} DirectionsRequestOptions [Any DirectionsRequest options](https://developers.google.com/maps/documentation/javascript/reference#DirectionsRequest)
 * @example
 * Example: 
 *   <map zoom="14" center="37.7699298, -122.4469157">
 *     <directions 
 *       draggable="true"
 *       panel="directions-panel"
 *       travel-mode="{{travelMode}}"
 *       waypoints="[{location:'kingston', stopover:true}]"
 *       origin="{{origin}}"
 *       destination="{{destination}}">
 *     </directions>
 *   </map> 
 */
/* global google */
(function() {
  'use strict';

  var getDirectionsRenderer = function(options, events) {
    if (options.panel) {
      options.panel = document.getElementById(options.panel) || document.querySelector(options.panel);
    }
    var renderer = new google.maps.DirectionsRenderer(options);
    for (var eventName in events) {
      google.maps.event.addListener(renderer, eventName, events[eventName]);
    }
    return renderer;
  };

  var directions = function(Attr2Options, $timeout) {
    var parser = Attr2Options;
    var directionsService = new google.maps.DirectionsService();

    var updateRoute = function(renderer, options) {
      /* filter out valid keys only for DirectionsRequest object*/
      var request = options;
      request.travelMode = request.travelMode || 'DRIVING';
      var validKeys = [
        'origin', 'destination', 'travelMode', 'transitOptions', 'unitSystem',
        'durationInTraffic', 'waypoints', 'optimizeWaypoints', 
        'provideRouteAlternatives', 'avoidHighways', 'avoidTolls', 'region'
      ];
      for(var key in request){
        (validKeys.indexOf(key) === -1) && (delete request[key]);
      }

      if(request.waypoints) {
        // Check fo valid values
        if(request.waypoints == "[]" || request.waypoints == "")  delete request.waypoints;
      }

      if (request.origin && request.destination) {
        void 0;
        directionsService.route(request, function(response, status) {
          if (status == google.maps.DirectionsStatus.OK) {
            $timeout(function() {
              renderer.setDirections(response);
            });
          }
        });
      } 
    };

    var linkFunc = function(scope, element, attrs, mapController) {
      var orgAttrs = parser.orgAttributes(element);
      var filtered = parser.filter(attrs);
      var options = parser.getOptions(filtered);
      var events = parser.getEvents(scope, filtered);
      var attrsToObserve = parser.getAttrsToObserve(orgAttrs);

      var renderer = getDirectionsRenderer(options, events);
      mapController.addObject('directionsRenderers', renderer);
      
      attrsToObserve.forEach(function(attrName) {
        (function(attrName) {
          attrs.$observe(attrName, function(val) {
            if (options[attrName] !== val) { //apply only if changed
              var optionValue = parser.toOptionValue(val, {key: attrName});
              void 0;
              options[attrName] = optionValue;
              updateRoute(renderer, options);
            }
          });
        })(attrName);
      });

      scope.$on('mapInitialized', function(event, map) {
        updateRoute(renderer, options);
      });
      scope.$on('$destroy', function(event, map) {
        mapController.deleteObject('directionsRenderers', renderer);
      });
    };
    
    return {
      restrict: 'E',
      require: '^map',
      link: linkFunc
    }
  }; // var directions
  directions.$inject = ['Attr2Options', '$timeout'];

  angular.module('ngMap').directive('directions', directions);
})();


/**
 * @ngdoc directive
 * @name drawing-manager
 * @param Attr2Options {service} convert html attribute to Gogole map api options
 * @description
 *   Requires:  map directive
 *   Restrict To:  Element
 *
 * @example
 * Example:
 *
 *  <map zoom="13" center="37.774546, -122.433523" map-type-id="SATELLITE">
 *    <drawing-manager  on-overlaycomplete="onMapOverlayCompleted()" position="ControlPosition.TOP_CENTER" drawingModes="POLYGON,CIRCLE" drawingControl="true" circleOptions="fillColor: '#FFFF00';fillOpacity: 1;strokeWeight: 5;clickable: false;zIndex: 1;editable: true;" ></drawing-manager>
 *  </map>
 *
 *  TODO: Add remove button.
 *  currently, for out solution, we have the shapes/markers in our own controller, and we use some css classes to change the shape button
 *  to a remove button (<div>X</div>) and have the remove operation in our own controller.
 */
(function() {
  'use strict';
  angular.module('ngMap').directive('drawingManager', ['Attr2Options', function(Attr2Options) {
    var parser = Attr2Options;

    return {
      restrict: 'E',
      require: '^map',

      link: function(scope, element, attrs, mapController) {
        var orgAttrs = parser.orgAttributes(element);
        var filtered = parser.filter(attrs);
        var options = parser.getOptions(filtered);
        var controlOptions = parser.getControlOptions(filtered);
        var events = parser.getEvents(scope, filtered);

        void 0;

        /**
         * set options
         */
        var drawingManager = new google.maps.drawing.DrawingManager({
          drawingMode: options.drawingmode,
          drawingControl: options.drawingcontrol,
          drawingControlOptions: controlOptions.drawingControlOptions,
          circleOptions:options.circleoptions,
          markerOptions:options.markeroptions,
          polygonOptions:options.polygonoptions,
          polylineOptions:options.polylineoptions,
          rectangleOptions:options.rectangleoptions
        });


        /**
         * set events
         */
        var events = parser.getEvents(scope, filtered);
        for (var eventName in events) {
          google.maps.event.addListener(drawingManager, eventName, events[eventName]);
        }

        mapController.addObject('mapDrawingManager', drawingManager);
      }
    }; // return
  }]);
})();

/**
 * @ngdoc directive
 * @name dynamic-maps-engine-layer
 * @description 
 *   Requires:  map directive
 *   Restrict To:  Element
 *
 * @example
 * Example: 
 *   <map zoom="14" center="[59.322506, 18.010025]">
 *     <dynamic-maps-engine-layer layer-id="06673056454046135537-08896501997766553811"></dynamic-maps-engine-layer>
 *    </map>
 */
(function() {
  'use strict';

  angular.module('ngMap').directive('dynamicMapsEngineLayer', ['Attr2Options', function(Attr2Options) {
    var parser = Attr2Options;

    var getDynamicMapsEngineLayer = function(options, events) {
      var layer = new google.maps.visualization.DynamicMapsEngineLayer(options);

      for (var eventName in events) {
        google.maps.event.addListener(layer, eventName, events[eventName]);
      }

      return layer;
    };

    
    return {
      restrict: 'E',
      require: '^map',

      link: function(scope, element, attrs, mapController) {
        var filtered = parser.filter(attrs);
        var options = parser.getOptions(filtered);
        var events = parser.getEvents(scope, filtered, events);
        void 0;

        var layer = getDynamicMapsEngineLayer(options, events);
        mapController.addObject('mapsEngineLayers', layer);
      }
     }; // return
  }]);
})();

/**
 * @ngdoc directive
 * @name fusion-tables-layer
 * @description 
 *   Requires:  map directive
 *   Restrict To:  Element
 *
 * @example
 * Example: 
 *   <map zoom="11" center="41.850033, -87.6500523">
 *     <fusion-tables-layer query="{
 *       select: 'Geocodable address',
 *       from: '1mZ53Z70NsChnBMm-qEYmSDOvLXgrreLTkQUvvg'}">
 *     </fusion-tables-layer>
 *   </map>
 */
(function() {
  'use strict';

  angular.module('ngMap').directive('fusionTablesLayer', ['Attr2Options', function(Attr2Options) {
    var parser = Attr2Options;

    var getLayer = function(options, events) {
      var layer = new google.maps.FusionTablesLayer(options);

      for (var eventName in events) {
        google.maps.event.addListener(layer, eventName, events[eventName]);
      }

      return layer;
    };

    
    return {
      restrict: 'E',
      require: '^map',

      link: function(scope, element, attrs, mapController) {
        var filtered = parser.filter(attrs);
        var options = parser.getOptions(filtered);
        var events = parser.getEvents(scope, filtered, events);
        void 0;

        var layer = getLayer(options, events);
        mapController.addObject('fusionTablesLayers', layer);
      }
     }; // return
  }]);
})();

/**
 * @ngdoc directive
 * @name heatmap-layer
 * @param Attr2Options {service} convert html attribute to Gogole map api options
 * @description 
 *   Requires:  map directive
 *   Restrict To:  Element
 *
 * @example
 * Example: 
 *
 *   <map zoom="11" center="[41.875696,-87.624207]">
 *     <heatmap-layer data="taxiData"></heatmap-layer>
 *   </map>
 */
(function() {
  'use strict';

  angular.module('ngMap').directive('heatmapLayer', ['Attr2Options', '$window', function(Attr2Options, $window) {
    var parser = Attr2Options;
    
    return {
      restrict: 'E',
      require: '^map',

      link: function(scope, element, attrs, mapController) {
        var filtered = parser.filter(attrs);

        /**
         * set options 
         */
        var options = parser.getOptions(filtered);
        options.data = $window[attrs.data] || scope[attrs.data];
        if (options.data instanceof Array) {
          options.data = new google.maps.MVCArray(options.data);
        } else {
          throw "invalid heatmap data";
        }
        var layer = new google.maps.visualization.HeatmapLayer(options);

        /**
         * set events 
         */
        var events = parser.getEvents(scope, filtered);
        void 0;

        mapController.addObject('heatmapLayers', layer);
      }
     }; // return
  }]);
})();

/**
 * @ngdoc directive
 * @name info-window
 * @param Attr2Options {service} convert html attribute to Gogole map api options
 * @param $compile {service} $compile service
 * @description
 *   Defines infoWindow and provides compile method
 *
 *   Requires:  map directive
 *
 *   Restrict To:  Element
 *
 * @attr {Boolean} visible Indicates to show it when map is initialized
 * @attr {Boolean} visible-on-marker Indicates to show it on a marker when map is initialized
 * @attr {Expression} geo-callback if position is an address, the expression is will be performed when geo-lookup is successful. e.g., geo-callback="showDetail()"
 * @attr {String} &lt;InfoWindowOption> Any InfoWindow options,
 *       https://developers.google.com/maps/documentation/javascript/reference?csw=1#InfoWindowOptions
 * @attr {String} &lt;InfoWindowEvent> Any InfoWindow events, https://developers.google.com/maps/documentation/javascript/reference
 * @example
 * Usage:
 *   <map MAP_ATTRIBUTES>
 *    <info-window id="foo" ANY_OPTIONS ANY_EVENTS"></info-window>
 *   </map>
 *
 * Example:
 *  <map center="41.850033,-87.6500523" zoom="3">
 *    <info-window id="1" position="41.850033,-87.6500523" >
 *      <div ng-non-bindable>
 *        Chicago, IL<br/>
 *        LatLng: {{chicago.lat()}}, {{chicago.lng()}}, <br/>
 *        World Coordinate: {{worldCoordinate.x}}, {{worldCoordinate.y}}, <br/>
 *        Pixel Coordinate: {{pixelCoordinate.x}}, {{pixelCoordinate.y}}, <br/>
 *        Tile Coordinate: {{tileCoordinate.x}}, {{tileCoordinate.y}} at Zoom Level {{map.getZoom()}}
 *      </div>
 *    </info-window>
 *  </map>
 */
/* global google */
(function() {
  'use strict';

  var infoWindow = function(Attr2Options, $compile, $timeout, $parse)  {
    var parser = Attr2Options;

    var getInfoWindow = function(options, events, element) {
      var infoWindow;

      /**
       * set options
       */
      if (options.position && !(options.position instanceof google.maps.LatLng)) {
        delete options.position;
      }
      infoWindow = new google.maps.InfoWindow(options);

      /**
       * set events
       */
      if (Object.keys(events).length > 0) {
        void 0;
      }
      for (var eventName in events) {
        if (eventName) {
          google.maps.event.addListener(infoWindow, eventName, events[eventName]);
        }
      }

      /**
       * set template ane template-relate functions
       * it must have a container element with ng-non-bindable
       */
      var template = element.html().trim();
      if (angular.element(template).length != 1) {
        throw "info-window working as a template must have a container";
      }
      infoWindow.__template = template.replace(/\s?ng-non-bindable[='"]+/,"");

      infoWindow.__compile = function(scope, anchor) {
        anchor && (scope['this'] = anchor);
        var el = $compile(infoWindow.__template)(scope);
        infoWindow.setContent(el[0]);
        scope.$apply();
      };

      infoWindow.__open = function(map, scope, anchor) {
        $timeout(function() {
          infoWindow.__compile(scope, anchor);
          if (anchor && anchor.getPosition) {
            infoWindow.open(map, anchor);
          } else if (anchor && anchor instanceof google.maps.LatLng) {
            infoWindow.open(map);
            infoWindow.setPosition(anchor);
          } else {
            infoWindow.open(map);
          }
        });
      };

      return infoWindow;
    };

    var linkFunc = function(scope, element, attrs, mapController) {
      element.css('display','none');
      var orgAttrs = parser.orgAttributes(element);
      var filtered = parser.filter(attrs);
      var options = parser.getOptions(filtered, scope);
      var events = parser.getEvents(scope, filtered);
      void 0;

      var address;
      if (options.position && !(options.position instanceof google.maps.LatLng)) {
        address = options.position;
      }
      var infoWindow = getInfoWindow(options, events, element);
      if (address) {
        mapController.getGeoLocation(address).then(function(latlng) {
          infoWindow.setPosition(latlng);
          infoWindow.__open(mapController.map, scope, latlng);
          var geoCallback = attrs.geoCallback;
          geoCallback && $parse(geoCallback)(scope);
        });
      }

      mapController.addObject('infoWindows', infoWindow);
      mapController.observeAttrSetObj(orgAttrs, attrs, infoWindow); /* observers */

      scope.$on('mapInitialized', function(evt, map) {
        infoWindow.visible && infoWindow.__open(map, scope);
        if (infoWindow.visibleOnMarker) {
          var markerId = infoWindow.visibleOnMarker;
          infoWindow.__open(map, scope, map.markers[markerId]);
        }
      });

      /**
       * provide showInfoWindow method to scope
       */

      scope.showInfoWindow  = function(e, id, marker) {
        var infoWindow = mapController.map.infoWindows[id];
        var anchor = marker ? marker : (this.getPosition ? this : null);
        infoWindow.__open(mapController.map, scope, anchor);
      };

      /**
       * provide hideInfoWindow method to scope
       */
      scope.hideInfoWindow  = scope.hideInfoWindow ||
        function(event, id) {
          var infoWindow = mapController.map.infoWindows[id];
          infoWindow.close();
        };

    }; //link

    return {
      restrict: 'E',
      require: '^map',
      link: linkFunc
    };

  }; // infoWindow
  infoWindow.$inject = ['Attr2Options', '$compile', '$timeout', '$parse'];

  angular.module('ngMap').directive('infoWindow', infoWindow);
})();

/**
 * @ngdoc directive
 * @name kml-layer
 * @param Attr2Options {service} convert html attribute to Gogole map api options
 * @description 
 *   renders Kml layer on a map
 *   Requires:  map directive
 *   Restrict To:  Element
 *
 * @attr {Url} url url of the kml layer
 * @attr {KmlLayerOptions} KmlLayerOptions
 *   (https://developers.google.com/maps/documentation/javascript/reference#KmlLayerOptions)  
 * @attr {String} &lt;KmlLayerEvent> Any KmlLayer events, https://developers.google.com/maps/documentation/javascript/reference
 * @example
 * Usage: 
 *   <map MAP_ATTRIBUTES>
 *    <kml-layer ANY_KML_LAYER ANY_KML_LAYER_EVENTS"></kml-layer>
 *   </map>
 *
 * Example: 
 *
 *   <map zoom="11" center="[41.875696,-87.624207]">
 *     <kml-layer url="https://gmaps-samples.googlecode.com/svn/trunk/ggeoxml/cta.kml" ></kml-layer>
 *    </map>
 */
(function() {
  'use strict';

  angular.module('ngMap').directive('kmlLayer', ['Attr2Options', function(Attr2Options) {
    var parser = Attr2Options;
    
    var getKmlLayer = function(options, events) {
      var kmlLayer = new google.maps.KmlLayer(options);
      for (var eventName in events) {
        google.maps.event.addListener(kmlLayer, eventName, events[eventName]);
      }
      return kmlLayer;
    };
    
    return {
      restrict: 'E',
      require: '^map',

      link: function(scope, element, attrs, mapController) {
        var orgAttrs = parser.orgAttributes(element);
        var filtered = parser.filter(attrs);
        var options = parser.getOptions(filtered);
        var events = parser.getEvents(scope, filtered);
        void 0;

        var kmlLayer = getKmlLayer(options, events);
        mapController.addObject('kmlLayers', kmlLayer);
        mapController.observeAttrSetObj(orgAttrs, attrs, kmlLayer);  //observers
        element.bind('$destroy', function() {
          mapController.deleteObject('kmlLayers', kmlLayer);
        });
      }
     }; // return
  }]);
})();

/**
 * @ngdoc directive
 * @name map-data
 * @param Attr2Options {service} convert html attribute to Gogole map api options
 * @description 
 *   set map data
 *   Requires:  map directive
 *   Restrict To:  Element
 *
 * @wn {String} method-name, run map.data[method-name] with attribute value
 * @example
 * Example: 
 *
 *   <map zoom="11" center="[41.875696,-87.624207]">
 *     <map-data load-geo-json="https://storage.googleapis.com/maps-devrel/google.json"></map-data>
 *    </map>
 */
(function() {
  'use strict';

  angular.module('ngMap').directive('mapData', ['Attr2Options', function(Attr2Options) {
    var parser = Attr2Options;
    
    return {
      restrict: 'E',
      require: '^map',

      link: function(scope, element, attrs, mapController) {
        var filtered = parser.filter(attrs);
        var options = parser.getOptions(filtered);
        var events = parser.getEvents(scope, filtered, events);

        void 0;
        scope.$on('mapInitialized', function(event, map) {
          /**
           * options
           */
          for (var key in options) {
            if (key) {
              var val = options[key];
              if (typeof scope[val] === "function") {
                map.data[key](scope[val]);
              } else {
                map.data[key](val);
              }
            } // if (key)
          }

          /**
           * events
           */
          for (var eventName in events) {
            if (events[eventName]) {
              map.data.addListener(eventName, events[eventName]);
            }
          }
        });
      }
     }; // return
  }]);
})();

/**
 * @ngdoc directive
 * @name map-lazy-load
 * @param Attr2Options {service} convert html attribute to Gogole map api options
 * @description 
 *   Requires: Delay the initialization of map directive until the map is ready to be rendered
 *   Restrict To: Attribute 
 *
 * @attr {String} map-lazy-load
      Maps api script source file location.
 *    Example:  
 *      'https://maps.google.com/maps/api/js'   
 * @attr {String} map-lazy-load-params
     Maps api script source file location via angular scope variable.
     Also requires the map-lazy-load attribute to be present in the directive.
     Example: In your controller, set 
       $scope.googleMapsURL = 'https://maps.google.com/maps/api/js?v=3.20&client=XXXXXenter-api-key-hereXXXX'

 * @example
 * Example: 
 *
 *   <div map-lazy-load="http://maps.google.com/maps/api/js">
 *     <map center="Brampton" zoom="10">
 *       <marker position="Brampton"></marker>
 *     </map>
 *   </div>
 *
 *   <div map-lazy-load="http://maps.google.com/maps/api/js" 
 *        map-lazy-load-params="{{googleMapsUrl}}">
 *     <map center="Brampton" zoom="10">
 *       <marker position="Brampton"></marker>
 *     </map>
 *   </div>
 */
(function() {
  'use strict';
  var $timeout, $compile, src, savedHtml;

  var preLinkFunc = function(scope, element, attrs) {
    var mapsUrl = attrs.mapLazyLoadParams || attrs.mapLazyLoad;    
    
    window.lazyLoadCallback = function() {
      void 0;
      $timeout(function() { /* give some time to load */
        element.html(savedHtml);
        $compile(element.contents())(scope);
      }, 100);
    };

    if(window.google === undefined || window.google.maps === undefined) {
      var scriptEl = document.createElement('script');
      void 0;
      scriptEl.src = mapsUrl + (mapsUrl.indexOf('?') > -1 ? '&' : '?') + 'callback=lazyLoadCallback';
      document.body.appendChild(scriptEl);
    } else {
      element.html(savedHtml);
      $compile(element.contents())(scope);
    }
  };

  var compileFunc = function(tElement, tAttrs) {

    (!tAttrs.mapLazyLoad) && void 0;
    savedHtml = tElement.html(); 
    src = tAttrs.mapLazyLoad;

    /**
     * if already loaded, stop processing it
     */
    if (document.querySelector('script[src="'+src+(src.indexOf('?') > -1 ? '&' : '?')+'callback=lazyLoadCallback"]')) {
      return false;
    }

    tElement.html('');  // will compile again after script is loaded
    return {
      pre: preLinkFunc
    };
  };

  var mapLazyLoad = function(_$compile_, _$timeout_) {
    $compile = _$compile_, $timeout = _$timeout_;
    return {
      compile: compileFunc
    }
  };
  mapLazyLoad.$inject = ['$compile','$timeout'];

  angular.module('ngMap').directive('mapLazyLoad', mapLazyLoad);
})();

/**
 * @ngdoc directive
 * @name map-type
 * @param Attr2Options {service} convert html attribute to Gogole map api options
 * @description 
 *   Requires:  map directive
 *   Restrict To:  Element
 *
 * @example
 * Example: 
 *
 *   <map zoom="13" center="34.04924594193164, -118.24104309082031">
 *     <map-type name="coordinate" object="coordinateMapType"></map-type>
 *   </map>
 */
(function() {
  'use strict';

  angular.module('ngMap').directive('mapType', ['Attr2Options', '$window', function(Attr2Options, $window) {
    var parser = Attr2Options;
    
    return {
      restrict: 'E',
      require: '^map',

      link: function(scope, element, attrs, mapController) {
        var mapTypeName = attrs.name, mapTypeObject;
        if (!mapTypeName) {
          throw "invalid map-type name";
        }
        if (attrs.object) {
          var __scope = scope[attrs.object] ? scope : $window;
          mapTypeObject = __scope[attrs.object];
          if (typeof mapTypeObject == "function") {
            mapTypeObject = new mapTypeObject();
          }
        }
        if (!mapTypeObject) {
          throw "invalid map-type object";
        }

        scope.$on('mapInitialized', function(evt, map) {
          map.mapTypes.set(mapTypeName, mapTypeObject);
        });
        mapController.addObject('mapTypes', mapTypeObject);
      }
     }; // return
  }]);
})();

/**
 * @ngdoc directive
 * @memberof ngMap
 * @name map
 * @param Attr2Options {service} convert html attribute to Gogole map api options
 * @description
 *   Implementation of {@link MapController}
 *   Initialize a Google map within a `<div>` tag with given options and register events
 *   It accepts children directives; marker, shape, or marker-clusterer
 *
 *   It initialize map, children tags, then emits message as soon as the action is done
 *   The message emitted from this directive is;
 *     . mapInitialized
 *
 *   Restrict To:
 *     Element
 *
 * @attr {Expression} geo-callback if center is an address or current location, the expression is will be executed when geo-lookup is successful. e.g., geo-callback="showMyStoreInfo()"
 * @attr {Array} geo-fallback-center
 *    The center of map incase geolocation failed. i.e. [0,0]
 * @attr {Boolean} zoom-to-include-markers
 *    When true, map boundary will be changed automatially to include all markers when initialized
 * @attr {Boolean} default-style
 *    When false, the default styling, `display:block;height:300px`, will be ignored.
 * @attr {String} init-event The name of event to initialize this map.
 *    If this option is given, the map won't be initialized until the event is received.
 *    To invoke the event, use $scope.$emit or $scope.$broacast.
 *    i.e. <map init-event="init-map" ng-click="$emit('init-map')" center=... ></map>
 * @attr {String} &lt;MapOption> Any Google map options,
 *    https://developers.google.com/maps/documentation/javascript/reference?csw=1#MapOptions
 * @attr {String} &lt;MapEvent> Any Google map events,
 *    https://rawgit.com/allenhwkim/angularjs-google-maps/master/build/map_events.html
 * @example
 * Usage:
 *   <map MAP_OPTIONS_OR_MAP_EVENTS ..>
 *     ... Any children directives
 *   </map>
 *
 * Example:
 *   <map center="[40.74, -74.18]" on-click="doThat()">
 *   </map>
 *
 *   <map geo-fallback-center="[40.74, -74.18]" zoom-to-inlude-markers="true">
 *   </map>
 */
/* global google */
(function () {
  'use strict';

  function getStyle(el, styleProp) {
    var y;
    if (el.currentStyle) {
      y = el.currentStyle[styleProp];
    } else if (window.getComputedStyle) {
      y = document.defaultView.getComputedStyle(el, null).getPropertyValue(styleProp);
    }
    return y;
  }

  var mapDirective = function (Attr2Options, $timeout, $parse) {
    var parser = Attr2Options;

    /**
     * Initialize map and events
     * @memberof map
     * @param {$scope} scope
     * @param {angular.element} element
     * @param {Hash} attrs
     * @ctrl {MapController} ctrl
     */
    var linkFunc = function (scope, element, attrs, ctrl) {
      var orgAttrs = parser.orgAttributes(element);

      scope.google = google;  //used by $scope.eval in Attr2Options to avoid eval()

      /**
       * create a new `div` inside map tag, so that it does not touch map element
       * https://stackoverflow.com/questions/20955356
       */
      var el = document.createElement("div");
      el.style.width = "100%";
      el.style.height = "100%";
      element.prepend(el);

      /**
       * if style is not given to the map element, set display and height
       */
      if (attrs.defaultStyle !== 'false') {
        if (getStyle(element[0], 'display') != "block") {
          element.css('display', 'block');
        }
        if (getStyle(element[0], 'height').match(/^(0|auto)/)) {
          element.css('height', '300px');
        }
      }

      /**
       * disable drag event
       */
      element[0].addEventListener('dragstart', function (event) {
        event.preventDefault();
        return false;
      });

      /**
       * initialize function
       */
      var initializeMap = function (mapOptions, mapEvents) {
        var map = new google.maps.Map(el, {});
        map.markers = {};
        map.shapes = {};

        /**
         * resize the map to prevent showing partially, in case intialized too early
         */
        $timeout(function () {
          google.maps.event.trigger(map, "resize");
        });

        /**
         * set options
         */
        mapOptions.zoom = mapOptions.zoom || 15;
        var center = mapOptions.center;
        if (!center) {
          mapOptions.center = new google.maps.LatLng(0, 0);
        } else if (!(center instanceof google.maps.LatLng)) {
          delete mapOptions.center;
          ctrl.getGeoLocation(center).then(function (latlng) {
            map.setCenter(latlng);
            var geoCallback = attrs.geoCallback;
            geoCallback && $parse(geoCallback)(scope);
          }, function (error) {
            map.setCenter(options.geoFallbackCenter);
          });
        }
        map.setOptions(mapOptions);

        /**
         * set events
         */
        for (var eventName in mapEvents) {
          if (eventName) {
            google.maps.event.addListener(map, eventName, mapEvents[eventName]);
          }
        }

        /**
         * set observers
         */
        ctrl.observeAttrSetObj(orgAttrs, attrs, map);

        /**
         * set controller and set objects
         * so that map can be used by other directives; marker or shape
         * ctrl._objects are gathered when marker and shape are initialized before map is set
         */
        ctrl.map = map;
        /* so that map can be used by other directives; marker or shape */
        ctrl.addObjects(ctrl._objects);

        // /* providing method to add a marker used by user scope */
        // map.addMarker = ctrl.addMarker;

        /**
         * set map for scope and controller and broadcast map event
         * scope.map will be overwritten if user have multiple maps in a scope,
         * thus the last map will be set as scope.map.
         * however an `mapInitialized` event will be emitted every time.
         */
        scope.map = map;
        scope.map.scope = scope;
        google.maps.event.addListenerOnce(map, "idle", function () {
          scope.$emit('mapInitialized', map);
          if (attrs.zoomToIncludeMarkers) {
            ctrl.zoomToIncludeMarkers();
            if (attrs.zoomToIncludeMarkers == 'auto') {
              scope.$on('objectChanged', function (evt, msg) {
                msg[0] == 'markers' && ctrl.zoomToIncludeMarkers();
              });
            }
          }
        });
      }; // function initializeMap()

      /**
       * get map options and events
       */
      var filtered = parser.filter(attrs);
      var options = parser.getOptions(filtered, scope);
      var controlOptions = parser.getControlOptions(filtered);
      var mapOptions = angular.extend(options, controlOptions);
      var mapEvents = parser.getEvents(scope, filtered);
      void 0;

      if (attrs.initEvent) { // allows controlled initialization
        scope.$on(attrs.initEvent, function () {
          !ctrl.map && initializeMap(mapOptions, mapEvents); // init if not done
        });
      } else {
        initializeMap(mapOptions, mapEvents);
      } // if
    };

    return {
      restrict: 'AE',
      controller: 'MapController',
      link: linkFunc
    };
  };

  angular.module('ngMap').directive('map', ['Attr2Options', '$timeout', '$parse', mapDirective]);
})();

/* global google */
(function() {
  'use strict';

  /**
   * @ngdoc controller
   * @name MapController
   * @param $scope {service}
   * @param $q {service} promise Q
   * @param NavigatorGeolocation {service}
   * @param GeoCoder {service}
   * @param Attr2Options {service} convert html attribute to Gogole map api options
   * @property {Hash} controls collection of Controls initiated within `map` directive
   * @property {Hash} markers collection of Markers initiated within `map` directive
   * @property {Hash} shapes collection of shapes initiated within `map` directive
   */
  var MapController = function($scope, $q, NavigatorGeolocation, GeoCoder, Attr2Options) { 
    var parser = Attr2Options;
    var _this = this;

    var observeAndSet = function(attrs, attrName, object) {
      attrs.$observe(attrName, function(val) {
        if (val) {
          void 0;
          var setMethod = parser.camelCase('set-'+attrName);
          var optionValue = parser.toOptionValue(val, {key: attrName});
          void 0;
          if (object[setMethod]) { //if set method does exist
            /* if an location is being observed */
            if (attrName.match(/center|position/) && 
              typeof optionValue == 'string') {
              _this.getGeoLocation(optionValue).then(function(latlng) {
                object[setMethod](latlng);
              });
            } else {
              object[setMethod](optionValue);
            }
          }
        }
      });
    };

    this.map = null;
    this._objects = []; /* temporary collection of map objects */

    /**
     * Add an object to the collection of group
     * @memberof MapController
     * @function addObject
     * @param groupName the name of collection that object belongs to
     * @param obj  an object to add into a collection, i.e. marker, shape
     */
    this.addObject = function(groupName, obj) {
      /**
       * objects, i.e. markers and shapes, are initialized before map is initialized
       * so, we collect those objects, then, we will add to map when map is initialized
       * However the case as in ng-repeat, we can directly add to map
       */
      if (this.map) {
        this.map[groupName] = this.map[groupName] || {};
        var len = Object.keys(this.map[groupName]).length;
        this.map[groupName][obj.id || len] = obj;
        if (groupName != "infoWindows" && obj.setMap) { //infoWindow.setMap works like infoWindow.open
          obj.setMap && obj.setMap(this.map);
        }
        if (obj.centered && obj.position) {
          this.map.setCenter(obj.position);
        }
        $scope.$emit('objectChanged', [groupName, this.map[groupName]]);
      } else {
        obj.groupName = groupName;
        this._objects.push(obj);
      }
    };

    /**
     * Delete an object from the collection and remove from map
     * @memberof MapController
     * @function deleteObject
     * @param {Array} objs the collection of objects. i.e., map.markers
     * @param {Object} obj the object to be removed. i.e., marker
     */
    this.deleteObject = function(groupName, obj) {
      /* delete from group */
      if (obj.map) {
        var objs = obj.map[groupName];
        for (var name in objs) {
          objs[name] === obj && (delete objs[name]);
        }

        /* delete from map */
        obj.map && obj.setMap && obj.setMap(null);
        $scope.$emit('objectChanged', [groupName, this.map[groupName]]);
      }
    };

    /**
     * Add collected objects to map
     * @memberof MapController
     * @function addObjects
     * @param {Array} objects the collection of objects. i.e., map.markers
     */
    this.addObjects = function(objects) {
      for (var i=0; i<objects.length; i++) {
        var obj=objects[i];
        if (obj instanceof google.maps.Marker) {
          this.addObject('markers', obj);
        } else if (obj instanceof google.maps.Circle ||
          obj instanceof google.maps.Polygon ||
          obj instanceof google.maps.Polyline ||
          obj instanceof google.maps.Rectangle ||
          obj instanceof google.maps.GroundOverlay) {
          this.addObject('shapes', obj);
        } else {
          this.addObject(obj.groupName, obj);
        }
      }
    };

    /**
     * returns the location of an address or 'current-location'
     * @memberof MapController
     * @function getGeoLocation
     * @param {String} string an address to find the location
     * @returns {Promise} latlng the location of the address
     */
    this.getGeoLocation = function(string) {
      var deferred = $q.defer();
      if (!string || string.match(/^current/i)) { // current location
        NavigatorGeolocation.getCurrentPosition().then(
          function(position) {
            var lat = position.coords.latitude;
            var lng = position.coords.longitude;
            var latLng = new google.maps.LatLng(lat,lng);
            deferred.resolve(latLng);
          },
          function(error) {
            deferred.reject(error);
          }
        );
      } else {
        GeoCoder.geocode({address: string}).then(
          function(results) {
            deferred.resolve(results[0].geometry.location);
          },
          function(error) {
            deferred.reject(error);
          }
        );
      }

      return deferred.promise;
    };

    /**
     * watch changes of attribute values and do appropriate action based on attribute name
     * @memberof MapController
     * @function observeAttrSetObj
     * @param {Hash} orgAttrs attributes before its initialization
     * @param {Hash} attrs    attributes after its initialization
     * @param {Object} obj    map object that an action is to be done
     */
    this.observeAttrSetObj = function(orgAttrs, attrs, obj) {
      var attrsToObserve = parser.getAttrsToObserve(orgAttrs);
      if (Object.keys(attrsToObserve).length) {
        void 0;
      }
      for (var i=0; i<attrsToObserve.length; i++) {
        observeAndSet(attrs, attrsToObserve[i], obj);
      }
    };

    /**
     * include all markers
     */
    this.zoomToIncludeMarkers = function() {
      var bounds = new google.maps.LatLngBounds();
      for (var marker in this.map.markers) {
        bounds.extend(this.map.markers[marker].getPosition());
      }
      this.map.fitBounds(bounds);
    };

  }; // MapController

  MapController.$inject = ['$scope', '$q', 'NavigatorGeolocation', 'GeoCoder', 'Attr2Options'];
  angular.module('ngMap').controller('MapController', MapController);
})();

/**
 * @ngdoc directive
 * @name maps-engine-layer
 * @description 
 *   Requires:  map directive
 *   Restrict To:  Element
 *
 * @example
 * Example: 
 *   <map zoom="14" center="[59.322506, 18.010025]">
 *     <maps-engine-layer layer-id="06673056454046135537-08896501997766553811"></maps-engine-layer>
 *    </map>
 */
(function() {
  'use strict';

  angular.module('ngMap').directive('mapsEngineLayer', ['Attr2Options', function(Attr2Options) {
    var parser = Attr2Options;

    var getMapsEngineLayer = function(options, events) {
      var layer = new google.maps.visualization.MapsEngineLayer(options);

      for (var eventName in events) {
        google.maps.event.addListener(layer, eventName, events[eventName]);
      }

      return layer;
    };

    
    return {
      restrict: 'E',
      require: '^map',

      link: function(scope, element, attrs, mapController) {
        var filtered = parser.filter(attrs);
        var options = parser.getOptions(filtered);
        var events = parser.getEvents(scope, filtered, events);
        void 0;

        var layer = getMapsEngineLayer(options, events);
        mapController.addObject('mapsEngineLayers', layer);
      }
     }; // return
  }]);
})();

/**
 * @ngdoc directive
 * @name marker
 * @param Attr2Options {service} convert html attribute to Gogole map api options
 * @param NavigatorGeolocation It is used to find the current location
 * @description 
 *   Draw a Google map marker on a map with given options and register events  
 *   
 *   Requires:  map directive
 *
 *   Restrict To:  Element 
 *
 * @attr {String} position address, 'current', or [latitude, longitude]  
 *    example:  
 *      '1600 Pennsylvania Ave, 20500  Washingtion DC',   
 *      'current position',  
 *      '[40.74, -74.18]'  
 * @attr {Boolean} centered if set, map will be centered with this marker
 * @attr {Expression} geo-callback if position is an address, the expression is will be performed when geo-lookup is successful. e.g., geo-callback="showStoreInfo()"
 * @attr {String} &lt;MarkerOption> [Any Marker options](https://developers.google.com/maps/documentation/javascript/reference?csw=1#MarkerOptions) 
 * @attr {String} &lt;MapEvent> [Any Marker events](https://developers.google.com/maps/documentation/javascript/reference)
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
/* global google */
(function() {
  'use strict';

  var getMarker = function(options, events) {
    var marker;

    /**
     * set options
     */
    if (options.icon instanceof Object) {
      if ((""+options.icon.path).match(/^[A-Z_]+$/)) {
        options.icon.path =  google.maps.SymbolPath[options.icon.path];
      }
      for (var key in options.icon) {
        var arr = options.icon[key];
        if (key == "anchor" || key == "origin") {
          options.icon[key] = new google.maps.Point(arr[0], arr[1]);
        } else if (key == "size" || key == "scaledSize") {
          options.icon[key] = new google.maps.Size(arr[0], arr[1]);
        } 
      }
    }
    if (!(options.position instanceof google.maps.LatLng)) {
      options.position = new google.maps.LatLng(0,0);
    } 
    marker = new google.maps.Marker(options);

    /**
     * set events
     */
    if (Object.keys(events).length > 0) {
      void 0;
    }
    for (var eventName in events) {
      if (eventName) {
        google.maps.event.addListener(marker, eventName, events[eventName]);
      }
    }

    return marker;
  };

  var marker = function(Attr2Options, $parse) {
    var parser = Attr2Options;
    var linkFunc = function(scope, element, attrs, mapController) {
      var orgAttrs = parser.orgAttributes(element);
      var filtered = parser.filter(attrs);
      var markerOptions = parser.getOptions(filtered, scope);
      var markerEvents = parser.getEvents(scope, filtered);
      void 0;

      var address;
      if (!(markerOptions.position instanceof google.maps.LatLng)) {
        address = markerOptions.position;
      }
      var marker = getMarker(markerOptions, markerEvents);
      mapController.addObject('markers', marker);
      if (address) {
        mapController.getGeoLocation(address).then(function(latlng) {
          marker.setPosition(latlng);
          markerOptions.centered && marker.map.setCenter(latlng);
          var geoCallback = attrs.geoCallback;
          geoCallback && $parse(geoCallback)(scope);
        });
      }

      /**
       * set observers
       */
      mapController.observeAttrSetObj(orgAttrs, attrs, marker); /* observers */
      element.bind('$destroy', function() {
        mapController.deleteObject('markers', marker);
      });
    };

    return {
      restrict: 'E',
      require: '^map',
      link: linkFunc
    };
  };

  marker.$inject = ['Attr2Options', '$parse'];
  angular.module('ngMap').directive('marker', marker); 

})();

/**
 * @ngdoc directive
 * @name overlay-map-type
 * @param Attr2Options {service} convert html attribute to Gogole map api options
 * @param $window {service} 
 * @description 
 *   Requires:  map directive
 *   Restrict To:  Element
 *
 * @example
 * Example: 
 *
 *   <map zoom="13" center="34.04924594193164, -118.24104309082031">
 *     <overlay-map-type index="0" object="coordinateMapType"></map-type>
 *   </map>
 */
(function() {
  'use strict';

  angular.module('ngMap').directive('overlayMapType', ['Attr2Options', '$window', function(Attr2Options, $window) {
    var parser = Attr2Options;
    
    return {
      restrict: 'E',
      require: '^map',

      link: function(scope, element, attrs, mapController) {
        var overlayMapTypeObject;
        var initMethod = attrs.initMethod || "insertAt";
        if (attrs.object) {
          var __scope = scope[attrs.object] ? scope : $window;
          overlayMapTypeObject = __scope[attrs.object];
          if (typeof overlayMapTypeObject == "function") {
            overlayMapTypeObject = new overlayMapTypeObject();
          }
        }
        if (!overlayMapTypeObject) {
          throw "invalid map-type object";
        }

        scope.$on('mapInitialized', function(evt, map) {
          if (initMethod == "insertAt") {
            var index = parseInt(attrs.index, 10);
            map.overlayMapTypes.insertAt(index, overlayMapTypeObject);
          } else if (initMethod == "push") {
            map.overlayMapTypes.push(overlayMapTypeObject);
          }
        });
        mapController.addObject('overlayMapTypes', overlayMapTypeObject);
      }
     }; // return
  }]);
})();

/**
 * @ngdoc directive
 * @name places-auto-complete
 * @param Attr2Options {service} convert html attribute to Gogole map api options
 * @description 
 *   Provides address auto complete feature to an input element
 *   Requires: input tag
 *   Restrict To: Attribute
 *
 * @attr {AutoCompleteOptions} [Any AutocompleteOptions](https://developers.google.com/maps/documentation/javascript/3.exp/reference#AutocompleteOptions)
 *
 * @example
 * Example: 
 *   <script src="https://maps.googleapis.com/maps/api/js?libraries=places"></script>
 *   <input places-auto-complete types="['geocode']" on-place-changed="myCallback(place)" />
 */
/* global google */
(function() {
  'use strict';

  var placesAutoComplete = function(Attr2Options, $timeout) {
    var parser = Attr2Options;

    var linkFunc = function(scope, element, attrs, ngModelCtrl) {
      var filtered = parser.filter(attrs);
      var options = parser.getOptions(filtered);
      var events = parser.getEvents(scope, filtered);
      void 0;
      var autocomplete = new google.maps.places.Autocomplete(element[0], options);
      for (var eventName in events) {
        google.maps.event.addListener(autocomplete, eventName, events[eventName]);
      }

      var updateModel = function() {
        $timeout(function(){
          ngModelCtrl && ngModelCtrl.$setViewValue(element.val());
        },100);
      }
      google.maps.event.addListener(autocomplete, 'place_changed', updateModel);
      element[0].addEventListener('change', updateModel);

      attrs.$observe('types', function(val) {
        if (val) {
          void 0;
          var optionValue = parser.toOptionValue(val, {key: 'types'});
          void 0;
          autocomplete.setTypes(optionValue);
        }
      });
    };

    return {
      restrict: 'A',
      require: '?ngModel',
      link: linkFunc
    };
  };

  placesAutoComplete.$inject = ['Attr2Options', '$timeout'];
  angular.module('ngMap').directive('placesAutoComplete', placesAutoComplete); 

})();

/**
 * @ngdoc directive
 * @name shape
 * @param Attr2Options {service} convert html attribute to Gogole map api options
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
 * @attr {Expression} geo-callback if shape is a circle and the center is an address, the expression is will be performed when geo-lookup is successful. e.g., geo-callback="showDetail()"
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
/* global google */
(function() {
  'use strict';

  var getBounds = function(points) {
    return new google.maps.LatLngBounds(points[0], points[1]);
  };
  
  var getShape = function(options, events) {
    var shape;

    var shapeName = options.name;
    delete options.name;  //remove name bcoz it's not for options
    void 0;

    /**
     * set options
     */
    if (options.icons) {
      for (var i=0; i<options.icons.length; i++) {
        var el = options.icons[i];
        if (el.icon.path.match(/^[A-Z_]+$/)) {
          el.icon.path =  google.maps.SymbolPath[el.icon.path];
        }
      }
    }
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
        if (options.bounds) {
          options.bounds = getBounds(options.bounds);
        }
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
    for (var eventName in events) {
      if (events[eventName]) {
        google.maps.event.addListener(shape, eventName, events[eventName]);
      }
    }
    return shape;
  };

  var shape = function(Attr2Options, $parse) {
    var parser = Attr2Options;

    var linkFunc = function(scope, element, attrs, mapController) {
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
        mapController.getGeoLocation(address).then(function(latlng) {
          shape.setCenter(latlng);
          shape.centered && shape.map.setCenter(latlng);
          var geoCallback = attrs.geoCallback;
          geoCallback && $parse(geoCallback)(scope);
        });
      }

      /**
       * set observers
       */
      mapController.observeAttrSetObj(orgAttrs, attrs, shape); 
      element.bind('$destroy', function() {
        mapController.deleteObject('shapes', shape);
      });
    };

    return {
      restrict: 'E',
      require: '^map',
      link: linkFunc
     }; // return
  };
  shape.$inject = ['Attr2Options', '$parse'];

  angular.module('ngMap').directive('shape', shape);

})();

/**
 * @ngdoc directive
 * @name streetview-panorama
 * @param Attr2Options {service} convert html attribute to Gogole map api options
 * @description
 *   Requires:  map directive
 *   Restrict To:  Element
 *
 * @attr container Optional, id or css selector, if given, streetview will be in the given html element
 * @attr {String} &lt;StreetViewPanoramaOption> [Any Google StreetViewPanorama options](https://developers.google.com/maps/documentation/javascript/reference?csw=1#StreetViewPanoramaOptions)
 * @attr {String} &lt;StreetViewPanoramaEvent> [Any Google StreetViewPanorama events](https://developers.google.com/maps/documentation/javascript/reference#StreetViewPanorama)
 *
 * @example
 *   <map zoom="11" center="[40.688738,-74.043871]" >
 *     <street-view-panorama
 *       click-to-go="true"
 *       disable-default-ui="true"
 *       disable-double-click-zoom="true"
 *       enable-close-button="true"
 *       pano="my-pano"
 *       position="40.688738,-74.043871"
 *       pov="{heading:0, pitch: 90}"
 *       scrollwheel="false"
 *       visible="true">
 *     </street-view-panorama>
 *   </map>
 */
/* global google */
(function() {
  'use strict';
   
  var streetViewPanorama = function(Attr2Options) {
    var parser = Attr2Options;
  
    var getStreetViewPanorama = function(map, options, events) {
      var svp, container;
      if (options.container) {
        container = document.getElementById(options.container);
        container = container || document.querySelector(options.container);
      }
      if (container) {
        svp = new google.maps.StreetViewPanorama(container, options);
      } else {
        svp = map.getStreetView();
        svp.setOptions(options);
      }

      for (var eventName in events) {
        eventName &&
          google.maps.event.addListener(svp, eventName, events[eventName]);
      }
      return svp;
    };

    var linkFunc = function(scope, element, attrs, mapController) {
      var orgAttrs = parser.orgAttributes(element);
      var filtered = parser.filter(attrs);
      var options = parser.getOptions(filtered);
      var controlOptions = parser.getControlOptions(filtered);
      var svpOptions = angular.extend(options, controlOptions);

      var svpEvents = parser.getEvents(scope, filtered);
      void 0;
 
      scope.$on('mapInitialized', function(evt, map) {
        var svp = getStreetViewPanorama(map, svpOptions, svpEvents);

        map.setStreetView(svp);
        (!svp.getPosition()) && svp.setPosition(map.getCenter());
        google.maps.event.addListener(svp, 'position_changed', function() {
          if (svp.getPosition() !== map.getCenter()) {
            map.setCenter(svp.getPosition());
          }
        });
        //needed for geo-callback
        var listener = google.maps.event.addListener(map, 'center_changed', function() {
          svp.setPosition(map.getCenter());
          google.maps.event.removeListener(listener);
        });
      });

    }; //link

    return {
      restrict: 'E',
      require: '^map',
      link: linkFunc
    };

  };
  streetViewPanorama.$inject = ['Attr2Options'];

  angular.module('ngMap').directive('streetViewPanorama', streetViewPanorama);
})();

/**
 * @ngdoc directive
 * @name traffic-layer
 * @param Attr2Options {service} convert html attribute to Gogole map api options
 * @description 
 *   Requires:  map directive
 *   Restrict To:  Element
 *
 * @example
 * Example: 
 *
 *   <map zoom="13" center="34.04924594193164, -118.24104309082031">
 *     <traffic-layer></traffic-layer>
 *    </map>
 */
(function() {
  'use strict';

  angular.module('ngMap').directive('trafficLayer', ['Attr2Options', function(Attr2Options) {
    var parser = Attr2Options;
    
    var getLayer = function(options, events) {
      var layer = new google.maps.TrafficLayer(options);
      for (var eventName in events) {
        google.maps.event.addListener(layer, eventName, events[eventName]);
      }
      return layer;
    };
    
    return {
      restrict: 'E',
      require: '^map',

      link: function(scope, element, attrs, mapController) {
        var orgAttrs = parser.orgAttributes(element);
        var filtered = parser.filter(attrs);
        var options = parser.getOptions(filtered);
        var events = parser.getEvents(scope, filtered);
        void 0;

        var layer = getLayer(options, events);
        mapController.addObject('trafficLayers', layer);
        mapController.observeAttrSetObj(orgAttrs, attrs, layer);  //observers
        element.bind('$destroy', function() {
          mapController.deleteObject('trafficLayers', layer);
        });
      }
     }; // return
  }]);
})();

/**
 * @ngdoc directive
 * @name transit-layer
 * @param Attr2Options {service} convert html attribute to Gogole map api options
 * @description 
 *   Requires:  map directive
 *   Restrict To:  Element
 *
 * @example
 * Example: 
 *
 *   <map zoom="13" center="34.04924594193164, -118.24104309082031">
 *     <transit-layer></transit-layer>
 *    </map>
 */
(function() {
  'use strict';

  angular.module('ngMap').directive('transitLayer', ['Attr2Options', function(Attr2Options) {
    var parser = Attr2Options;
    
    var getLayer = function(options, events) {
      var layer = new google.maps.TransitLayer(options);
      for (var eventName in events) {
        google.maps.event.addListener(layer, eventName, events[eventName]);
      }
      return layer;
    };
    
    return {
      restrict: 'E',
      require: '^map',

      link: function(scope, element, attrs, mapController) {
        var orgAttrs = parser.orgAttributes(element);
        var filtered = parser.filter(attrs);
        var options = parser.getOptions(filtered);
        var events = parser.getEvents(scope, filtered);
        void 0;

        var layer = getLayer(options, events);
        mapController.addObject('transitLayers', layer);
        mapController.observeAttrSetObj(orgAttrs, attrs, layer);  //observers
        element.bind('$destroy', function() {
          mapController.deleteObject('transitLayers', layer);
        });
      }
     }; // return
  }]);
})();

/**
 * @ngdoc directive
 * @name weather-layer
 * @param Attr2Options {service} convert html attribute to Gogole map api options
 * @description 
 *   Requires:  map directive
 *   Restrict To:  Element
 *
 * @example
 * Example: 
 *
 *   <map zoom="13" center="34.04924594193164, -118.24104309082031">
 *     <weather-layer></weather-layer>
 *    </map>
 */
(function() {
  'use strict';

  angular.module('ngMap').directive('weatherLayer', ['Attr2Options', function(Attr2Options) {
    var parser = Attr2Options;
    
    var getLayer = function(options, events) {
      var layer = new google.maps.weather.WeatherLayer(options);
      for (var eventName in events) {
        google.maps.event.addListener(layer, eventName, events[eventName]);
      }
      return layer;
    };
    
    return {
      restrict: 'E',
      require: '^map',

      link: function(scope, element, attrs, mapController) {
        var orgAttrs = parser.orgAttributes(element);
        var filtered = parser.filter(attrs);
        var options = parser.getOptions(filtered);
        var events = parser.getEvents(scope, filtered);

        void 0;

        var layer = getLayer(options, events);
        mapController.addObject('weatherLayers', layer);
        mapController.observeAttrSetObj(orgAttrs, attrs, layer);  //observers
        element.bind('$destroy', function() {
          mapController.deleteObject('weatherLayers', layer);
        });
      }
     }; // return
  }]);
})();
