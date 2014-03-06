/* global ngMap */
/* global google */
ngMap.directive('shape', ['Attr2Options', function(Attr2Options) {
    var parser = new Attr2Options();
    
    var getPoints = function(array) { // return latitude && longitude points
        if (array[0] && array[0] instanceof Array) { // [[1,2],[3,4]] 
            return array.map(function(el) {
                return new google.maps.LatLng(el[0], el[1]);
            });
        } else {
            return new google.maps.LatLng(array[0],array[1]);            
        }
    };
    
    var getBounds = function(array) {
        var points = getPoints(array);
        return new google.maps.LatLngBounds(points[0], points[1]);
    };
    
    var getShape = function(shapeName, options) {
        switch(shapeName) {
        case "circle":
            options.center = getPoints(options.center);
            return new google.maps.Circle(options);
        case "polygon":
            options.paths = getPoints(options.paths);
            return new google.maps.Polygon(options);
        case "polyline": 
            options.path = getPoints(options.path);
            return new google.maps.Polyline(options);
        case "rectangle": 
            options.bounds = getBounds(options.bounds);
            return new google.maps.Rectangle(options);
        case "groundOverlay":
        case "image":
            var url = options.url;
            var bounds = getBounds(options.bounds);
            var opts = {opacity: options.opacity, clickable: options.clickable};
            return new google.maps.GroundOverlay(url, bounds, opts);
        }
        return null;
    };
    
    return {
        restrict: 'E',
        require: '^map',
        link: function(scope, element, attrs, mapController) {
            var filtered = parser.filter(attrs);
            var shapeName = filtered.name;
            delete filtered.name;    //remove name bcoz it's not for options
            
            var shapeOptions = parser.getOptions(filtered);
            console.log('shape', shapeName, 'options', shapeOptions);
            var shape = getShape(shapeName, shapeOptions);
            if (shape) {
                mapController.shapes.push(shape);
            } else {
                console.error("shape", shapeName, "is not defined");
            }
            
            //shape events
            var events = parser.getEvents(scope, filtered);
            console.log("shape", shapeName, "events", events);
            for (var eventName in events) {
                if (events[eventName]) {
                    console.log(eventName, events[eventName]);
                    google.maps.event.addListener(shape, eventName, events[eventName]);
                }
            }
        }
     };
}]);
