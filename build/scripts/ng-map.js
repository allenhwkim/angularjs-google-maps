angular.module('ngMap', []);

/**
 * @ngdoc controller
 * @name MapController
 */
(function() {
  'use strict';
  var Attr2MapOptions;

  var __MapController = function(
      $scope, $element, $attrs, $parse, _Attr2MapOptions_, NgMap, NgMapPool
    ) {
    Attr2MapOptions = _Attr2MapOptions_;
    var vm = this;

    vm.mapOptions; /** @memberof __MapController */
    vm.mapEvents;  /** @memberof __MapController */

    /**
     * Add an object to the collection of group
     * @memberof __MapController
     * @function addObject
     * @param groupName the name of collection that object belongs to
     * @param obj  an object to add into a collection, i.e. marker, shape
     */
    vm.addObject = function(groupName, obj) {
      if (vm.map) {
        vm.map[groupName] = vm.map[groupName] || {};
        var len = Object.keys(vm.map[groupName]).length;
        vm.map[groupName][obj.id || len] = obj;

        if (vm.map instanceof google.maps.Map) {
          //infoWindow.setMap works like infoWindow.open
          if (groupName != "infoWindows" && obj.setMap) {
            obj.setMap && obj.setMap(vm.map);
          }
          if (obj.centered && obj.position) {
            vm.map.setCenter(obj.position);
          }
          (groupName == 'markers') && vm.objectChanged('markers');
          (groupName == 'customMarkers') && vm.objectChanged('customMarkers');
        }
      }
    };

    /**
     * Delete an object from the collection and remove from map
     * @memberof __MapController
     * @function deleteObject
     * @param {Array} objs the collection of objects. i.e., map.markers
     * @param {Object} obj the object to be removed. i.e., marker
     */
    vm.deleteObject = function(groupName, obj) {
      /* delete from group */
      if (obj.map) {
        var objs = obj.map[groupName];
        for (var name in objs) {
          if (objs[name] === obj) {
            google.maps.event.clearInstanceListeners(obj);
            delete objs[name];
          }
        }

        /* delete from map */
        obj.map && obj.setMap && obj.setMap(null);

        (groupName == 'markers') && vm.objectChanged('markers');
        (groupName == 'customMarkers') && vm.objectChanged('customMarkers');
      }
    };

    /**
     * @memberof __MapController
     * @function observeAttrSetObj
     * @param {Hash} orgAttrs attributes before its initialization
     * @param {Hash} attrs    attributes after its initialization
     * @param {Object} obj    map object that an action is to be done
     * @description watch changes of attribute values and
     * do appropriate action based on attribute name
     */
    vm.observeAttrSetObj = function(orgAttrs, attrs, obj) {
      if (attrs.noWatcher) {
        return false;
      }
      var attrsToObserve = Attr2MapOptions.getAttrsToObserve(orgAttrs);
      for (var i=0; i<attrsToObserve.length; i++) {
        var attrName = attrsToObserve[i];
        attrs.$observe(attrName, NgMap.observeAndSet(attrName, obj));
      }
    };

    /**
     * @memberof __MapController
     * @function zoomToIncludeMarkers
     */
    vm.zoomToIncludeMarkers = function() {
      var bounds = new google.maps.LatLngBounds();
      for (var k1 in vm.map.markers) {
        bounds.extend(vm.map.markers[k1].getPosition());
      }
      for (var k2 in vm.map.customMarkers) {
        bounds.extend(vm.map.customMarkers[k2].getPosition());
      }
      vm.map.fitBounds(bounds);
    };

    /**
     * @memberof __MapController
     * @function objectChanged
     * @param {String} group name of group e.g., markers
     */
    vm.objectChanged = function(group) {
      if ( vm.map &&
        (group == 'markers' || group == 'customMarkers') &&
        vm.map.zoomToIncludeMarkers == 'auto'
      ) {
        vm.zoomToIncludeMarkers();
      }
    };

    /**
     * @memberof __MapController
     * @function initializeMap
     * @description
     *  . initialize Google map on <div> tag
     *  . set map options, events, and observers
     *  . reset zoom to include all (custom)markers
     */
    vm.initializeMap = function() {
      var mapOptions = vm.mapOptions,
          mapEvents = vm.mapEvents;

      var lazyInitMap = vm.map; //prepared for lazy init
      vm.map = NgMapPool.getMapInstance($element[0]);
      NgMap.setStyle($element[0]);

      // set objects for lazyInit
      if (lazyInitMap) {

        /** 
         * rebuild mapOptions for lazyInit 
         * becasue attributes values might have been changed
         */
        var filtered = Attr2MapOptions.filter($attrs);
        var options = Attr2MapOptions.getOptions(filtered);
        var controlOptions = Attr2MapOptions.getControlOptions(filtered);
        mapOptions = angular.extend(options, controlOptions);
        void 0;

        for (var group in lazyInitMap) {
          var groupMembers = lazyInitMap[group]; //e.g. markers
          if (typeof groupMembers == 'object') {
            for (var id in groupMembers) {
              vm.addObject(group, groupMembers[id]); 
            }
          }
        }
        vm.map.showInfoWindow = vm.showInfoWindow;
        vm.map.hideInfoWindow = vm.hideInfoWindow;
      }

      // set options
      mapOptions.zoom = mapOptions.zoom || 15;
      var center = mapOptions.center;
      if (!mapOptions.center ||
        ((typeof center === 'string') && center.match(/\{\{.*\}\}/))
      ) {
        mapOptions.center = new google.maps.LatLng(0, 0);
      } else if (!(center instanceof google.maps.LatLng)) {
        var geoCenter = mapOptions.center;
        delete mapOptions.center;
        NgMap.getGeoLocation(geoCenter, mapOptions.geoLocationOptions).
          then(function (latlng) {
            vm.map.setCenter(latlng);
            var geoCallback = mapOptions.geoCallback;
            geoCallback && $parse(geoCallback)($scope);
          }, function () {
            if (mapOptions.geoFallbackCenter) {
              vm.map.setCenter(mapOptions.geoFallbackCenter);
            }
          });
      }
      vm.map.setOptions(mapOptions);

      // set events
      for (var eventName in mapEvents) {
        google.maps.event.addListener(vm.map, eventName, mapEvents[eventName]);
      }

      // set observers
      vm.observeAttrSetObj(orgAttrs, $attrs, vm.map);
      vm.singleInfoWindow = mapOptions.singleInfoWindow;

      google.maps.event.addListenerOnce(vm.map, "idle", function () {
        NgMap.addMap(vm);
        if (mapOptions.zoomToIncludeMarkers) {
          vm.zoomToIncludeMarkers();
        }
        //TODO: it's for backward compatibiliy. will be removed
        $scope.map = vm.map;
        $scope.$emit('mapInitialized', vm.map);

        //callback
        if ($attrs.mapInitialized) {
          $parse($attrs.mapInitialized)($scope, {map: vm.map});
        }
      });
    };

    $scope.google = google; //used by $scope.eval to avoid eval()

    /**
     * get map options and events
     */
    var orgAttrs = Attr2MapOptions.orgAttributes($element);
    var filtered = Attr2MapOptions.filter($attrs);
    var options = Attr2MapOptions.getOptions(filtered, {scope: $scope});
    var controlOptions = Attr2MapOptions.getControlOptions(filtered);
    var mapOptions = angular.extend(options, controlOptions);
    var mapEvents = Attr2MapOptions.getEvents($scope, filtered);
    void 0;
    Object.keys(mapEvents).length && void 0;

    vm.mapOptions = mapOptions;
    vm.mapEvents = mapEvents;

    if (options.lazyInit) { // allows controlled initialization
      vm.map = {id: $attrs.id}; //set empty, not real, map
      NgMap.addMap(vm);
    } else {
      vm.initializeMap();
    }

    $element.bind('$destroy', function() {
      NgMapPool.returnMapInstance(vm.map);
      NgMap.deleteMap(vm);
    });
  }; // __MapController

  __MapController.$inject = [
    '$scope', '$element', '$attrs', '$parse', 'Attr2MapOptions', 'NgMap', 'NgMapPool'
  ];
  angular.module('ngMap').controller('__MapController', __MapController);
})();

