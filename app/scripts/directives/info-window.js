/**
 * @ngdoc directive
 * @name info-window
 * @requires Attr2Options
 * @requires $compile
 * @description
 *   Defines infoWindow and provides compile method
 *
 *   Requires:  map directive
 *
 *   Restrict To:  Element
 *
 * @param {Boolean} visible Indicates to show it when map is initialized
 * @param {Boolean} visible-on-marker Indicates to show it on a marker when map is initialized
 * @param {Expression} geo-callback if position is an address, the expression is will be performed when geo-lookup is successful. e.g., geo-callback="showDetail()"
 * @param {String} &lt;InfoWindowOption> Any InfoWindow options,
 *        https://developers.google.com/maps/documentation/javascript/reference?csw=1#InfoWindowOptions
 * @param {String} &lt;InfoWindowEvent> Any InfoWindow events, https://developers.google.com/maps/documentation/javascript/reference
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
        console.log("infoWindow events", events);
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
      console.log('infoWindow', 'options', options, 'events', events);

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
