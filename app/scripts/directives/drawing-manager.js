/**
 * @ngdoc directive
 * @name drawing-manager
 * @requires Attr2Options
 * @description
 *   Requires:  map directive
 *   Restrict To:  Element
 *
 * @example
 * Example:
 *
 *  <map zoom="13" center="37.774546, -122.433523" map-type-id="SATELLITE">
 *      <drawing-manager  on-overlaycomplete="onMapOverlayCompleted()" position="ControlPosition.TOP_CENTER" drawingModes="POLYGON,CIRCLE" drawingControl="true" circleOptions="fillColor: '#FFFF00';fillOpacity: 1;strokeWeight: 5;clickable: false;zIndex: 1;editable: true;" ></drawing-manager>
 *  </map>
 */
/*jshint -W089*/
ngMap.directive('drawingManager', ['Attr2Options', function(Attr2Options) {
    var parser = Attr2Options;


    var getShape = function(shapeName){
        var supportShapes = ["marker","circle","polygon","polyline","rectangle"];
        if(supportShapes.indexOf(shapeName.trim().toLowerCase()) !== -1){
            return google.maps.drawing.OverlayType[shapeName.trim().toUpperCase()];
        }
    }

    return {
        restrict: 'E',
        require: '^map',

        link: function(scope, element, attrs, mapController) {
            var orgAttrs = parser.orgAttributes(element);
            var filtered = parser.filter(attrs);
            var options = parser.getOptions(filtered);
            var events = parser.getEvents(scope, filtered);


            /**
             * set options
             */
            var drawingModes = options.drawingmodes.split(',').map(function(shape){return getShape(shape);});
            var drawingManager = new google.maps.drawing.DrawingManager({
                drawingMode: options.drawingmode,
                drawingControl: options.drawingcontrol,
                drawingControlOptions: {
                    position: options.position,
                    drawingModes: drawingModes
                },
                circleOptions:options.circleoptions
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
