/**
 * @namespace ngMap.directives.markerClusterer
 */
var ngMap = ngMap || {};
ngMap.directives = ngMap.directives || {};
/**
 * @memberof ngMap.directives.markerClusterer
 * @name deps
 */
ngMap.directives.markerClusterer = { deps: ['Attr2Options'] };
/**
 * @memberof ngMap.directives.markerClusterer
 * @name func
 */
ngMap.directives.markerClusterer.func  = function(Attr2Options) {
  //var parser = new Attr2Options();
  var parser = Attr2Options;

  return {
    restrict: 'E',
    require: '^map',
    /**
     * @memberof ngMap.directives.markerClusterer
     * link function
     */
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
