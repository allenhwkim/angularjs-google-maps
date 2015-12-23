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
 * @attr {Boolean} trigger-resize
 *  Default to false.  Set to true to trigger resize of the map.  Needs to be done anytime you resize the map
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
