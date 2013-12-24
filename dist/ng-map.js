var ngMap = angular.module('ngMap', []);  //map directives

ngMap.directive('control', ['Attr2Options', function(Attr2Options) {
  var parser = new Attr2Options();
  
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
      var filtered = new parser.filter(attrs);
      var controlName = filtered.name;
      delete filtered.name;  //remove name bcoz it's not for options
      
      optionBuilder = optionBuilders[controlName];
      if (optionBuilder) {
        var controlOptions = optionBuilder(filtered);
        mapController.controls[controlName] = controlOptions;
      } else {
        console.error(controlName, "does not have option builder");
      }
    }
  };
}]);

ngMap.directive('map', ['Attr2Options', '$parse', 'NavigatorGeolocation', 'GeoCoder',
  function (Attr2Options, $parse, NavigatorGeolocation, GeoCoder) {
    var parser = new Attr2Options();

    return {
      restrict: 'AE',
      controller: ['$scope', function($scope) { //parent controller scope
        this.map = null;
        this.controls = {};
        this.markers = [];
        this.shapes = [];

        /**
         * Initialize map and events
         */ 
        this.initializeMap = function(scope, element, attrs) {
          var filtered = parser.filter(attrs);
          var mapOptions = parser.getOptions(filtered);
          var _this = this;

          if (!mapOptions.zoom) {
            mapOptions.zoom = 15 //default zoom
          }
          if (mapOptions.center instanceof Array) {
            var lat = mapOptions.center[0], lng= mapOptions.center[1];
            mapOptions.center = new google.maps.LatLng(lat,lng);
          } else {
            var savedCenter = mapOptions.center;
            delete mapOptions.center; //cannot show map with center as string
          }
          
          for (var name in this.controls) {
            mapOptions[name+"Control"] = this.controls[name].enabled === "false" ? 0:1;
            delete this.controls[name].enabled;
            mapOptions[name+"ControlOptions"] = this.controls[name];
          }
          
          console.log("mapOptions", mapOptions);
          _this.map = new google.maps.Map(element[0], mapOptions);

          if (typeof savedCenter == 'string') { //address
            GeoCoder.geocode({address: savedCenter})
              .then(function(results) {
                _this.map.setCenter(results[0].geometry.location);
              });
          } else if (!mapOptions.center) { //current location
            NavigatorGeolocation.getCurrentPosition()
              .then(function(position) {
                var lat = position.coords.latitude, lng = position.coords.longitude;
                _this.map.setCenter(new google.maps.LatLng(lat, lng));
              })
          }

          //map events
          var events = parser.getEvents(scope, filtered);
          console.log("mapEvents", events);
          for (var eventName in events) {
            google.maps.event.addListener(_this.map, eventName, events[eventName]);
          }

          //assign map to parent scope  
          scope.map = _this.map;

          return _this.map;
        },

        /**
         * Initial markers for this map
         * 
         * This does not work with async. actions. i.e, geocoder
         * because markers are not added at this moment
         * Thus, markers will be watched and updated with scope.$watch
         */
        this.addMarker = function(marker) {
          marker.setMap(this.map);
          if (marker.centered) {
            this.map.setCenter(marker.position);
          }
          var len = Object.keys($scope.markers).length;
          $scope.markers[marker.id || len] = marker;
        };

        this.initializeMarkers = function() {
          $scope.markers = {};
          for (var i=0; i<this.markers.length; i++) {
            var marker = this.markers[i];
            this.addMarker(marker);
          }
        };

        /**
         * Initialize shapes for this map
         */
        this.initializeShapes = function() {
          $scope.shapes = {};
          for (var i=0; i<this.shapes.length; i++) {
            var shape = this.shapes[i];
            shape.setMap(this.map);
            $scope.shapes[shape.id || (i+1) ] = shape; // can have id as key
          }
        };

      }],
      link: function (scope, element, attrs, ctrl) {
        ctrl.initializeMap(scope, element, attrs);
        ctrl.initializeMarkers();
        ctrl.initializeShapes();
        scope.$watchCollection('markers', function(newVal, oldVal) {
          console.log('markers are changed', oldVal, newVal);
        });
      }
    }; // return
  } // function
]);


