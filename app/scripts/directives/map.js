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

