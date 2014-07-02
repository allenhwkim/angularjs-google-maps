/**
 * @ngdoc directive
 * @name info-window
 * @requires Attr2Options 
 * @description 
 *   Initialize a Google map InfoWindow and set a scope method `showInfoWindow` 
 *   
 *   Requires:  map directive
 *
 *   Restrict To:  Element Or Attribute
 *
 * @param {String} &lt;InfoWindowOption> Any InfoWindow options, https://developers.google.com/maps/documentation/javascript/reference?csw=1#InfoWindowOptions
 * @param {String} &lt;InfoWindowEvent> Any InfoWindow events, https://developers.google.com/maps/documentation/javascript/reference
 * @example
 * Example: 
 *   <map center="[40.74, -74.18]">
 *     <marker position="the cn tower" on-click="showInfoWindow(event, 'marker-info'"></marker>
 *     <info-window id="marker-info" style="display: none;">
 *       <h1> I am an InfoWindow </h1>
 *       I am here at [[this.getPosition()]]
 *     </info-window>
 *   </map>
 *
 * For working example, please visit:  
 *   https://rawgit.com/allenhwkim/angularjs-google-maps/master/build/marker_with_info_window.html
 */
ngMap.directives.infoWindow = function(Attr2Options) {
  var parser = Attr2Options;

  return {
    restrict: 'AE',
    require: '^map',
    link: function(scope, element, attrs, mapController) {
      var filtered = parser.filter(attrs);

      /**
       * set infoWindow options
       */
      scope.google = google;
      var options = parser.getOptions(filtered, scope);
      if (options.pixelOffset) {
        options.pixelOffset = google.maps.Size.apply(this, options.pixelOffset);
      }
      var infoWindow = new google.maps.InfoWindow(options);
      infoWindow.contents = element.html();

      /**
       * set infoWindow events
       */
      var events = parser.getEvents(scope, filtered);
      for(var eventName in events) {
        if (eventName) {
          google.maps.event.addListener(infoWindow, eventName, events[eventName]);
        }
      }

      // set infoWindows to map controller
      mapController.infoWindows.push(infoWindow);

      // do NOT show this
      element.css({display:'none'});

      //provide showInfoWindow function to scope
      scope.showInfoWindow = function(event, id, options) {
        var infoWindow = scope.infoWindows[id];
        var contents = infoWindow.contents;
        var matches = contents.match(/\[\[[^\]]+\]\]/g);
        if (matches) {
          for(var i=0, length=matches.length; i<length; i++) {
            var expression = matches[i].replace(/\[\[/,'').replace(/\]\]/,'');
            try {
              contents = contents.replace(matches[i], eval(expression));
            } catch(e) {
              expression = "options."+expression;
              contents = contents.replace(matches[i], eval(expression));
            }
          }
        }
        infoWindow.setContent(contents);
        infoWindow.open(scope.map, this);
      };
    } // link
  };// return
};// function
ngMap.directives.infoWindow.$inject = ['Attr2Options'];