/**
 * @ngdoc directive
 * @name bicycling-layer
 * @param Attr2Options {service}
 *   convert html attribute to Gogole map api options
 * @description
 *   Requires:  map directive
 *   Restrict To:  Element
 *
 * @example
 *
 *   <map zoom="13" center="34.04924594193164, -118.24104309082031">
 *     <bicycling-layer></bicycling-layer>
 *    </map>
 */
(function() {
  'use strict';
  var parser;

  var linkFunc = function(scope, element, attrs, mapController) {
    mapController = mapController[0]||mapController[1];
    var orgAttrs = parser.orgAttributes(element);
    var filtered = parser.filter(attrs);
    var options = parser.getOptions(filtered, {scope: scope});
    var events = parser.getEvents(scope, filtered);

    void 0;

    var layer = getLayer(options, events);
    mapController.addObject('bicyclingLayers', layer);
    mapController.observeAttrSetObj(orgAttrs, attrs, layer);  //observers
    element.bind('$destroy', function() {
      mapController.deleteObject('bicyclingLayers', layer);
    });
  };

  var getLayer = function(options, events) {
    var layer = new google.maps.BicyclingLayer(options);
    for (var eventName in events) {
      google.maps.event.addListener(layer, eventName, events[eventName]);
    }
    return layer;
  };

  var bicyclingLayer= function(Attr2MapOptions) {
    parser = Attr2MapOptions;
    return {
      restrict: 'E',
      require: ['?^map','?^ngMap'],
      link: linkFunc
     };
  };
  bicyclingLayer.$inject = ['Attr2MapOptions'];

  angular.module('ngMap').directive('bicyclingLayer', bicyclingLayer);
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
  var parser, $compile, NgMap;

  var linkFunc = function(scope, element, attrs, mapController) {
    mapController = mapController[0]||mapController[1];
    var filtered = parser.filter(attrs);
    var options = parser.getOptions(filtered, {scope: scope});
    var events = parser.getEvents(scope, filtered);

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
    NgMap.getMap().then(function(map) {
      var position = options.position;
      map.controls[google.maps.ControlPosition[position]].push(customControlEl);
    });

  };

  var customControl =  function(Attr2MapOptions, _$compile_, _NgMap_)  {
    parser = Attr2MapOptions, $compile = _$compile_, NgMap = _NgMap_;

    return {
      restrict: 'E',
      require: ['?^map','?^ngMap'],
      link: linkFunc
    }; // return
  };
  customControl.$inject = ['Attr2MapOptions', '$compile', 'NgMap'];

  angular.module('ngMap').directive('customControl', customControl);
})();

/**
 * @ngdoc directive
 * @memberof ngmap
 * @name custom-marker
 * @param Attr2Options {service} convert html attribute to Gogole map api options
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
/* global document */
(function() {
  'use strict';
  var parser, $timeout, $compile, NgMap;

  var CustomMarker = function(options) {
    options = options || {};

    this.el = document.createElement('div');
    this.el.style.display = 'inline-block';
    this.visible = true;
    for (var key in options) { /* jshint ignore:line */
     this[key] = options[key];
    }
  };

  var setCustomMarker = function() {

    CustomMarker.prototype = new google.maps.OverlayView();

    CustomMarker.prototype.setContent = function(html, scope) {
      this.el.innerHTML = html;
      this.el.style.position = 'absolute';
      if (scope) {
        $compile(angular.element(this.el).contents())(scope);
      }
    };

    CustomMarker.prototype.getDraggable = function() {
      return this.draggable;
    };

    CustomMarker.prototype.setDraggable = function(draggable) {
      this.draggable = draggable;
    };

    CustomMarker.prototype.getPosition = function() {
      return this.position;
    };

    CustomMarker.prototype.setPosition = function(position) {
      position && (this.position = position); /* jshint ignore:line */
      if (this.getProjection() && typeof this.position.lng == 'function') {
        var posPixel = this.getProjection().fromLatLngToDivPixel(this.position);
        var x = Math.round(posPixel.x - (this.el.offsetWidth/2));
        var y = Math.round(posPixel.y - this.el.offsetHeight - 10); // 10px for anchor
        this.el.style.left = x + "px";
        this.el.style.top = y + "px";
      }
    };

    CustomMarker.prototype.setZIndex = function(zIndex) {
      zIndex && (this.zIndex = zIndex); /* jshint ignore:line */
      this.el.style.zIndex = this.zIndex;
    };

    CustomMarker.prototype.setVisible = function(visible) {
      this.el.style.display = visible ? 'inline-block' : 'none';
      this.visible = visible;
    };

    CustomMarker.prototype.addClass = function(className) {
      var classNames = this.el.className.trim().split(' ');
      (classNames.indexOf(className) == -1) && classNames.push(className); /* jshint ignore:line */
      this.el.className = classNames.join(' ');
    };

    CustomMarker.prototype.removeClass = function(className) {
      var classNames = this.el.className.split(' ');
      var index = classNames.indexOf(className);
      (index > -1) && classNames.splice(index, 1); /* jshint ignore:line */
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
      //this.el = null;
    };
  };

  var linkFunc = function(orgHtml, varsToWatch) {
    //console.log('orgHtml', orgHtml, 'varsToWatch', varsToWatch);

    return function(scope, element, attrs, mapController) {
      mapController = mapController[0]||mapController[1];
      var orgAttrs = parser.orgAttributes(element);

      var filtered = parser.filter(attrs);
      var options = parser.getOptions(filtered, {scope: scope});
      var events = parser.getEvents(scope, filtered);

      /**
       * build a custom marker element
       */
      var removedEl = element[0].parentElement.removeChild(element[0]);
      void 0;
      var customMarker = new CustomMarker(options);

      $timeout(function() { //apply contents, class, and location after it is compiled
        scope.$watch('[' + varsToWatch.join(',') + ']', function() {
          customMarker.setContent(orgHtml, scope);
        });

        customMarker.setContent(removedEl.innerHTML, scope);
        var classNames = removedEl.firstElementChild.className;
        customMarker.addClass('custom-marker');
        customMarker.addClass(classNames);
        void 0;

        if (!(options.position instanceof google.maps.LatLng)) {
          NgMap.getGeoLocation(options.position).then(
            function(latlng) {
              customMarker.setPosition(latlng);
            }
          );
        }
      });

      void 0;
      for (var eventName in events) { /* jshint ignore:line */
        google.maps.event.addDomListener(
          customMarker.el, eventName, events[eventName]);
      }
      mapController.addObject('customMarkers', customMarker);

      //set observers
      mapController.observeAttrSetObj(orgAttrs, attrs, customMarker);

      element.bind('$destroy', function() {
        //Is it required to remove event listeners when DOM is removed?
        mapController.deleteObject('customMarkers', customMarker);
      });

    }; // linkFunc
  };


  var customMarkerDirective = function(
      _$timeout_, _$compile_, Attr2MapOptions, _NgMap_
    )  {
    parser = Attr2MapOptions;
    $timeout = _$timeout_;
    $compile = _$compile_;
    NgMap = _NgMap_;

    return {
      restrict: 'E',
      require: ['?^map','?^ngMap'],
      compile: function(element) {
        setCustomMarker();
        element[0].style.display ='none';
        var orgHtml = element.html();
        var matches = orgHtml.match(/{{([^}]+)}}/g);
        var varsToWatch = [];
        //filter out that contains '::', 'this.'
        (matches || []).forEach(function(match) {
          var toWatch = match.replace('{{','').replace('}}','');
          if (match.indexOf('::') == -1 &&
            match.indexOf('this.') == -1 &&
            varsToWatch.indexOf(toWatch) == -1) {
            varsToWatch.push(match.replace('{{','').replace('}}',''));
          }
        });

        return linkFunc(orgHtml, varsToWatch);
      }
    }; // return
  };// function
  customMarkerDirective.$inject =
    ['$timeout', '$compile', 'Attr2MapOptions', 'NgMap'];

  angular.module('ngMap').directive('customMarker', customMarkerDirective);
})();

/**
 * @ngdoc directive
 * @name directions
 * @description
 *   Enable directions on map.
 *   e.g., origin, destination, draggable, waypoints, etc
 *
 *   Requires:  map directive
 *
 *   Restrict To:  Element
 *
 * @attr {String} DirectionsRendererOptions
 *   [Any DirectionsRendererOptions](https://developers.google.com/maps/documentation/javascript/reference#DirectionsRendererOptions)
 * @attr {String} DirectionsRequestOptions
 *   [Any DirectionsRequest options](https://developers.google.com/maps/documentation/javascript/reference#DirectionsRequest)
 * @example
 *  <map zoom="14" center="37.7699298, -122.4469157">
 *    <directions
 *      draggable="true"
 *      panel="directions-panel"
 *      travel-mode="{{travelMode}}"
 *      waypoints="[{location:'kingston', stopover:true}]"
 *      origin="{{origin}}"
 *      destination="{{destination}}">
 *    </directions>
 *  </map>
 */