ngMap.directive('marker', [ 'Attr2Options', 'GeoCoder', 'NavigatorGeolocation', 
  function(Attr2Options, GeoCoder, NavigatorGeolocation) {
    var parser = new Attr2Options();

    return {
      restrict: 'E',
      require: '^map',
      link: function(scope, element, attrs, mapController) {
        var filtered = new parser.filter(attrs);
        var markerOptions = parser.getOptions(filtered);
        var markerEvents = parser.getEvents(scope, filtered);

        var getMarker = function() {
          var marker = new google.maps.Marker(markerOptions);
          if (Object.keys(markerEvents).length > 0)
            console.log("markerEvents", markerEvents);
          for (var eventName in markerEvents) {
            google.maps.event.addListener(marker, eventName, markerEvents[eventName]);
          }
          return marker;
        };

        if (markerOptions.position instanceof Array) {

          var lat = markerOptions.position[0]; 
          var lng = markerOptions.position[1];
          markerOptions.position = new google.maps.LatLng(lat,lng);

          console.log("adding marker with options, ", markerOptions);
          var marker = getMarker();
          mapController.markers.push(marker);
        } else if (typeof markerOptions.position == 'string') { //need to get lat/lng

          var position = markerOptions.position;

          if (position.match(/^current/i)) { // sensored position

            NavigatorGeolocation.getCurrentPosition()
              .then(function(position) {
                var lat = position.coords.latitude, lng = position.coords.longitude;
                markerOptions.position = new google.maps.LatLng(lat, lng);
                var marker = getMarker();
                mapController.addMarker(marker);
              })

          } else { //assuming it is address

            GeoCoder.geocode({address: markerOptions.position})
              .then(function(results) {
                var latLng = results[0].geometry.location;
                markerOptions.position = latLng;
                var marker = getMarker();
                mapController.addMarker(marker);
              });

          } 
        } else {
          console.error('invalid marker position', markerOptions.position);
        }
      } //link
    } // return
  } // function
]);

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
        return new google.maps.GroundOverlay(url, bounds, opts)
        return new google.maps.GroundOverlay(options);
    }
    return null;
  };
  
  return {
    restrict: 'E',
    require: '^map',
    link: function(scope, element, attrs, mapController) {
      var filtered = parser.filter(attrs);
      var shapeName = filtered.name;
      delete filtered.name;  //remove name bcoz it's not for options
      
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
    return function() {

      /**
       * filtering attributes  
       *  1. skip all angularjs methods $.. $$..
       *  2. all control related ones(this is handled by control directive)
       */
      this.filter = function(attrs) {
        var options = {};
        for(var key in attrs) {
          if (key.match(/^\$/));
          else if (key.match(/Control(Options)?$/)) ;
          else
            options[key] = attrs[key];
        }
        return options;
      };

      /**
       * converting attributes hash to Google Maps API v3 options
       */
      this.getOptions = function(attrs) {
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

      /**
       * converting attributes hash to scope-specific function 
       * scope is to validate a function within the scope
       */
      this.getEvents = function(scope, attrs) {
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
      }
    
    };
  };
});

ngMap.service('GeoCoder', ['$q', function($q) {
  return {
    geocode : function(options) {
      var deferred = $q.defer();
      var geocoder = new google.maps.Geocoder();
      geocoder.geocode(options, function (results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
          deferred.resolve(results);
        } else {
          deferred.reject('Geocoder failed due to: '+ status);
        }
      });
      return deferred.promise;
    }
  }
}]);

ngMap.service('NavigatorGeolocation', ['$q', function($q) {
  return {
    getCurrentPosition: function() {
      var deferred = $q.defer();
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          function(position) {
            deferred.resolve(position);
          }, function(evt) {
            console.error(evt);
            deferred.reject(evt);
          }
        );
      } else {
        deferred.reject("Browser Geolocation service failed.");
      }
      return deferred.promise;
    },

    watchPosition: function() {
      return "TODO";
    },

    clearWatch: function() {
      return "TODO";
    }
  }
}]);
