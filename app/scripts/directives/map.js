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
 *     . mapsInitialized
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
ngMap.directives.map = function(Attr2Options, GeoCoder) {
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
       * get original attributes, so that we can use it for observers
       */
      var orgAttributes = {};
      for (var i=0; i<element[0].attributes.length; i++) {
        var attr = element[0].attributes[i];
        orgAttributes[attr.name] = attr.value;
      }
      console.log('orgAttributes', orgAttributes);

      /**
       * initialize map
       */
      ctrl.initMap(el, mapOptions, mapEvents);
      ctrl.initMarkers();
      ctrl.initShapes();
      ctrl.initMarkerClusterer();

      /**
       * observe attributes
       */
      var attrsToObserve = parser.getAttrsToObserve(orgAttributes);
      var observeFunc = function(attrName) {
        attrs.$observe(attrName, function(val) {
          if (val) {
            console.log('observing map', attrName, val);
            var setMethod = parser.camelCase('set-'+attrName);
            var optionValue = parser.toOptionValue(val, {key: attrName});
            console.log('setting map', attrName, 'with new value', optionValue);
            if (ctrl.map[setMethod]) { //if set method does exist
              /* if address is being observed */
              if (setMethod == "setCenter" && typeof optionValue == 'string') {
                GeoCoder.geocode({address: optionValue})
                  .then(function(results) {
                    ctrl.map.setCenter(results[0].geometry.location);
                  });
              } else {
                ctrl.map[setMethod](optionValue);
              }
            }
          }
        });
      };
      console.log('map attrs to observe', attrsToObserve);
      for (var i=0; i<attrsToObserve.length; i++) {
        observeFunc(attrsToObserve[i]);
      }

      scope.maps = scope.maps || {}; scope.maps[options.id||Object.keys(scope.maps).length] = ctrl.map;
      scope.$emit('mapsInitialized', scope.maps);  
    }
  }; 
}; // function
ngMap.directives.map.$inject = ['Attr2Options', 'GeoCoder'];
