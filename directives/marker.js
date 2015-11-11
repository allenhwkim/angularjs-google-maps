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
          console.log('setting default marker options', 
            key, NgMap.defaultOptions.marker);
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
      console.log("markerEvents", events);
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
    var markerOptions = parser.getOptions(filtered, scope);
    var markerEvents = parser.getEvents(scope, filtered);
    console.log('marker options', markerOptions, 'events', markerEvents);

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
