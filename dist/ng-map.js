var ngMap = angular.module('ngMap', []);  //map directives

ngMap.directive('control', ['Attr2Options', function(Attr2Options) {
  
  var optionBuilders = {
    "mapType": function(attrs) {
        var options = {};
        for (var key in attrs) {
          switch(key) {
            case 'mapTypeIds':
              var ids = attrs[key].match(/\[?([A-Z,\ ]+)\]?/)[1].split(",");
              ids = ids.map(function(id) {
                var constant = id.replace(/\s+/g,'').toUpperCase();
                return google.maps.MapTypeId[id.replace(/\s+/g, '')];
              });
              options[key] = ids;
              break;
            case 'position':
              options[key] = google.maps.ControlPosition[attrs[key].toUpperCase()];
              break;
            case 'style':
              options[key] = google.maps.MapTypeControlStyle[attrs[key].toUpperCase()];
              break;
            default:
              options[key] = attrs[key];
              break;
          }
        }
        return options;
      },
    "overviewMap": function(attrs) {
        var options = {};
        for (var key in attrs) {
          switch(key) {
            case 'opened':
              options[key] = (attrs[key] == "true" || attrs[key] == "1");
              break;
            default:
              options[key] = attrs[key];
              break;
          }
        }
        return options;
      },
    "pan": function(attrs) {
        var options = {};
        for (var key in attrs) {
          switch(key) {
            case 'position':
              options[key] = google.maps.ControlPosition[attrs[key].toUpperCase()];
              break;
            case 'style':
              options[key] = google.maps.ScaleControlStyle[attrs[key].toUpperCase()];
              break;
            default:
              options[key] = attrs[key];
              break;
          }
        }
        return options;
      },    
    "streetView": function(attrs) {
        var options = {};
        for (var key in attrs) {
          switch(key) {
            case 'position':
              options[key] = google.maps.ControlPosition[attrs[key].toUpperCase()];
              break;
            default:
              options[key] = attrs[key];
              break;
          }
        }
        return options;
      },
    "zoom": function(attrs) {
        var options = {};
        for (var key in attrs) {
          switch(key) {
            case 'position':
              options[key] = google.maps.ControlPosition[attrs[key].toUpperCase()];
              break;
            case 'style':
              options[key] = google.maps.ZoomControlStyle[attrs[key].toUpperCase()];
              break;
            default:
              options[key] = attrs[key];
              break;
          }
        }
        return options;
      },
    "rotate": function(attrs) {
        var options = {};
        for (var key in attrs) {
          switch(key) {
            case 'position':
              options[key] = google.maps.ControlPosition[attrs[key].toUpperCase()];
              break;
            default:
              options[key] = attrs[key];
              break;
          }
        }
        return options;
      },
    "scale": function(attrs) {
        var options = {};
        for (var key in attrs) {
          switch(key) {
            case 'position':
              options[key] = google.maps.ControlPosition[attrs[key].toUpperCase()];
              break;
            case 'style':
              options[key] = google.maps.ScaleControlStyle[attrs[key].toUpperCase()];
              break;
            default:
              options[key] = attrs[key];
              break;
          }
        }
        return options;
      }
  };
  
  return {
    restrict: 'E',
    require: '^map',
    link: function(scope, element, attrs, mapController) {
      var filtered = new Attr2Options(attrs);
      var controlName = filtered.name;
      delete filtered.name;  //remove name bcoz it's not for options
      
      optionBuilder = optionBuilders[controlName];
      if (optionBuilder) {
        var controlOptions = optionBuilder(filtered);
        mapController.setControl(controlName, controlOptions);
      } else {
        console.error(controlName, "does not have option builder");
      }
    }
  };
}]);

