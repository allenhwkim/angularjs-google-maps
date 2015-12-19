(function() {
  'use strict';
  var mapInstances = [];
  var $window, $document;

  var add = function(el) {
    var mapDiv = $document.createElement("div");
    mapDiv.style.width = "100%";
    mapDiv.style.height = "100%";
    el.appendChild(mapDiv);
    var map = new $window.google.maps.Map(mapDiv, {});
    mapInstances.push(map);
    return map;
  };

  var find = function(el) { //jshint ignore:line
    var notInUseMap;
    for (var i=0; i<mapInstances.length; i++) {
      var map = mapInstances[i];
      if (!map.inUse) {
        var mapDiv = map.getDiv();
        el.appendChild(mapDiv);
        notInUseMap = map;
        break;
      }
    }
    return notInUseMap;
  };

  var getMapInstance = function(el) {
    var map = find(el);
    if (!map) {
      map = add(el);
    }
    map.inUse = true;
    return map;
  };

  var returnMapInstance = function(map) {
    map.inUse = false;
  };

  var NgMapPool = function(_$document_, _$window_) {
    $document = _$document_[0], $window = _$window_;

    return {
      mapInstances: mapInstances,
      getMapInstance: getMapInstance,
      returnMapInstance: returnMapInstance
    };
  };
  NgMapPool.$inject = [ '$document', '$window' ];

  angular.module('ngMap').factory('NgMapPool', NgMapPool);

})();
