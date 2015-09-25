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
 * @attr {Object} geo-location-options
 *    The navigator geolocation options. i.e. { maximumAge: 3000, timeout: 5000, enableHighAccuracy: true }. If none specified, { timeout: 5000 }. If timeout not specified, timeout: 5000 added
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
 * @attr {Boolean} single-info-window
 *    When true the map will only display one info window at the time, if not set or false,
 *    everytime an info window is open it will be displayed with the othe one.
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
          ctrl.getGeoLocation(center, options.geoLocationOptions).then(function (latlng) {
            map.setCenter(latlng);
            var geoCallback = attrs.geoCallback;
            geoCallback && $parse(geoCallback)(scope);
          }, function (error) {
            map.setCenter(options.geoFallbackCenter);
          });
        }
        map.setOptions(mapOptions);

        ctrl.singleInfoWindow = mapOptions.singleInfoWindow;

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
      console.log("filtered", filtered, "mapOptions", mapOptions, 'mapEvents', mapEvents);

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
