/**
 * @ngdoc directive
 * @name drawing-manager
 * @param Attr2Options {service} convert html attribute to Gogole map api options
 * @description
 *   Requires:  map directive
 *   Restrict To:  Element
 *
 * @example
 * Example:
 *
 *  <map zoom="13" center="37.774546, -122.433523" map-type-id="SATELLITE">
 *    <drawing-manager  on-overlaycomplete="onMapOverlayCompleted()" position="ControlPosition.TOP_CENTER" drawingModes="POLYGON,CIRCLE" drawingControl="true" circleOptions="fillColor: '#FFFF00';fillOpacity: 1;strokeWeight: 5;clickable: false;zIndex: 1;editable: true;" ></drawing-manager>
 *  </map>
 *
 *  TODO: Add remove button.
 *  currently, for out solution, we have the shapes/markers in our own controller, and we use some css classes to change the shape button
 *  to a remove button (<div>X</div>) and have the remove operation in our own controller.
 */
(function() {
  'use strict';
  angular.module('ngMap').directive('drawingManager', ['Attr2Options', function(Attr2Options) {
    var parser = Attr2Options;

    return {
      restrict: 'E',
      require: '^map',

      link: function(scope, element, attrs, mapController) {
        var orgAttrs = parser.orgAttributes(element);
        var filtered = parser.filter(attrs);
        var options = parser.getOptions(filtered);
        var controlOptions = parser.getControlOptions(filtered);
        var events = parser.getEvents(scope, filtered);

        console.log("filtered", filtered, "options", options, 'controlOptions', controlOptions, 'events', events);

        /**
         * set options
         */
        var drawingManager = new google.maps.drawing.DrawingManager({
          drawingMode: options.drawingmode,
          drawingControl: options.drawingcontrol,
          drawingControlOptions: controlOptions.drawingControlOptions,
          circleOptions:options.circleoptions,
          markerOptions:options.markeroptions,
          polygonOptions:options.polygonoptions,
          polylineOptions:options.polylineoptions,
          rectangleOptions:options.rectangleoptions
        });


        /**
         * set events
         */
        var events = parser.getEvents(scope, filtered);
        for (var eventName in events) {
          google.maps.event.addListener(drawingManager, eventName, events[eventName]);
        }

        mapController.addObject('mapDrawingManager', drawingManager);
      }
    }; // return
  }]);
})();
