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

  var requestTimeout, routeRequest;
  // Delay for each route render to accumulate all requests into a single one
  // This is required for simultaneous origin\waypoints\destination change
  // 20ms should be enough to merge all request data
  var routeRenderDelay = 20;

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
    if (request) {
      for(var key in request) {
        if (request.hasOwnProperty(key)) {
          (validKeys.indexOf(key) === -1) && (delete request[key]);
        }
      }
    }

    if(request.waypoints) {
      // Check for acceptable values
      if(!Array.isArray(request.waypoints)) {
        delete request.waypoints;
      }
    }

    var showDirections = function(request) {
      if (requestTimeout && request) {
        if (!routeRequest) {
          routeRequest = request;
        } else {
          for (var attr in request) {
            if (request.hasOwnProperty(attr)) {
              routeRequest[attr] = request[attr];
            }
          }
        }
      } else {
        requestTimeout = $timeout(function() {
          if (!routeRequest) {
            routeRequest = request;
          }
          directionsService.route(routeRequest, function(response, status) {
            if (status == google.maps.DirectionsStatus.OK) {
              renderer.setDirections(response);
              // Unset request for the next call
              routeRequest = undefined;
            }
          });
          $timeout.cancel(requestTimeout);
          // Unset expired timeout for the next call
          requestTimeout = undefined;
        }, routeRenderDelay);
      }
    };

    if (request && request.origin && request.destination) {
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

      var attrsToObserve = [];
      if (!filtered.noWatcher) {
          attrsToObserve = parser.getAttrsToObserve(orgAttrs);
      }

      var renderer = getDirectionsRenderer(options, events);
      mapController.addObject('directionsRenderers', renderer);

      attrsToObserve.forEach(function(attrName) {
        (function(attrName) {
          attrs.$observe(attrName, function(val) {
            if (attrName == 'panel') {
              $timeout(function(){
                var panel =
                  document.getElementById(val) || document.querySelector(val);
                console.log('setting ', attrName, 'with value', panel);
                panel && renderer.setPanel(panel);
              });
            } else if (options[attrName] !== val) { //apply only if changed
              var optionValue = parser.toOptionValue(val, {key: attrName});
              console.log('setting ', attrName, 'with value', optionValue);
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

