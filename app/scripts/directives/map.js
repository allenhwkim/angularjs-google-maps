/**
 * @ngdoc directive
 * @name map
 * @memberof ngMap
 */

ngMap.directives.map = function(Attr2Options, $parse, NavigatorGeolocation, GeoCoder, $compile) {
  var parser = Attr2Options;

  /**
   * Initialize map and events
   * @param scope
   * @param element
   * @param attrs
   * @return map object
   */ 
  return {
    restrict: 'AE',
    controller: ngMap.directives.MapController,
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
      scope.map = new google.maps.Map(el, {});
      console.log('scope.map', scope.map);

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
       * initialize map
       */
      if (mapOptions.center instanceof Array) {
        var lat = mapOptions.center[0], lng= mapOptions.center[1];
        ctrl.initMap(mapOptions, new google.maps.LatLng(lat,lng), mapEvents);
      } else if (typeof mapOptions.center == 'string') { //address
        GeoCoder.geocode({address: mapOptions.center})
          .then(function(results) {
            ctrl.initMap(mapOptions, results[0].geometry.location, mapEvents);
          });
      } else if (!mapOptions.center) { //no center given, use current location
        NavigatorGeolocation.getCurrentPosition()
          .then(function(position) {
            var lat = position.coords.latitude, lng = position.coords.longitude;
            ctrl.initMap(mapOptions, new google.maps.LatLng(lat,lng), mapEvents);
          });
      } 

      var markers = ctrl.initMarkers();
      scope.$emit('markersInitialized', markers);  

      var shapes = ctrl.initShapes();
      scope.$emit('shapesInitialized', shapes);  

      var infoWindows = ctrl.initInfoWindows();
      scope.$emit('infoWindowsInitialized', [infoWindows, scope.showInfoWindow]);  

      var markerClusterer= ctrl.initMarkerClusterer();
      scope.$emit('markerClustererInitialized', markerClusterer);  
    }
  }; // return
}; // function
ngMap.directives.map.$inject = ['Attr2Options', '$parse', 'NavigatorGeolocation', 'GeoCoder', '$compile'];