/* global document */
(function() {
  'use strict';
  var NgMap, $timeout, NavigatorGeolocation;

  var getDirectionsRenderer = function(options, events) {
    if (options.panel) {
      options.panel = document.getElementById(options.panel) ||
        document.querySelector(options.panel);
    }
    var renderer = new google.maps.DirectionsRenderer(options);
    for (var eventName in events) {
      google.maps.event.addListener(renderer, eventName, events[eventName]);
    }
    return renderer;
  };

  var updateRoute = function(renderer, options) {
    var directionsService = new google.maps.DirectionsService();

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
      if(request.waypoints == "[]" || request.waypoints === "") {
        delete request.waypoints;
      }
    }

    var showDirections = function(request) {
      directionsService.route(request, function(response, status) {
        if (status == google.maps.DirectionsStatus.OK) {
          $timeout(function() {
            renderer.setDirections(response);
          });
        }
      });
    };

    if (request.origin && request.destination) {
      if (request.origin == 'current-location') {
        NavigatorGeolocation.getCurrentPosition().then(function(ll) {
          request.origin = new google.maps.LatLng(ll.coords.latitude, ll.coords.longitude);
          showDirections(request);
        });
      } else if (request.destination == 'current-location') {
        NavigatorGeolocation.getCurrentPosition().then(function(ll) {
          request.destination = new google.maps.LatLng(ll.coords.latitude, ll.coords.longitude);
          showDirections(request);
        });
      } else {
        showDirections(request);
      }
    }
  };

  var directions = function(
      Attr2MapOptions, _$timeout_, _NavigatorGeolocation_, _NgMap_) {
    var parser = Attr2MapOptions;
    NgMap = _NgMap_;
    $timeout = _$timeout_;
    NavigatorGeolocation = _NavigatorGeolocation_;

    var linkFunc = function(scope, element, attrs, mapController) {
      mapController = mapController[0]||mapController[1];

      var orgAttrs = parser.orgAttributes(element);
      var filtered = parser.filter(attrs);
      var options = parser.getOptions(filtered, {scope: scope});
      var events = parser.getEvents(scope, filtered);
      var attrsToObserve = parser.getAttrsToObserve(orgAttrs);

      var renderer = getDirectionsRenderer(options, events);
      mapController.addObject('directionsRenderers', renderer);

      attrsToObserve.forEach(function(attrName) {
        (function(attrName) {
          attrs.$observe(attrName, function(val) {
            if (attrName == 'panel') {
              $timeout(function(){
                var panel =
                  document.getElementById(val) || document.querySelector(val);
                void 0;
                panel && renderer.setPanel(panel);
              });
            } else if (options[attrName] !== val) { //apply only if changed
              var optionValue = parser.toOptionValue(val, {key: attrName});
              void 0;
              options[attrName] = optionValue;
              updateRoute(renderer, options);
            }
          });
        })(attrName);
      });

      NgMap.getMap().then(function() {
        updateRoute(renderer, options);
      });
      element.bind('$destroy', function() {
        mapController.deleteObject('directionsRenderers', renderer);
      });
    };

    return {
      restrict: 'E',
      require: ['?^map','?^ngMap'],
      link: linkFunc
    };
  }; // var directions
  directions.$inject =
    ['Attr2MapOptions', '$timeout', 'NavigatorGeolocation', 'NgMap'];

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
 *    <drawing-manager
 *      on-overlaycomplete="onMapOverlayCompleted()"
 *      position="ControlPosition.TOP_CENTER"
 *      drawingModes="POLYGON,CIRCLE"
 *      drawingControl="true"
 *      circleOptions="fillColor: '#FFFF00';fillOpacity: 1;strokeWeight: 5;clickable: false;zIndex: 1;editable: true;" >
 *    </drawing-manager>
 *  </map>
 *
 *  TODO: Add remove button.
 *  currently, for our solution, we have the shapes/markers in our own
 *  controller, and we use some css classes to change the shape button
 *  to a remove button (<div>X</div>) and have the remove operation in our own controller.
 */
(function() {
  'use strict';
  angular.module('ngMap').directive('drawingManager', [
    'Attr2MapOptions', function(Attr2MapOptions) {
    var parser = Attr2MapOptions;

    return {
      restrict: 'E',
      require: ['?^map','?^ngMap'],

      link: function(scope, element, attrs, mapController) {
        mapController = mapController[0]||mapController[1];

        var filtered = parser.filter(attrs);
        var options = parser.getOptions(filtered, {scope: scope});
        var controlOptions = parser.getControlOptions(filtered);
        var events = parser.getEvents(scope, filtered);

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
 *     <dynamic-maps-engine-layer
 *       layer-id="06673056454046135537-08896501997766553811">
 *     </dynamic-maps-engine-layer>
 *    </map>
 */
(function() {
  'use strict';

  angular.module('ngMap').directive('dynamicMapsEngineLayer', [
    'Attr2MapOptions', function(Attr2MapOptions) {
    var parser = Attr2MapOptions;

    var getDynamicMapsEngineLayer = function(options, events) {
      var layer = new google.maps.visualization.DynamicMapsEngineLayer(options);

      for (var eventName in events) {
        google.maps.event.addListener(layer, eventName, events[eventName]);
      }

      return layer;
    };

    return {
      restrict: 'E',
      require: ['?^map','?^ngMap'],

      link: function(scope, element, attrs, mapController) {
        mapController = mapController[0]||mapController[1];

        var filtered = parser.filter(attrs);
        var options = parser.getOptions(filtered, {scope: scope});
        var events = parser.getEvents(scope, filtered, events);

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

  angular.module('ngMap').directive('fusionTablesLayer', [
    'Attr2MapOptions', function(Attr2MapOptions) {
    var parser = Attr2MapOptions;

    var getLayer = function(options, events) {
      var layer = new google.maps.FusionTablesLayer(options);

      for (var eventName in events) {
        google.maps.event.addListener(layer, eventName, events[eventName]);
      }

      return layer;
    };

    return {
      restrict: 'E',
      require: ['?^map','?^ngMap'],

      link: function(scope, element, attrs, mapController) {
        mapController = mapController[0]||mapController[1];

        var filtered = parser.filter(attrs);
        var options = parser.getOptions(filtered, {scope: scope});
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
 *
 * <map zoom="11" center="[41.875696,-87.624207]">
 *   <heatmap-layer data="taxiData"></heatmap-layer>
 * </map>
 */
(function() {
  'use strict';

  angular.module('ngMap').directive('heatmapLayer', [
    'Attr2MapOptions', '$window', function(Attr2MapOptions, $window) {
    var parser = Attr2MapOptions;
    return {
      restrict: 'E',
      require: ['?^map','?^ngMap'],

      link: function(scope, element, attrs, mapController) {
        mapController = mapController[0]||mapController[1];

        var filtered = parser.filter(attrs);

        /**
         * set options
         */
        var options = parser.getOptions(filtered, {scope: scope});
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
 * @param Attr2MapOptions {service}
 *   convert html attribute to Gogole map api options
 * @param $compile {service} $compile service
 * @description
 *  Defines infoWindow and provides compile method
 *
 *  Requires:  map directive
 *
 *  Restrict To:  Element
 *
 *  NOTE: this directive should **NOT** be used with `ng-repeat`
 *  because InfoWindow itself is a template, and a template must be
 *  reused by each marker, thus, should not be redefined repeatedly
 *  by `ng-repeat`.
 *
 * @attr {Boolean} visible
 *   Indicates to show it when map is initialized
 * @attr {Boolean} visible-on-marker
 *   Indicates to show it on a marker when map is initialized
 * @attr {Expression} geo-callback
 *   if position is an address, the expression is will be performed
 *   when geo-lookup is successful. e.g., geo-callback="showDetail()"
 * @attr {String} &lt;InfoWindowOption> Any InfoWindow options,
 *   https://developers.google.com/maps/documentation/javascript/reference?csw=1#InfoWindowOptions
 * @attr {String} &lt;InfoWindowEvent> Any InfoWindow events,
 *   https://developers.google.com/maps/documentation/javascript/reference
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

  var infoWindow = function(Attr2MapOptions, $compile, $timeout, $parse, NgMap)  {
    var parser = Attr2MapOptions;

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

      infoWindow.__open = function(map, scope, anchor) {
        $timeout(function() {
          anchor && (scope.anchor = anchor);
          var el = $compile(infoWindow.__template)(scope);
          infoWindow.setContent(el[0]);
          scope.$apply();
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
      mapController = mapController[0]||mapController[1];

      element.css('display','none');

      var orgAttrs = parser.orgAttributes(element);
      var filtered = parser.filter(attrs);
      var options = parser.getOptions(filtered, {scope: scope});
      var events = parser.getEvents(scope, filtered);

      var address;
      if (options.position && !(options.position instanceof google.maps.LatLng)) {
        address = options.position;
      }
      var infoWindow = getInfoWindow(options, events, element);
      if (address) {
        NgMap.getGeoLocation(address).then(function(latlng) {
          infoWindow.setPosition(latlng);
          infoWindow.__open(mapController.map, scope, latlng);
          var geoCallback = attrs.geoCallback;
          geoCallback && $parse(geoCallback)(scope);
        });
      }

      mapController.addObject('infoWindows', infoWindow);
      mapController.observeAttrSetObj(orgAttrs, attrs, infoWindow);

      mapController.showInfoWindow = 
      mapController.map.showInfoWindow = mapController.showInfoWindow ||
        function(p1, p2, p3) { //event, id, marker
          var id = typeof p1 == 'string' ? p1 : p2;
          var marker = typeof p1 == 'string' ? p2 : p3;
          if (typeof marker == 'string') {
            marker = mapController.map.markers[marker];
          }

          var infoWindow = mapController.map.infoWindows[id];
          var anchor = marker ? marker : (this.getPosition ? this : null);
          infoWindow.__open(mapController.map, scope, anchor);
          if(mapController.singleInfoWindow) {
            if(mapController.lastInfoWindow) {
              scope.hideInfoWindow(mapController.lastInfoWindow);
            }
            mapController.lastInfoWindow = id;
          }
        };

      mapController.hideInfoWindow =
      mapController.map.hideInfoWindow = mapController.hideInfoWindow ||
        function(p1, p2) {
          var id = typeof p1 == 'string' ? p1 : p2;
          var infoWindow = mapController.map.infoWindows[id];
          infoWindow.close();
        };

      //TODO DEPRECATED
      scope.showInfoWindow = mapController.map.showInfoWindow;
      scope.hideInfoWindow = mapController.map.hideInfoWindow;

      NgMap.getMap().then(function(map) {
        infoWindow.visible && infoWindow.__open(map, scope);
        if (infoWindow.visibleOnMarker) {
          var markerId = infoWindow.visibleOnMarker;
          infoWindow.__open(map, scope, map.markers[markerId]);
        }
      });

    }; //link

    return {
      restrict: 'E',
      require: ['?^map','?^ngMap'],
      link: linkFunc
    };

  }; // infoWindow
  infoWindow.$inject =
    ['Attr2MapOptions', '$compile', '$timeout', '$parse', 'NgMap'];

  angular.module('ngMap').directive('infoWindow', infoWindow);
})();

/**
 * @ngdoc directive
 * @name kml-layer
 * @param Attr2MapOptions {service} convert html attribute to Gogole map api options
 * @description
 *   renders Kml layer on a map
 *   Requires:  map directive
 *   Restrict To:  Element
 *
 * @attr {Url} url url of the kml layer
 * @attr {KmlLayerOptions} KmlLayerOptions
 *   (https://developers.google.com/maps/documentation/javascript/reference#KmlLayerOptions) 
 * @attr {String} &lt;KmlLayerEvent> Any KmlLayer events,
 *   https://developers.google.com/maps/documentation/javascript/reference
 * @example
 * Usage:
 *   <map MAP_ATTRIBUTES>
 *    <kml-layer ANY_KML_LAYER ANY_KML_LAYER_EVENTS"></kml-layer>
 *   </map>
 *
 * Example:
 *
 * <map zoom="11" center="[41.875696,-87.624207]">
 *   <kml-layer url="https://gmaps-samples.googlecode.com/svn/trunk/ggeoxml/cta.kml" >
 *   </kml-layer>
 * </map>
 */
(function() {
  'use strict';

  angular.module('ngMap').directive('kmlLayer', [
    'Attr2MapOptions', function(Attr2MapOptions) {
    var parser = Attr2MapOptions;

    var getKmlLayer = function(options, events) {
      var kmlLayer = new google.maps.KmlLayer(options);
      for (var eventName in events) {
        google.maps.event.addListener(kmlLayer, eventName, events[eventName]);
      }
      return kmlLayer;
    };

    return {
      restrict: 'E',
      require: ['?^map','?^ngMap'],

      link: function(scope, element, attrs, mapController) {
        mapController = mapController[0]||mapController[1];

        var orgAttrs = parser.orgAttributes(element);
        var filtered = parser.filter(attrs);
        var options = parser.getOptions(filtered, {scope: scope});
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
 * @param Attr2MapOptions {service}
 *   convert html attribute to Gogole map api options
 * @description
 *   set map data
 *   Requires:  map directive
 *   Restrict To:  Element
 *
 * @wn {String} method-name, run map.data[method-name] with attribute value
 * @example
 * Example:
 *
 *  <map zoom="11" center="[41.875696,-87.624207]">
 *    <map-data load-geo-json="https://storage.googleapis.com/maps-devrel/google.json"></map-data>
 *   </map>
 */
(function() {
  'use strict';

  angular.module('ngMap').directive('mapData', [
    'Attr2MapOptions', 'NgMap', function(Attr2MapOptions, NgMap) {
    var parser = Attr2MapOptions;
    return {
      restrict: 'E',
      require: ['?^map','?^ngMap'],

      link: function(scope, element, attrs) {
        var filtered = parser.filter(attrs);
        var options = parser.getOptions(filtered, {scope: scope});
        var events = parser.getEvents(scope, filtered, events);

        void 0;
        NgMap.getMap().then(function(map) {
          //options
          for (var key in options) {
            var val = options[key];
            if (typeof scope[val] === "function") {
              map.data[key](scope[val]);
            } else {
              map.data[key](val);
            }
          }

          //events
          for (var eventName in events) {
            map.data.addListener(eventName, events[eventName]);
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
 *  Requires: Delay the initialization of map directive
 *    until the map is ready to be rendered
 *  Restrict To: Attribute
 *
 * @attr {String} map-lazy-load
 *    Maps api script source file location.
 *    Example:
 *      'https://maps.google.com/maps/api/js'
 * @attr {String} map-lazy-load-params
 *   Maps api script source file location via angular scope variable.
 *   Also requires the map-lazy-load attribute to be present in the directive.
 *   Example: In your controller, set
 *     $scope.googleMapsURL = 'https://maps.google.com/maps/api/js?v=3.20&client=XXXXXenter-api-key-hereXXXX'
 *
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
/* global window, document */
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

      scriptEl.src = mapsUrl +
        (mapsUrl.indexOf('?') > -1 ? '&' : '?') +
        'callback=lazyLoadCallback';

        if (!document.querySelector('script[src="' + scriptEl.src + '"]')) {
          document.body.appendChild(scriptEl);
        }
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
    if(window.google !== undefined && window.google.maps !== undefined) {
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
    };
  };
  mapLazyLoad.$inject = ['$compile','$timeout'];

  angular.module('ngMap').directive('mapLazyLoad', mapLazyLoad);
})();

/**
 * @ngdoc directive
 * @name map-type
 * @param Attr2MapOptions {service} 
 *   convert html attribute to Google map api options
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

  angular.module('ngMap').directive('mapType', ['$parse', 'NgMap',
    function($parse, NgMap) {

    return {
      restrict: 'E',
      require: ['?^map','?^ngMap'],

      link: function(scope, element, attrs, mapController) {
        mapController = mapController[0]||mapController[1];

        var mapTypeName = attrs.name, mapTypeObject;
        if (!mapTypeName) {
          throw "invalid map-type name";
        }
        mapTypeObject = $parse(attrs.object)(scope);
        if (!mapTypeObject) {
          throw "invalid map-type object";
        }

        NgMap.getMap().then(function(map) {
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
 * @name ng-map
 * @param Attr2Options {service}
 *  convert html attribute to Gogole map api options
 * @description
 * Implementation of {@link __MapController}
 * Initialize a Google map within a `<div>` tag
 *   with given options and register events
 *
 * @attr {Expression} map-initialized 
 *   callback function when map is initialized
 *   e.g., map-initialized="mycallback(map)"
 * @attr {Expression} geo-callback if center is an address or current location,
 *   the expression is will be executed when geo-lookup is successful.
 *   e.g., geo-callback="showMyStoreInfo()"
 * @attr {Array} geo-fallback-center
 *   The center of map incase geolocation failed. i.e. [0,0]
 * @attr {Object} geo-location-options
 *  The navigator geolocation options.
 *  e.g., { maximumAge: 3000, timeout: 5000, enableHighAccuracy: true }.
 *  If none specified, { timeout: 5000 }.
 *  If timeout not specified, timeout: 5000 added
 * @attr {Boolean} zoom-to-include-markers
 *  When true, map boundary will be changed automatially
 *  to include all markers when initialized
 * @attr {Boolean} default-style
 *  When false, the default styling,
 *  `display:block;height:300px`, will be ignored.
 * @attr {String} &lt;MapOption> Any Google map options,
 *  https://developers.google.com/maps/documentation/javascript/reference?csw=1#MapOptions
 * @attr {String} &lt;MapEvent> Any Google map events,
 *  https://rawgit.com/allenhwkim/angularjs-google-maps/master/build/map_events.html
 * @attr {Boolean} single-info-window
 *  When true the map will only display one info window at the time,
 *  if not set or false,
 *  everytime an info window is open it will be displayed with the othe one.
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
(function () {
  'use strict';

  var mapDirective = function () {
    return {
      restrict: 'AE',
      controller: '__MapController',
      conrollerAs: 'ngmap'
    };
  };

  angular.module('ngMap').directive('map', [mapDirective]);
  angular.module('ngMap').directive('ngMap', [mapDirective]);
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
 *  <map zoom="14" center="[59.322506, 18.010025]">
 *    <maps-engine-layer layer-id="06673056454046135537-08896501997766553811">
 *    </maps-engine-layer>
 *  </map>
 */
(function() {
  'use strict';

  angular.module('ngMap').directive('mapsEngineLayer', ['Attr2MapOptions', function(Attr2MapOptions) {
    var parser = Attr2MapOptions;

    var getMapsEngineLayer = function(options, events) {
      var layer = new google.maps.visualization.MapsEngineLayer(options);

      for (var eventName in events) {
        google.maps.event.addListener(layer, eventName, events[eventName]);
      }

      return layer;
    };

    return {
      restrict: 'E',
      require: ['?^map','?^ngMap'],

      link: function(scope, element, attrs, mapController) {
        mapController = mapController[0]||mapController[1];

        var filtered = parser.filter(attrs);
        var options = parser.getOptions(filtered, {scope: scope});
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
 *  Draw a Google map marker on a map with given options and register events
 *
 *  Requires:  map directive
 *
 *  Restrict To:  Element
 *
 * @attr {String} position address, 'current', or [latitude, longitude]
 *  example:
 *    '1600 Pennsylvania Ave, 20500  Washingtion DC',
 *    'current position',
 *    '[40.74, -74.18]'
 * @attr {Boolean} centered if set, map will be centered with this marker
 * @attr {Expression} geo-callback if position is an address,
 *   the expression is will be performed when geo-lookup is successful.
 *   e.g., geo-callback="showStoreInfo()"
 * @attr {Boolean} no-watcher if true, no attribute observer is added.
 *   Useful for many ng-repeat
 * @attr {String} &lt;MarkerOption>
 *   [Any Marker options](https://developers.google.com/maps/documentation/javascript/reference?csw=1#MarkerOptions)
 * @attr {String} &lt;MapEvent>
 *   [Any Marker events](https://developers.google.com/maps/documentation/javascript/reference)
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
  var parser, $parse, NgMap;

  var getMarker = function(options, events) {
    var marker;

    if (NgMap.defaultOptions.marker) {
      for (var key in NgMap.defaultOptions.marker) {
        if (typeof options[key] == 'undefined') {
          void 0;
          options[key] = NgMap.defaultOptions.marker[key];
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

  var linkFunc = function(scope, element, attrs, mapController) {
    mapController = mapController[0]||mapController[1];

    var orgAttrs = parser.orgAttributes(element);
    var filtered = parser.filter(attrs);
    var markerOptions = parser.getOptions(filtered, scope, {scope: scope});
    var markerEvents = parser.getEvents(scope, filtered);
    void 0;

    var address;
    if (!(markerOptions.position instanceof google.maps.LatLng)) {
      address = markerOptions.position;
    }
    var marker = getMarker(markerOptions, markerEvents);
    mapController.addObject('markers', marker);
    if (address) {
      NgMap.getGeoLocation(address).then(function(latlng) {
        marker.setPosition(latlng);
        markerOptions.centered && marker.map.setCenter(latlng);
        var geoCallback = attrs.geoCallback;
        geoCallback && $parse(geoCallback)(scope);
      });
    }

    //set observers
    mapController.observeAttrSetObj(orgAttrs, attrs, marker); /* observers */

    element.bind('$destroy', function() {
      mapController.deleteObject('markers', marker);
    });
  };

  var marker = function(Attr2MapOptions, _$parse_, _NgMap_) {
    parser = Attr2MapOptions;
    $parse = _$parse_;
    NgMap = _NgMap_;

    return {
      restrict: 'E',
      require: ['^?map','?^ngMap'],
      link: linkFunc
    };
  };

  marker.$inject = ['Attr2MapOptions', '$parse', 'NgMap'];
  angular.module('ngMap').directive('marker', marker);

})();

/**
 * @ngdoc directive
 * @name overlay-map-type
 * @param Attr2MapOptions {service} convert html attribute to Gogole map api options
 * @param $window {service}
 * @description
 *   Requires:  map directive
 *   Restrict To:  Element
 *
 * @example
 * Example:
 *
 * <map zoom="13" center="34.04924594193164, -118.24104309082031">
 *   <overlay-map-type index="0" object="coordinateMapType"></map-type>
 * </map>
 */
(function() {
  'use strict';

  angular.module('ngMap').directive('overlayMapType', [
    'NgMap', function(NgMap) {

    return {
      restrict: 'E',
      require: ['?^map','?^ngMap'],

      link: function(scope, element, attrs, mapController) {
        mapController = mapController[0]||mapController[1];

        var initMethod = attrs.initMethod || "insertAt";
        var overlayMapTypeObject = scope[attrs.object];

        NgMap.getMap().then(function(map) {
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
 * @param Attr2MapOptions {service} convert html attribute to Gogole map api options
 * @description
 *   Provides address auto complete feature to an input element
 *   Requires: input tag
 *   Restrict To: Attribute
 *
 * @attr {AutoCompleteOptions}
 *   [Any AutocompleteOptions](https://developers.google.com/maps/documentation/javascript/3.exp/reference#AutocompleteOptions)
 *
 * @example
 * Example:
 *   <script src="https://maps.googleapis.com/maps/api/js?libraries=places"></script>
 *   <input places-auto-complete types="['geocode']" on-place-changed="myCallback(place)" />
 */
/* global google */
(function() {
  'use strict';

  var placesAutoComplete = function(Attr2MapOptions, $timeout) {
    var parser = Attr2MapOptions;

    var linkFunc = function(scope, element, attrs, ngModelCtrl) {
      if (attrs.placesAutoComplete ==='false') {
        return false;
      }
      var filtered = parser.filter(attrs);
      var options = parser.getOptions(filtered, {scope: scope});
      var events = parser.getEvents(scope, filtered);
      var autocomplete = new google.maps.places.Autocomplete(element[0], options);
      for (var eventName in events) {
        google.maps.event.addListener(autocomplete, eventName, events[eventName]);
      }

      var updateModel = function() {
        $timeout(function(){
          ngModelCtrl && ngModelCtrl.$setViewValue(element.val());
        },100);
      };
      google.maps.event.addListener(autocomplete, 'place_changed', updateModel);
      element[0].addEventListener('change', updateModel);

      attrs.$observe('types', function(val) {
        if (val) {
          var optionValue = parser.toOptionValue(val, {key: 'types'});
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

  placesAutoComplete.$inject = ['Attr2MapOptions', '$timeout'];
  angular.module('ngMap').directive('placesAutoComplete', placesAutoComplete);

})();

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
    void 0;

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
      var shapeOptions = parser.getOptions(filtered, {scope: scope});
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

/**
 * @ngdoc directive
 * @name streetview-panorama
 * @param Attr2MapOptions {service} convert html attribute to Gogole map api options
 * @description
 *   Requires:  map directive
 *   Restrict To:  Element
 *
 * @attr container Optional, id or css selector, if given, streetview will be in the given html element
 * @attr {String} &lt;StreetViewPanoramaOption>
 *   [Any Google StreetViewPanorama options](https://developers.google.com/maps/documentation/javascript/reference?csw=1#StreetViewPanoramaOptions)
 * @attr {String} &lt;StreetViewPanoramaEvent>
 *   [Any Google StreetViewPanorama events](https://developers.google.com/maps/documentation/javascript/reference#StreetViewPanorama)
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
/* global google, document */
(function() {
  'use strict';

  var streetViewPanorama = function(Attr2MapOptions, NgMap) {
    var parser = Attr2MapOptions;

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

    var linkFunc = function(scope, element, attrs) {
      var filtered = parser.filter(attrs);
      var options = parser.getOptions(filtered, {scope: scope});
      var controlOptions = parser.getControlOptions(filtered);
      var svpOptions = angular.extend(options, controlOptions);

      var svpEvents = parser.getEvents(scope, filtered);
      void 0;

      NgMap.getMap().then(function(map) {
        var svp = getStreetViewPanorama(map, svpOptions, svpEvents);

        map.setStreetView(svp);
        (!svp.getPosition()) && svp.setPosition(map.getCenter());
        google.maps.event.addListener(svp, 'position_changed', function() {
          if (svp.getPosition() !== map.getCenter()) {
            map.setCenter(svp.getPosition());
          }
        });
        //needed for geo-callback
        var listener =
          google.maps.event.addListener(map, 'center_changed', function() {
            svp.setPosition(map.getCenter());
            google.maps.event.removeListener(listener);
          });
      });

    }; //link

    return {
      restrict: 'E',
      require: ['?^map','?^ngMap'],
      link: linkFunc
    };

  };
  streetViewPanorama.$inject = ['Attr2MapOptions', 'NgMap'];

  angular.module('ngMap').directive('streetViewPanorama', streetViewPanorama);
})();

/**
 * @ngdoc directive
 * @name traffic-layer
 * @param Attr2MapOptions {service} convert html attribute to Gogole map api options
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

  angular.module('ngMap').directive('trafficLayer', [
    'Attr2MapOptions', function(Attr2MapOptions) {
    var parser = Attr2MapOptions;

    var getLayer = function(options, events) {
      var layer = new google.maps.TrafficLayer(options);
      for (var eventName in events) {
        google.maps.event.addListener(layer, eventName, events[eventName]);
      }
      return layer;
    };

    return {
      restrict: 'E',
      require: ['?^map','?^ngMap'],

      link: function(scope, element, attrs, mapController) {
        mapController = mapController[0]||mapController[1];

        var orgAttrs = parser.orgAttributes(element);
        var filtered = parser.filter(attrs);
        var options = parser.getOptions(filtered, {scope: scope});
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
 * @param Attr2MapOptions {service} convert html attribute to Gogole map api options
 * @description
 *   Requires:  map directive
 *   Restrict To:  Element
 *
 * @example
 * Example:
 *
 *  <map zoom="13" center="34.04924594193164, -118.24104309082031">
 *    <transit-layer></transit-layer>
 *  </map>
 */
(function() {
  'use strict';

  angular.module('ngMap').directive('transitLayer', [
    'Attr2MapOptions', function(Attr2MapOptions) {
    var parser = Attr2MapOptions;

    var getLayer = function(options, events) {
      var layer = new google.maps.TransitLayer(options);
      for (var eventName in events) {
        google.maps.event.addListener(layer, eventName, events[eventName]);
      }
      return layer;
    };

    return {
      restrict: 'E',
      require: ['?^map','?^ngMap'],

      link: function(scope, element, attrs, mapController) {
        mapController = mapController[0]||mapController[1];

        var orgAttrs = parser.orgAttributes(element);
        var filtered = parser.filter(attrs);
        var options = parser.getOptions(filtered, {scope: scope});
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
 * @ngdoc filter
 * @name camel-case
 * @description
 *   Converts string to camel cased
 */
(function() {
  'use strict';

  var SPECIAL_CHARS_REGEXP = /([\:\-\_]+(.))/g;
  var MOZ_HACK_REGEXP = /^moz([A-Z])/;

  var camelCaseFilter = function() {
    return function(name) {
      return name.
        replace(SPECIAL_CHARS_REGEXP,
          function(_, separator, letter, offset) {
            return offset ? letter.toUpperCase() : letter;
        }).
        replace(MOZ_HACK_REGEXP, 'Moz$1');
    };
  };

  angular.module('ngMap').filter('camelCase', camelCaseFilter);
})();

/**
 * @ngdoc filter
 * @name jsonize
 * @description
 *   Converts json-like string to json string
 */
(function() {
  'use strict';

  var jsonizeFilter = function() {
    return function(str) {
      try {       // if parsable already, return as it is
        JSON.parse(str);
        return str;
      } catch(e) { // if not parsable, change little
        return str
          // wrap keys without quote with valid double quote
          .replace(/([\$\w]+)\s*:/g,
            function(_, $1) {
              return '"'+$1+'":';
            }
          )
          // replacing single quote wrapped ones to double quote
          .replace(/'([^']+)'/g,
            function(_, $1) {
              return '"'+$1+'"';
            }
          );
      }
    };
  };

  angular.module('ngMap').filter('jsonize', jsonizeFilter);
})();

/**
 * @ngdoc service
 * @name Attr2MapOptions
 * @description
 *   Converts tag attributes to options used by google api v3 objects
 */
/* global google */
(function() {
  'use strict';

  //i.e. "2015-08-12T06:12:40.858Z"
  var isoDateRE =
    /^(\d{4}\-\d\d\-\d\d([tT][\d:\.]*)?)([zZ]|([+\-])(\d\d):?(\d\d))?$/;

  var Attr2MapOptions = function(
      $parse, $timeout, $log, NavigatorGeolocation, GeoCoder,
      camelCaseFilter, jsonizeFilter
    ) {

    /**
     * Returns the attributes of an element as hash
     * @memberof Attr2MapOptions
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

    var getJSON = function(input) {
      var re =/^[\+\-]?[0-9\.]+,[ ]*\ ?[\+\-]?[0-9\.]+$/; //lat,lng
      if (input.match(re)) {
        input = "["+input+"]";
      }
      return JSON.parse(jsonizeFilter(input));
    };

    var getLatLng = function(input) {
      var output = input;
      if (input[0].constructor == Array) { // [[1,2],[3,4]]
        output = input.map(function(el) {
          return new google.maps.LatLng(el[0], el[1]);
        });
      } else if(!isNaN(parseFloat(input[0])) && isFinite(input[0])) {
        output = new google.maps.LatLng(output[0], output[1]);
      }
      return output;
    };

    var toOptionValue = function(input, options) {
      var output;
      try { // 1. Number?
        output = getNumber(input);
      } catch(err) {
        try { // 2. JSON?
          var output = getJSON(input);
          if (output instanceof Array) {
            // [{a:1}] : not lat/lng ones
            if (output[0].constructor == Object) {
              output = output;
            } else { // [[1,2],[3,4]] or [1,2]
              output = getLatLng(output);
            }
          }
          // JSON is an object (not array or null)
          else if (output === Object(output)) {
            // check for nested hashes and convert to Google API options
            var newOptions = options;
            newOptions.doNotConverStringToNumber = true;
            output = getOptions(output, newOptions);
          }
        } catch(err2) {
          // 3. Google Map Object function Expression. i.e. LatLng(80,-49)
          if (input.match(/^[A-Z][a-zA-Z0-9]+\(.*\)$/)) {
            try {
              var exp = "new google.maps."+input;
              output = eval(exp); /* jshint ignore:line */
            } catch(e) {
              output = input;
            }
          // 4. Google Map Object constant Expression. i.e. MayTypeId.HYBRID
          } else if (input.match(/^([A-Z][a-zA-Z0-9]+)\.([A-Z]+)$/)) {
            try {
              var matches = input.match(/^([A-Z][a-zA-Z0-9]+)\.([A-Z]+)$/);
              output = google.maps[matches[1]][matches[2]];
            } catch(e) {
              output = input;
            }
          // 5. Google Map Object constant Expression. i.e. HYBRID
          } else if (input.match(/^[A-Z]+$/)) {
            try {
              var capitalizedKey = options.key.charAt(0).toUpperCase() +
                options.key.slice(1);
              if (options.key.match(/temperatureUnit|windSpeedUnit|labelColor/)) {
                capitalizedKey = capitalizedKey.replace(/s$/,"");
                output = google.maps.weather[capitalizedKey][input];
              } else {
                output = google.maps[capitalizedKey][input];
              }
            } catch(e) {
              output = input;
            }
          // 6. Date Object as ISO String
          } else if (input.match(isoDateRE)) {
            try {
              output = new Date(input);
            } catch(e) {
              output = input;
            }
          // 7. evaluate dynamically bound values
          } else if (input.match(/^{/) && options.scope) {
            try {
              var expr = input.replace(/{{/,'').replace(/}}/g,'');
              output = options.scope.$eval(expr);
            } catch (err) {
              output = input;
            }
          } else {
            output = input;
          }
        } // catch(err2)
      } // catch(err)

      // convert output more for center and position
      if (
        (options.key == 'center' || options.key == 'center') &&
        output instanceof Array
      ) {
        output = new google.maps.LatLng(output[0], output[1]);
      }

      // convert output more for shape bounds
      if (options.key == 'bounds' && output instanceof Array) {
        output = new google.maps.LatLngBounds(output[0], output[1]);
      }

      // convert output more for shape icons
      if (options.key == 'icons' && output instanceof Array) {

        for (var i=0; i<output.length; i++) {
          var el = output[i];
          if (el.icon.path.match(/^[A-Z_]+$/)) {
            el.icon.path =  google.maps.SymbolPath[el.icon.path];
          }
        }
      }

      // convert output more for marker icon
      if (options.key == 'icon' && output instanceof Object) {
        if ((""+output.path).match(/^[A-Z_]+$/)) {
          output.path = google.maps.SymbolPath[output.path];
        }
        for (var key in output) { //jshint ignore:line
          var arr = output[key];
          if (key == "anchor" || key == "origin") {
            output[key] = new google.maps.Point(arr[0], arr[1]);
          } else if (key == "size" || key == "scaledSize") {
            output[key] = new google.maps.Size(arr[0], arr[1]);
          }
        }
      }

      return output;
    };

    var getAttrsToObserve = function(attrs) {
      var attrsToObserve = [];

      if (!attrs.noWatcher) {
        for (var attrName in attrs) { //jshint ignore:line
          var attrValue = attrs[attrName];
          if (attrValue && attrValue.match(/\{\{.*\}\}/)) { // if attr value is {{..}}
            attrsToObserve.push(camelCaseFilter(attrName));
          }
        }
      }

      return attrsToObserve;
    };

    /**
     * filters attributes by skipping angularjs methods $.. $$..
     * @memberof Attr2MapOptions
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
     * @memberof Attr2MapOptions
     * @param {Hash} attrs tag attributes
     * @param {Hash} options
     * @returns {Hash} options converted attributess
     */
    var getOptions = function(attrs, params) {
      params = params || {};
      var options = {};
      for(var key in attrs) {
        if (attrs[key] || attrs[key] === 0) {
          if (key.match(/^on[A-Z]/)) { //skip events, i.e. on-click
            continue;
          } else if (key.match(/ControlOptions$/)) { // skip controlOptions
            continue;
          } else {
            // nested conversions need to be typechecked
            // (non-strings are fully converted)
            if (typeof attrs[key] !== 'string') {
              options[key] = attrs[key];
            } else {
              if (params.doNotConverStringToNumber &&
                attrs[key].match(/^[0-9]+$/)
              ) {
                options[key] = attrs[key];
              } else {
                options[key] = toOptionValue(attrs[key], {key: key, scope: params.scope});
              }
            }
          }
        } // if (attrs[key])
      } // for(var key in attrs)
      return options;
    };

    /**
     * converts attributes hash to scope-specific event function 
     * @memberof Attr2MapOptions
     * @param {scope} scope angularjs scope
     * @param {Hash} attrs tag attributes
     * @returns {Hash} events converted events
     */
    var getEvents = function(scope, attrs) {
      var events = {};
      var toLowercaseFunc = function($1){
        return "_"+$1.toLowerCase();
      };
      var EventFunc = function(attrValue) {
        // funcName(argsStr)
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
          events[eventName] = new EventFunc(attrValue);
        }
      }
      return events;
    };

    /**
     * control means map controls, i.e streetview, pan, etc, not a general control
     * @memberof Attr2MapOptions
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
      filter: filter,
      getOptions: getOptions,
      getEvents: getEvents,
      getControlOptions: getControlOptions,
      toOptionValue: toOptionValue,
      getAttrsToObserve: getAttrsToObserve,
      orgAttributes: orgAttributes
    }; // return

  };
  Attr2MapOptions.$inject= [
    '$parse', '$timeout', '$log', 'NavigatorGeolocation', 'GeoCoder',
    'camelCaseFilter', 'jsonizeFilter'
  ];

  angular.module('ngMap').service('Attr2MapOptions', Attr2MapOptions);
})();

/**
 * @ngdoc service
 * @name GeoCoder
 * @description
 *   Provides [defered/promise API](https://docs.angularjs.org/api/ng/service/$q)
 *   service for Google Geocoder service
 */
(function() {
  'use strict';
  var $q;
  /**
   * @memberof GeoCoder
   * @param {Hash} options
   *   https://developers.google.com/maps/documentation/geocoding/#geocoding
   * @example
   * ```
   *   GeoCoder.geocode({address: 'the cn tower'}).then(function(result) {
   *     //... do something with result
   *   });
   * ```
   * @returns {HttpPromise} Future object
   */
  var geocodeFunc = function(options) {
    var deferred = $q.defer();
    var geocoder = new google.maps.Geocoder();
    geocoder.geocode(options, function (results, status) {
      if (status == google.maps.GeocoderStatus.OK) {
        deferred.resolve(results);
      } else {
        deferred.reject(status);
      }
    });
    return deferred.promise;
  };

  var GeoCoder = function(_$q_) {
    $q = _$q_;
    return {
      geocode : geocodeFunc
    };
  };
  GeoCoder.$inject = ['$q'];

  angular.module('ngMap').service('GeoCoder', GeoCoder);
})();

/**
 * @ngdoc service
 * @name NavigatorGeolocation
 * @description
 *  Provides [defered/promise API](https://docs.angularjs.org/api/ng/service/$q)
 *  service for navigator.geolocation methods
 */
/* global google */
(function() {
  'use strict';
  var $q;

  /**
   * @memberof NavigatorGeolocation
   * @param {Object} geoLocationOptions the navigator geolocations options.
   *  i.e. { maximumAge: 3000, timeout: 5000, enableHighAccuracy: true }.
   *  If none specified, { timeout: 5000 }. 
   *  If timeout not specified, timeout: 5000 added
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
  var getCurrentPosition = function(geoLocationOptions) {
    var deferred = $q.defer();
    if (navigator.geolocation) {

      if (geoLocationOptions === undefined) {
        geoLocationOptions = { timeout: 5000 };
      }
      else if (geoLocationOptions.timeout === undefined) {
        geoLocationOptions.timeout = 5000;
      }

      navigator.geolocation.getCurrentPosition(
        function(position) {
          deferred.resolve(position);
        }, function(evt) {
          void 0;
          deferred.reject(evt);
        },
        geoLocationOptions
      );
    } else {
      deferred.reject("Browser Geolocation service failed.");
    }
    return deferred.promise;
  };

  var NavigatorGeolocation = function(_$q_) {
    $q = _$q_;
    return {
      getCurrentPosition: getCurrentPosition
    };
  };
  NavigatorGeolocation.$inject = ['$q'];

  angular.module('ngMap').
    service('NavigatorGeolocation', NavigatorGeolocation);
})();

/**
 * @ngdoc factory
 * @name NgMapPool
 * @description
 *   Provide map instance to avoid memory leak
 */
(function() {
  'use strict';
  /**
   * @memberof NgMapPool
   * @desc map instance pool
   */
  var mapInstances = [];
  var $window, $document;

  var add = function(el) {
    var mapDiv = $document.createElement("div");
    mapDiv.style.width = "100%";
    mapDiv.style.height = "100%";
    el.appendChild(mapDiv);
    var map = new $window.google.maps.Map(mapDiv, {});
    mapInstances.push(map);
    return map;
  };

  var find = function(el) { //jshint ignore:line
    var notInUseMap;
    for (var i=0; i<mapInstances.length; i++) {
      var map = mapInstances[i];
      if (!map.inUse) {
        var mapDiv = map.getDiv();
        el.appendChild(mapDiv);
        notInUseMap = map;
        break;
      }
    }
    return notInUseMap;
  };

  /**
   * @memberof NgMapPool
   * @function getMapInstance
   * @param {HtmlElement} el map container element
   * @return map instance for the given element
   */
  var getMapInstance = function(el) {
    var map = find(el);
    if (!map) {
      map = add(el);
    }
    map.inUse = true;
    return map;
  };

  /**
   * @memberof NgMapPool
   * @function returnMapInstance
   * @param {Map} an instance of google.maps.Map
   * @desc sets the flag inUse of the given map instance to false, so that it 
   * can be reused later
   */
  var returnMapInstance = function(map) {
    map.inUse = false;
  };

  var NgMapPool = function(_$document_, _$window_) {
    $document = _$document_[0], $window = _$window_;

    return {
      mapInstances: mapInstances,
      getMapInstance: getMapInstance,
      returnMapInstance: returnMapInstance
    };
  };
  NgMapPool.$inject = [ '$document', '$window' ];

  angular.module('ngMap').factory('NgMapPool', NgMapPool);

})();

/**
 * @ngdoc provider
 * @name NgMap
 * @description
 *  common utility service for ng-map
 */
(function() {
  'use strict';
  var $window, $document, $q;
  var NavigatorGeolocation, Attr2MapOptions, GeoCoder, camelCaseFilter;

  var mapControllers = {};

  var getStyle = function(el, styleProp) {
    var y;
    if (el.currentStyle) {
      y = el.currentStyle[styleProp];
    } else if ($window.getComputedStyle) {
      y = $document.defaultView.
        getComputedStyle(el, null).
        getPropertyValue(styleProp);
    }
    return y;
  };

  /**
   * @memberof NgMap
   * @function initMap
   * @param id optional, id of the map. default 0
   */
  var initMap = function(id) {
    var ctrl = mapControllers[id || 0];
    if (!(ctrl.map instanceof google.maps.Map)) {
      ctrl.initializeMap();
      return ctrl.map;
    } else {
      void 0;
    }
  };

  /**
   * @memberof NgMap
   * @function getMap
   * @param {Hash} options optional, e.g., {id: 'foo, timeout: 5000}
   * @returns promise
   */
  var getMap = function(options) {
    options = options || {};
    var deferred = $q.defer();

    var id = options.id || 0;
    var timeout = options.timeout || 2000;

    function waitForMap(timeElapsed){
      if(mapControllers[id]){
        deferred.resolve(mapControllers[id].map);
      } else if (timeElapsed > timeout) {
        deferred.reject('could not find map');
      } else {
        $window.setTimeout( function(){
          waitForMap(timeElapsed+100);
        }, 100);
      }
    }
    waitForMap(0);

    return deferred.promise;
  };

  /**
   * @memberof NgMap
   * @function addMap
   * @param mapController {__MapContoller} a map controller
   * @returns promise
   */
  var addMap = function(mapCtrl) {
    if (mapCtrl.map) {
      var len = Object.keys(mapControllers).length;
      mapControllers[mapCtrl.map.id || len] = mapCtrl;
    }
  };

  /**
   * @memberof NgMap
   * @function deleteMap
   * @param mapController {__MapContoller} a map controller
   */
  var deleteMap = function(mapCtrl) {
    var len = Object.keys(mapControllers).length - 1;
    var mapId = mapCtrl.map.id || len;
    delete mapCtrl.map;
    delete mapControllers[mapId];
  };

  /**
   * @memberof NgMap
   * @function getGeoLocation
   * @param {String} address
   * @param {Hash} options geo options
   * @returns promise
   */
  var getGeoLocation = function(string, options) {
    var deferred = $q.defer();
    if (!string || string.match(/^current/i)) { // current location
      NavigatorGeolocation.getCurrentPosition(options).then(
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
   * @memberof NgMap
   * @function observeAndSet
   * @param {String} attrName attribute name
   * @param {Object} object A Google maps object to be changed
   * @returns attribue observe function
   */
  var observeAndSet = function(attrName, object) {
    void 0;
    return function(val) {
      if (val) {
        var setMethod = camelCaseFilter('set-'+attrName);
        var optionValue = Attr2MapOptions.toOptionValue(val, {key: attrName});
        if (object[setMethod]) { //if set method does exist
          void 0;
          /* if an location is being observed */
          if (attrName.match(/center|position/) &&
            typeof optionValue == 'string') {
            getGeoLocation(optionValue).then(function(latlng) {
              object[setMethod](latlng);
            });
          } else {
            object[setMethod](optionValue);
          }
        }
      }
    };
  };

  /**
   * @memberof NgMap
   * @function setStyle
   * @param {HtmlElement} map contriner element
   * @desc set display, width, height of map container element
   */
  var setStyle = function(el) {
    //if style is not given to the map element, set display and height
    var defaultStyle = el.getAttribute('default-style');
    if (defaultStyle == "true") {
      el.style.display = 'block';
      el.style.height = '300px';
    } else {
      if (getStyle(el, 'display') != "block") {
        el.style.display = 'block';
      }
      if (getStyle(el, 'height').match(/^(0|auto)/)) {
        el.style.height = '300px';
      }
    }
  };

  angular.module('ngMap').provider('NgMap', function() {
    var defaultOptions = {};

    /**
     * @memberof NgMap
     * @function setDefaultOptions
     * @param {Hash} options
     * @example
     *  app.config(function(NgMapProvider) {
     *    NgMapProvider.setDefaultOptions({
     *      marker: {
     *        optimized: false
     *      }
     *    });
     *  });
     */
    this.setDefaultOptions = function(options) {
      defaultOptions = options;
    };

    var NgMap = function(
        _$window_, _$document_, _$q_,
        _NavigatorGeolocation_, _Attr2MapOptions_,
        _GeoCoder_, _camelCaseFilter_
      ) {
      $window = _$window_;
      $document = _$document_[0];
      $q = _$q_;
      NavigatorGeolocation = _NavigatorGeolocation_;
      Attr2MapOptions = _Attr2MapOptions_;
      GeoCoder = _GeoCoder_;
      camelCaseFilter = _camelCaseFilter_;

      return {
        defaultOptions: defaultOptions,
        addMap: addMap,
        deleteMap: deleteMap,
        getMap: getMap,
        initMap: initMap,
        setStyle: setStyle,
        getGeoLocation: getGeoLocation,
        observeAndSet: observeAndSet
      };
    };
    NgMap.$inject = [
      '$window', '$document', '$q',
      'NavigatorGeolocation', 'Attr2MapOptions',
      'GeoCoder', 'camelCaseFilter'
    ];

    this.$get = NgMap;
  });
})();

/**
 * @ngdoc service
 * @name StreetView
 * @description
 *  Provides [defered/promise API](https://docs.angularjs.org/api/ng/service/$q)
 *  service for [Google StreetViewService]
 *  (https://developers.google.com/maps/documentation/javascript/streetview)
 */
(function() {
  'use strict';
  var $q;

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
    svs.getPanoramaByLocation( (latlng||map.getCenter), 100,
      function (data, status) {
        // if streetView available
        if (status === google.maps.StreetViewStatus.OK) {
          deferred.resolve(data.location.pano);
        } else {
          // no street view available in this range, or some error occurred
          deferred.resolve(false);
          //deferred.reject('Geocoder failed due to: '+ status);
        }
      }
    );
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
    var svp = new google.maps.StreetViewPanorama(
      map.getDiv(), {enableCloseButton: true}
    );
    svp.setPano(panoId);
  };

  var StreetView = function(_$q_) {
    $q = _$q_;

    return {
      getPanorama: getPanorama,
      setPanorama: setPanorama
    };
  };
  StreetView.$inject = ['$q'];

  angular.module('ngMap').service('StreetView', StreetView);
})();
