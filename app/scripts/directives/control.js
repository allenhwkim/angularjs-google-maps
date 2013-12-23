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
