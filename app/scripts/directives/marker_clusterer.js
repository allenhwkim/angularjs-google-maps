/**
 * @ngdoc directive
 * @name marker-clusterer
 * @requires Attr2Options 
 * @description 
 *   Initialize a Google map with marker-clusterer
 *   
 *   Requires:  map directive
 *
 *   Restrict To:  Element Or Attribute
 *
 * @param {Array} markers The initial markers for this marker clusterer  
 *   The options of each marker must be exactly the same as options of marker directive.  
 *   The markers are also will be set to $scope.markers
 * @param {String} &lt;MarkerClustererOption> Any MarkerClusterer options,  
 *   http://google-maps-utility-library-v3.googlecode.com/svn/trunk/markerclustererplus/docs/reference.html#MarkerClustererOptions
 *
 * @example
 * Usage: 
 *   <map MAP_ATTRIBUTES>
 *    <marker-clusterer markers="DATA" ANY_MARKER_CLUSTERER_OPTIONS"></marker-clusterer>
 *   </map>
 *
 * Example: 
 *   <map zoom="1" center="[43.6650000, -79.4103000]">
 *      <marker-clusterer markers="markersData" max-zoom="2">
 *   </marker-clusterer>
 *
 *   For full working example, please visit https://rawgit.com/allenhwkim/angularjs-google-maps/master/build/marker_clusterer.html
 */
ngMap.directives.markerClusterer  = function(Attr2Options) {
  //var parser = new Attr2Options();
  var parser = Attr2Options;

  return {
    restrict: 'AE',
    require: '^map',
    link: function(scope, element, attrs, mapController) {
      var markersData = scope.$eval(attrs.markers);
      delete attrs.markers;
      //var options = new parser.filter(attrs);
      var options = parser.filter(attrs);

      var markers = [];
      for (var i=0; i< markersData.length; i++) {
        var data = markersData[i];

        var lat = data.position[0], lng = data.position[1];
        data.position = new google.maps.LatLng(lat,lng);
        var marker = new google.maps.Marker(data);
        
        var markerEvents = parser.getEvents(scope, data);
        for (var eventName in markerEvents) {
          if (eventName) {
            google.maps.event.addListener(marker, eventName, markerEvents[eventName]);
          }
        }
        markers.push(marker);
      } // for (var i=0;..
      mapController.markers = markers;
      mapController.markerClusterer =  { data: markers, options:options };
      console.log('markerClusterer', mapController.markerClusterer);
    } //link
  }; // return
};// function
ngMap.directives.markerClusterer.$inject  = ['Attr2Options'];
