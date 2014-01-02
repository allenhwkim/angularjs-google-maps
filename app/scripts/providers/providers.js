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
       */
      this.filter = function(attrs) {
        var options = {};
        for(var key in attrs) {
          if (key.match(/^\$/));
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
          } else if (key.match(/ControlOptions$/)) { // skip controlOptions
            continue
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
            var safeJs = attrs[key].replace(/[\n\r\;]/g,'');
            events[eventName] = function(event) { eval(safeJs) }
          }
        }
        return events;
      }

      // control means map controls, i.e streetview, pan, etc, not a general control
      this.getControlOptions = function(filtered) {
        var controlOptions = {};

        for (var attr in filtered) {
          if (!attr.match(/(.*)ControlOptions$/)) { 
            continue; // if not controlOptions, skip it
          }

          //change invalid json to valid one, i.e. {foo:1} to {"foo": 1}
          var orgValue = filtered[attr];
          var newValue = orgValue.replace(/'/g, '"');
          newValue = newValue.replace(/([^"]+)|("[^"]+")/g, function($0, $1, $2) {
            if ($1) {
                return $1.replace(/([a-zA-Z0-9]+?):/g, '"$1":');
            } else {
                return $2; 
            } 
          });
          try {
            var options = JSON.parse(newValue);
            for (var key in options) { //assign the right values
              var value = options[key];
              if (typeof value  == 'string') {
                var value = value.toUpperCase();
              } else if (key == "mapTypeIds") {
                var value = value.map(function(str) {
                  return google.maps.MapTypeId[str.toUpperCase()];
                });
              } 
              
              if (key == "style") {
                var str = attr.charAt(0).toUpperCase() + attr.slice(1);
                var objName = str.replace(/Options$/,'')+"Style";
                options[key] = google.maps[objName][value];
              } else if (key == "position") {
                options[key] = google.maps.ControlPosition[value];
              } else {
                options[key] = value;
              }
            }
            controlOptions[attr] = options;
          } catch (e) {
            console.error('invald option for', attr, newValue, e, e.stack);
          }
        } // for

        return controlOptions;
      } // function
    }; // return
  } // $.get
});
