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
