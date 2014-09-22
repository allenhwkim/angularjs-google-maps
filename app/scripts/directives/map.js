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
ngMap.directives.map = function(Attr2Options) {
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
      /*
       * without this, bird_eyes_and_street_view.html and map_options does not work.
       * I don't know why
       */
      scope.google = google; 

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

      var map = new google.maps.Map(el, {});
      map.markers = {};
      map.shapes = {};

      /**
       * set options
       */
      var center = mapOptions.center;
      if (!(center instanceof google.maps.LatLng)) {
        delete options.center;
        Attr2Options.setDelayedGeoLocation(
          map, 
          'setCenter', 
          center, 
          options.geoFallbackCenter
        );
      }
      map.setOptions(options);

      /**
       * set events
       */
      var mapEvents = parser.getEvents(scope, filtered);
      for (var eventName in mapEvents) {
        if (eventName) {
          google.maps.event.addListener(map, eventName, mapEvents[eventName]);
        }
      }

      /**
       * set observers
       */
      var attrsToObserve = parser.getAttrsToObserve(orgAttributes);
      console.log('map attrs to observe', attrsToObserve);
      for (var i=0; i<attrsToObserve.length; i++) {
        parser.observeAndSet(attrs, attrsToObserve[i], map);
      }

      /**
       * set controller and set objects
       * so that map can be used by other directives; marker or shape 
       * ctrl._objects are gathered when marker and shape are initialized before map is set
       */
      ctrl.map = map;   /* so that map can be used by other directives; marker or shape */
      ctrl.addObjects(ctrl._objects);

      /**
       * set map for scope and controller and broadcast map event
       * scope.map will be overwritten if user have multiple maps in a scope,
       * thus the last map will be set as scope.map.
       * however an `mapInitialized` event will be emitted every time.
       */
      scope.map = map;
      scope.$emit('mapInitialized', scope.map);  

      // the following lines will be deprecated on behalf of mapInitialized
      // to collect maps, we should use scope.maps in your own controller, i.e. MyCtrl
      scope.maps = scope.maps || {}; 
      scope.maps[options.id||Object.keys(scope.maps).length] = map;
      scope.$emit('mapsInitialized', scope.maps);  
    }
  }; 
}; // function
ngMap.directives.map.$inject = ['Attr2Options'];
