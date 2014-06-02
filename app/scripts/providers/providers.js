/**
 * this filters out angularJs specific attributes 
 * and returns attributes to be used as options
 */
/* global ngMap */
/* global google */
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
          if (!key.match(/^\$/)) {
            options[key] = attrs[key];
          }
        }
        return options;
      };

      /**
       * converting attributes hash to Google Maps API v3 options
       */
      this.getOptions = function(attrs, scope) {
        var options = {};
        for(var key in attrs) {
          if (attrs[key]) {
            if (key.match(/^on[A-Z]/)) { //skip events, i.e. on-click
              continue;
            } else if (key.match(/ControlOptions$/)) { // skip controlOptions
              continue;
            }

            var val = attrs[key];
            try { // 1. Number?
              var num = Number(val);
              if (isNaN(num)) {
                throw "Not a number";
              } else  {
                options[key] = num;
              }
            } catch(err) { 
              try { // 2.JSON?
                options[key] = JSON.parse(val);
              } catch(err2) {
                // 3. Object Expression. i.e. LatLng(80,-49)
                if (val.match(/^[A-Z][a-zA-Z0-9]+\(.*\)$/)) {
                  try {
                    var exp = "new google.maps."+val;
                    options[key] = scope.$eval(exp);
                  } catch(e) {
                    options[key] = val;
                  } 
                // 4. Object Expression. i.e. MayTypeId.HYBRID 
                } else if (val.match(/^[A-Z][a-zA-Z0-9]+\.[A-Z]+$/)) {
                  try {
                    options[key] = scope.$eval("google.maps."+val);
                  } catch(e) {
                    options[key] = val;
                  } 
                // 5. Object Expression. i.e. HYBRID 
                } else if (val.match(/^[A-Z]+$/)) {
                  try {
                    var capitializedKey = key.charAt(0).toUpperCase() + key.slice(1);
                    options[key] = scope.$eval("google.maps."+capitializedKey+"."+val);
                  } catch(e) {
                    options[key] = val;
                  } 
                } else {
                  options[key] = val;
                }
              } // catch(err2)
            } // catch(err)
          } // if (attrs[key])
        } //for(var key in attrs)
        return options;
      };

      /**
       * converting attributes hash to scope-specific function 
       * scope is to validate a function within the scope
       */
      this.getEvents = function(scope, attrs) {
        var events = {};
        var toLowercaseFunc = function($1){
          return "_"+$1.toLowerCase();
        };
        var eventFunc = function(attrValue) {
          var matches = attrValue.match(/([^\(]+)\(([^\)]*)\)/);
          var funcName = matches[1];
          var argsStr = matches[2].replace(/event[ ,]*/,'');  //remove string 'event'
          
          var args = scope.$eval("["+argsStr+"]");
          return function(event) {
            scope[funcName].apply(this, [event].concat(args));
          }
        }

        for(var key in attrs) {
          if (attrs[key]) {
            if (!key.match(/^on[A-Z]/)) { //skip if not events
              continue;
            }
            
            //get event name as underscored. i.e. zoom_changed
            var eventName = key.replace(/^on/,'');
            eventName = eventName.charAt(0).toLowerCase() + eventName.slice(1);
            eventName = eventName.replace(/([A-Z])/g, toLowercaseFunc);

            var attrValue = attrs[key];
            events[eventName] = new eventFunc(attrValue);
          }
        }
        return events;
      }

      // control means map controls, i.e streetview, pan, etc, not a general control
      this.getControlOptions = function(filtered) {
        var controlOptions = {};

        for (var attr in filtered) {
          if (filtered[attr]) {
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
                if (options[key]) {
                  var value = options[key];
                  if (typeof value === 'string') {
                    value = value.toUpperCase();
                  } else if (key === "mapTypeIds") {
                    value = value.map( function(str) {
                      return google.maps.MapTypeId[str.toUpperCase()];
                    });
                  } 
                  
                  if (key === "style") {
                    var str = attr.charAt(0).toUpperCase() + attr.slice(1);
                    var objName = str.replace(/Options$/,'')+"Style";
                    options[key] = google.maps[objName][value];
                  } else if (key === "position") {
                    options[key] = google.maps.ControlPosition[value];
                  } else {
                    options[key] = value;
                  }
                }
              }
              controlOptions[attr] = options;
            } catch (e) {
              console.error('invald option for', attr, newValue, e, e.stack);
            }
          }
        } // for

        return controlOptions;
      }; // function
    }; // return
  }; // $.get
});
