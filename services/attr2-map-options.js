/**
 * @ngdoc service
 * @name Attr2MapOptions
 * @description
 *   Converts tag attributes to options used by google api v3 objects
 */
/* global google */
(function() {
  'use strict';

  //i.e. "2015-08-12T06:12:40.858Z"
  var isoDateRE =
    /^(\d{4}\-\d\d\-\d\d([tT][\d:\.]*)?)([zZ]|([+\-])(\d\d):?(\d\d))?$/;

  var Attr2MapOptions = function(
      $parse, $timeout, $log, NavigatorGeolocation, GeoCoder,
      camelCaseFilter, jsonizeFilter
    ) {

    /**
     * Returns the attributes of an element as hash
     * @memberof Attr2MapOptions
     * @param {HTMLElement} el html element
     * @returns {Hash} attributes
     */
    var orgAttributes = function(el) {
      (el.length > 0) && (el = el[0]);
      var orgAttributes = {};
      for (var i=0; i<el.attributes.length; i++) {
        var attr = el.attributes[i];
        orgAttributes[attr.name] = attr.value;
      }
      return orgAttributes;
    };

    var getJSON = function(input) {
      var re =/^[\+\-]?[0-9\.]+,[ ]*\ ?[\+\-]?[0-9\.]+$/; //lat,lng
      if (input.match(re)) {
        input = "["+input+"]";
      }
      return JSON.parse(jsonizeFilter(input));
    };

    var getLatLng = function(input) {
      var output = input;
      if (input[0].constructor == Array) { // [[1,2],[3,4]]
        output = input.map(function(el) {
          return new google.maps.LatLng(el[0], el[1]);
        });
      } else if(!isNaN(parseFloat(input[0])) && isFinite(input[0])) {
        output = new google.maps.LatLng(output[0], output[1]);
      }
      return output;
    };

    var toOptionValue = function(input, options) {
      var output;
      try { // 1. Number?
        output = getNumber(input);
      } catch(err) {
        try { // 2. JSON?
          var output = getJSON(input);
          if (output instanceof Array) {
            // [{a:1}] : not lat/lng ones
            if (output[0].constructor == Object) {
              output = output;
            } else { // [[1,2],[3,4]] or [1,2]
              output = getLatLng(output);
            }
          }
          // JSON is an object (not array or null)
          else if (output === Object(output)) {
            // check for nested hashes and convert to Google API options
            var newOptions = options;
            newOptions.doNotConverStringToNumber = true;
            output = getOptions(output, newOptions);
          }
        } catch(err2) {
          // 3. Google Map Object function Expression. i.e. LatLng(80,-49)
          if (input.match(/^[A-Z][a-zA-Z0-9]+\(.*\)$/)) {
            try {
              var exp = "new google.maps."+input;
              output = eval(exp); /* jshint ignore:line */
            } catch(e) {
              output = input;
            }
          // 4. Google Map Object constant Expression. i.e. MayTypeId.HYBRID
          } else if (input.match(/^([A-Z][a-zA-Z0-9]+)\.([A-Z]+)$/)) {
            try {
              var matches = input.match(/^([A-Z][a-zA-Z0-9]+)\.([A-Z]+)$/);
              output = google.maps[matches[1]][matches[2]];
            } catch(e) {
              output = input;
            }
          // 5. Google Map Object constant Expression. i.e. HYBRID
          } else if (input.match(/^[A-Z]+$/)) {
            try {
              var capitalizedKey = options.key.charAt(0).toUpperCase() +
                options.key.slice(1);
              if (options.key.match(/temperatureUnit|windSpeedUnit|labelColor/)) {
                capitalizedKey = capitalizedKey.replace(/s$/,"");
                output = google.maps.weather[capitalizedKey][input];
              } else {
                output = google.maps[capitalizedKey][input];
              }
            } catch(e) {
              output = input;
            }
          // 6. Date Object as ISO String
          } else if (input.match(isoDateRE)) {
            try {
              output = new Date(input);
            } catch(e) {
              output = input;
            }
          // 7. evaluate dynamically bound values
          } else if (input.match(/^{/) && options.scope) {
            try {
              var expr = input.replace(/{{/,'').replace(/}}/g,'');
              output = options.scope.$eval(expr);
            } catch (err) {
              output = input;
            }
          } else {
            output = input;
          }
        } // catch(err2)
      } // catch(err)

      // convert output more for center and position
      if (
        (options.key == 'center' || options.key == 'center') &&
        output instanceof Array
      ) {
        output = new google.maps.LatLng(output[0], output[1]);
      }

      // convert output more for shape bounds
      if (options.key == 'bounds' && output instanceof Array) {
        output = new google.maps.LatLngBounds(output[0], output[1]);
      }

      // convert output more for shape icons
      if (options.key == 'icons' && output instanceof Array) {

        for (var i=0; i<output.length; i++) {
          var el = output[i];
          if (el.icon.path.match(/^[A-Z_]+$/)) {
            el.icon.path =  google.maps.SymbolPath[el.icon.path];
          }
        }
      }

      // convert output more for marker icon
      if (options.key == 'icon' && output instanceof Object) {
        if ((""+output.path).match(/^[A-Z_]+$/)) {
          output.path = google.maps.SymbolPath[output.path];
        }
        for (var key in output) { //jshint ignore:line
          var arr = output[key];
          if (key == "anchor" || key == "origin") {
            output[key] = new google.maps.Point(arr[0], arr[1]);
          } else if (key == "size" || key == "scaledSize") {
            output[key] = new google.maps.Size(arr[0], arr[1]);
          }
        }
      }

      return output;
    };

    var getAttrsToObserve = function(attrs) {
      var attrsToObserve = [];

      if (!attrs.noWatcher) {
        for (var attrName in attrs) { //jshint ignore:line
          var attrValue = attrs[attrName];
          if (attrValue && attrValue.match(/\{\{.*\}\}/)) { // if attr value is {{..}}
            attrsToObserve.push(camelCaseFilter(attrName));
          }
        }
      }

      return attrsToObserve;
    };

    /**
     * filters attributes by skipping angularjs methods $.. $$..
     * @memberof Attr2MapOptions
     * @param {Hash} attrs tag attributes
     * @returns {Hash} filterd attributes
     */
    var filter = function(attrs) {
      var options = {};
      for(var key in attrs) {
        if (key.match(/^\$/) || key.match(/^ng[A-Z]/)) {
          void(0);
        } else {
          options[key] = attrs[key];
        }
      }
      return options;
    };

    /**
     * converts attributes hash to Google Maps API v3 options
     * ```
     *  . converts numbers to number
     *  . converts class-like string to google maps instance
     *    i.e. `LatLng(1,1)` to `new google.maps.LatLng(1,1)`
     *  . converts constant-like string to google maps constant
     *    i.e. `MapTypeId.HYBRID` to `google.maps.MapTypeId.HYBRID`
     *    i.e. `HYBRID"` to `google.maps.MapTypeId.HYBRID`
     * ```
     * @memberof Attr2MapOptions
     * @param {Hash} attrs tag attributes
     * @param {Hash} options
     * @returns {Hash} options converted attributess
     */
    var getOptions = function(attrs, params) {
      params = params || {};
      var options = {};
      for(var key in attrs) {
        if (attrs[key] || attrs[key] === 0) {
          if (key.match(/^on[A-Z]/)) { //skip events, i.e. on-click
            continue;
          } else if (key.match(/ControlOptions$/)) { // skip controlOptions
            continue;
          } else {
            // nested conversions need to be typechecked
            // (non-strings are fully converted)
            if (typeof attrs[key] !== 'string') {
              options[key] = attrs[key];
            } else {
              if (params.doNotConverStringToNumber &&
                attrs[key].match(/^[0-9]+$/)
              ) {
                options[key] = attrs[key];
              } else {
                options[key] = toOptionValue(attrs[key], {key: key, scope: params.scope});
              }
            }
          }
        } // if (attrs[key])
      } // for(var key in attrs)
      return options;
    };

    /**
     * converts attributes hash to scope-specific event function 
     * @memberof Attr2MapOptions
     * @param {scope} scope angularjs scope
     * @param {Hash} attrs tag attributes
     * @returns {Hash} events converted events
     */
    var getEvents = function(scope, attrs) {
      var events = {};
      var toLowercaseFunc = function($1){
        return "_"+$1.toLowerCase();
      };
      var EventFunc = function(attrValue) {
        // funcName(argsStr)
        var matches = attrValue.match(/([^\(]+)\(([^\)]*)\)/);
        var funcName = matches[1];
        var argsStr = matches[2].replace(/event[ ,]*/,'');  //remove string 'event'
        var argsExpr = $parse("["+argsStr+"]"); //for perf when triggering event
        return function(event) {
          var args = argsExpr(scope); //get args here to pass updated model values
          function index(obj,i) {return obj[i];}
          var f = funcName.split('.').reduce(index, scope);
          f && f.apply(this, [event].concat(args));
          $timeout( function() {
            scope.$apply();
          });
        };
      };

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
          events[eventName] = new EventFunc(attrValue);
        }
      }
      return events;
    };

    /**
     * control means map controls, i.e streetview, pan, etc, not a general control
     * @memberof Attr2MapOptions
     * @param {Hash} filtered filtered tag attributes
     * @returns {Hash} Google Map options
     */
    var getControlOptions = function(filtered) {
      var controlOptions = {};
      if (typeof filtered != 'object') {
        return false;
      }

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
                    if (str.match(/^[A-Z]+$/)) { // if constant
                      return google.maps.MapTypeId[str.toUpperCase()];
                    } else { // else, custom map-type
                      return str;
                    }
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
    };

    return {
      filter: filter,
      getOptions: getOptions,
      getEvents: getEvents,
      getControlOptions: getControlOptions,
      toOptionValue: toOptionValue,
      getAttrsToObserve: getAttrsToObserve,
      orgAttributes: orgAttributes
    }; // return

  };
  Attr2MapOptions.$inject= [
    '$parse', '$timeout', '$log', 'NavigatorGeolocation', 'GeoCoder',
    'camelCaseFilter', 'jsonizeFilter'
  ];

  angular.module('ngMap').service('Attr2MapOptions', Attr2MapOptions);
})();
