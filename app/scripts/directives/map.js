/**
 * @ngdoc directive
 * @name map
 * @requires Attr2Options
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
 * @param {Array} geo-fallback-center
 *    The center of map incase geolocation failed. i.e. [0,0]
 * @param {String} init-event The name of event to initialize this map.
 *        If this option is given, the map won't be initialized until the event is received.
 *        To invoke the event, use $scope.$emit or $scope.$broacast.
 *        i.e. <map init-event="init-map" ng-click="$emit('init-map')" center=... ></map>
 * @param {String} &lt;MapOption> Any Google map options,
 *        https://developers.google.com/maps/documentation/javascript/reference?csw=1#MapOptions
 * @param {String} &lt;MapEvent> Any Google map events,
 *        https://rawgit.com/allenhwkim/angularjs-google-maps/master/build/map_events.html
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
 *   <map geo-fallback-center="[40.74, -74.18]">
 *   </map>
 */
/*jshint -W030*/
ngMap.directive('map', ['Attr2Options', '$timeout', function(Attr2Options, $timeout) {
  var parser = Attr2Options;
  function getStyle(el,styleProp)
  {
    if (el.currentStyle) {
      var y = el.currentStyle[styleProp];
    } else if (window.getComputedStyle) {
      var y = document.defaultView.getComputedStyle(el,null).getPropertyValue(styleProp);
    }
    return y;
  }

  return {
    restrict: 'AE',
    controller: ngMap.MapController,
    /**
     * Initialize map and events
     * @memberof map
     * @param {$scope} scope
     * @param {angular.element} element
     * @param {Hash} attrs
     * @ctrl {MapController} ctrl
     */
    link: function (scope, element, attrs, ctrl) {
      var orgAttrs = parser.orgAttributes(element);

      scope.google = google;  //used by $scope.eval in Attr2Options to avoid eval()

      /**
       * create a new `div` inside map tag, so that it does not touch map element
       * http://stackoverflow.com/questions/20955356
       */
      var el = document.createElement("div");
      el.style.width = "100%";
      el.style.height = "100%";
      element.prepend(el);

      /**
       * if style is not given to the map element, set display and height
       */
      if (getStyle(element[0], 'display') != "block") {
        element.css('display','block');
      }
      if (getStyle(element[0], 'height').match(/^0/)) {
        element.css('height','300px');
      }

      /**
       * initialize function
       */
      var initializeMap = function(mapOptions, mapEvents) {
        var map = new google.maps.Map(el, {});
        map.markers = {};
        map.shapes = {};
        ctrl.options = attrs;

        /**
         * resize the map to prevent showing partially, in case intialized too early
         */
        $timeout(function() {
          google.maps.event.trigger(map, "resize");
        });

        /**
         * set options
         */
        mapOptions.zoom = mapOptions.zoom || 15;
        var center = mapOptions.center;
        if (!center || center === 'auto') {
          mapOptions.center = new google.maps.LatLng(0,0);
        } else if (!(center instanceof google.maps.LatLng)) {
          delete mapOptions.center;
          Attr2Options.setDelayedGeoLocation(map, 'setCenter',
              center, {fallbackLocation: options.geoFallbackCenter});
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
        parser.observeAttrSetObj(orgAttrs, attrs, map);

        /**
         * set controller and set objects
         * so that map can be used by other directives; marker or shape
         * ctrl._objects are gathered when marker and shape are initialized before map is set
         */
        ctrl.map = map;   /* so that map can be used by other directives; marker or shape */
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
        //google.maps.event.addListenerOnce(map, "idle", function() {
        scope.$emit('mapInitialized', map);
        //});

        // the following lines will be deprecated on behalf of mapInitialized
        // to collect maps, we should use scope.maps in your own controller, i.e. MyCtrl
        scope.maps = scope.maps || {};
        scope.maps[options.id||Object.keys(scope.maps).length] = map;
        scope.$emit('mapsInitialized', scope.maps);
      }; // function initializeMap()

      /**
       * get map options and events
       */
      var filtered = parser.filter(attrs);
      var options = parser.getOptions(filtered, scope);
      var controlOptions = parser.getControlOptions(filtered);
      var mapOptions = angular.extend(options, controlOptions);
      var mapEvents = parser.getEvents(scope, filtered);
      console.log("filtered", filtered, "mapOptions", mapOptions, 'mapEvents', mapEvents);

      if (attrs.initEvent) { // allows controlled initialization
        scope.$on(attrs.initEvent, function() {
          !ctrl.map && initializeMap(mapOptions, mapEvents); // init if not done
        });
      } else {
        initializeMap(mapOptions, mapEvents);
      } // if
    }
  };
}]);