ngMap.directive('map', ['Attr2Options', '$parse', function (Attr2Options, $parse) {
  
  var getOptions = function (attrs) {
    var options = {};
    for(var key in attrs) {
      if (key.match(/^on[A-Z]/)) { //skip events, i.e. on-click
        continue;
      }
      var val = attrs[key];
      try { // 1. Number?
        var num = Number(val);
        if (isNaN(num))
          throw "Not a number";
        else 
          options[key] = num;
      } catch(err) { 
        try { // 2.JSON?
          options[key] = JSON.parse(val);
        } catch(err) {
          // 3. Object Expression. i.e. LatLng(80,-49)
          if (val.match(/^[A-Z][a-zA-Z0-9]+\(.*\)$/)) {
            try {
              var exp = "new google.maps."+val;
              options[key] = eval(exp); // Warning!! eval can be harmful
            } catch(e) {
              options[key] = val;
            } 
          } else if (val.match(/^[A-Z][a-zA-Z0-9]+\.[A-Z]+$/)) {
            try {
              options[key] = eval("google.maps."+val);
            } catch(e) {
              options[key] = val;
            } 
          } else {
            options[key] = val;
          }
        }
      }
    }
    return options;
  };
  
  var getEvents = function (scope, attrs) {
    var events = {};
    for(var key in attrs) {
      if (!key.match(/^on[A-Z]/)) { //skip events, i.e. on-click
        continue;
      }
      
      //get event name as underscored. i.e. zoom_changed
      var eventName = key.replace(/^on/,'');
      eventName = eventName.charAt(0).toLowerCase() + eventName.slice(1);
      eventName = eventName.replace(/([A-Z])/g, function($1){
        return "_"+$1.toLowerCase();
      });

      var funcName = attrs[key].replace(/\(.*\)/,'');
      var func = scope.$eval(funcName);
      if (func instanceof Function) {
        events[eventName] = func;
      } else {
        console.error(eventName, 'does not have value of a function');
      }
    }
    return events;
  };
  
  
  var controls = {};
  var markers = [];
  var shapes = [];
  
  return {
    restrict: 'AE',
    controller: ['$scope', function($scope) {
      this.getOptions = getOptions;  //used by children directives, i.e. marker, shape
      this.getEvents = getEvents; //used by children directives
      this.setControl = function(controlName, controlOptions) {
        controls[controlName] = controlOptions;
      };
      this.addMarker = function(marker) {
        markers.push(marker);
      };
      this.addShape = function(shape) {
        shapes.push(shape);
      };
    }],
    link: function (scope, element, attrs, ctrl) {
      //map and map.controls
      var filtered = new Attr2Options(attrs);
      var mapOptions = getOptions(filtered);
      if (mapOptions.center instanceof Array) {
        var lat = mapOptions.center[0], lng= mapOptions.center[1];
        mapOptions.center = new google.maps.LatLng(lat,lng);
      }
      
      for (var name in controls) {
        mapOptions[name+"Control"] = controls[name].enabled === "false" ? 0:1;
        delete controls[name].enabled;
        mapOptions[name+"ControlOptions"] = controls[name];
      }
      
      console.log("mapOptions", mapOptions);
      map = new google.maps.Map(element[0], mapOptions);
      
      //map events
      var events = getEvents(scope, filtered);
      console.log("mapEvents", events);
      for (var eventName in events) {
        google.maps.event.addListener(map, eventName, events[eventName]);
      }

      //markers
      markers.forEach(function(marker) {
        marker.setMap(map);
      });
      
      //shapes i.e. rectangle, circle
      shapes.forEach(function(shape) {
        shape.setMap(map);
      });

      //assign map to parent scope  
      scope.map = map;
      
      //assign markers to parent scope, map.markers      
      var hash = {};
      for (var i=0; i<markers.length; i++) {
        hash[markers[i].id || i] = markers[i];
      }
      scope.map.markers = hash;

      //assign shapes to parent scope, map.shapes      
      var hash = {};
      for (var i=0; i<shapes.length; i++) {
        hash[shapes[i].id || i] = shapes[i];
      }
      scope.map.shapes = hash;
    }
  };
}]);


ngMap.directive('marker', ['Attr2Options', function(Attr2Options) {
  
  return {
    restrict: 'E',
    require: '^map',
    link: function(scope, element, attrs, mapController) {
      var filtered = new Attr2Options(attrs);
      var markerOptions = mapController.getOptions(filtered);
      if (markerOptions.position instanceof Array) {
        var lat = markerOptions.position[0], lng= markerOptions.position[1];
        markerOptions.position = new google.maps.LatLng(lat,lng);
      }
      console.log("marker options", markerOptions);
      
      var marker = new google.maps.Marker(markerOptions);
      mapController.addMarker(marker);
      
      //marker events
      var events = mapController.getEvents(scope, filtered);
      console.log("markerEvents", events);
      for (var eventName in events) {
        google.maps.event.addListener(marker, eventName, events[eventName]);
      }
    }
  };
}]);

ngMap.directive('shape', ['Attr2Options', function(Attr2Options) {
  
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
        return new google.maps.GroundOverlay(url, bounds, opts)
        return new google.maps.GroundOverlay(options);
    }
    return null;
  };
  
  return {
    restrict: 'E',
    require: '^map',
    link: function(scope, element, attrs, mapController) {
      var filtered = new Attr2Options(attrs);
      var shapeName = filtered.name;
      delete filtered.name;  //remove name bcoz it's not for options
      
      var shapeOptions = mapController.getOptions(filtered);
      console.log('shape', shapeName, 'options', shapeOptions);
      var shape = getShape(shapeName, shapeOptions);
      if (shape) {
        mapController.addShape(shape);
      } else {
        console.error("shape", shapeName, "is not defined");
      }
      
      //shape events
      var events = mapController.getEvents(scope, filtered);
      console.log("shape", shapeName, "events", events);
      for (var eventName in events) {
        google.maps.event.addListener(shape, eventName, events[eventName]);
      }
    }
   };
}]);

/**
 * this filters out angularJs specific attributes 
 * and returns attributes to be used as options
 */
ngMap.provider('Attr2Options', function() {

  this.$get = function() {
    return function(attrs) {
    
      // filtering attributes  
      // 1. skip angularjs methods $.. $$..
      // 2. control options are handled by control directive, not in attribute
      var options = {};
      for(var key in attrs) {
        if (key.match(/^\$/));
        else if (key.match(/Control(Options)?$/)) ;
        else
          options[key] = attrs[key];
      }
      return options;
    };
  };
});
