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
          var controlOptions = parser.getControlOptions(filtered);
          for (key in controlOptions) {
            mapOptions[key] = controlOptions[key];
          }

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

