/**
 * @ngdoc factory
 * @name NgMapPool
 * @description
 *   Provide map instance to avoid memory leak
 */
(function() {
  'use strict';
  /**
   * @memberof NgMapPool
   * @desc map instance pool
   */
  var mapInstances = [];
  var $window, $document, $timeout;

  var add = function(el) {
    var mapDiv = $document.createElement("div");
    mapDiv.style.width = "100%";
    mapDiv.style.height = "100%";
    el.appendChild(mapDiv);
    var map = new $window.google.maps.Map(mapDiv, {});
    mapInstances.push(map);
    return map;
  };

  var findById = function(el, id) {
    var notInUseMap;
    for (var i=0; i<mapInstances.length; i++) {
      var map = mapInstances[i];
      if (map.id == id && !map.inUse) {
        var mapDiv = map.getDiv();
        el.appendChild(mapDiv);
        notInUseMap = map;
        break;
      }
    }
    return notInUseMap;
  };

  var findUnused = function(el) { //jshint ignore:line
    var notInUseMap;
    for (var i=0; i<mapInstances.length; i++) {
      var map = mapInstances[i];
      if (map.id) {
        continue;
      }
      if (!map.inUse) {
        var mapDiv = map.getDiv();
        el.appendChild(mapDiv);
        notInUseMap = map;
        break;
      }
    }
    return notInUseMap;
  };

  /**
   * @memberof NgMapPool
   * @function getMapInstance
   * @param {HtmlElement} el map container element
   * @return map instance for the given element
   */
  var getMapInstance = function(el) {
    var map = findById(el, el.id) || findUnused(el);
    if (!map) {
      map = add(el);
    } else {
      /* firing map idle event, which is used by map controller */
      $timeout(function() {
        google.maps.event.trigger(map, 'idle');
      }, 100);
    }
    map.inUse = true;
    return map;
  };

  /**
   * @memberof NgMapPool
   * @function returnMapInstance
   * @param {Map} an instance of google.maps.Map
   * @desc sets the flag inUse of the given map instance to false, so that it 
   * can be reused later
   */
  var returnMapInstance = function(map) {
    map.inUse = false;
  };
  
  /**
   * @memberof NgMapPool
   * @function resetMapInstances
   * @desc resets mapInstance array
   */
  var resetMapInstances = function() {
    for(var i = 0;i < mapInstances.length;i++) {
        mapInstances[i] = null;
    }
    mapInstances = [];
  };

  var NgMapPool = function(_$document_, _$window_, _$timeout_) {
    $document = _$document_[0], $window = _$window_, $timeout = _$timeout_;

    return {
	  mapInstances: mapInstances,
      resetMapInstances: resetMapInstances,
      getMapInstance: getMapInstance,
      returnMapInstance: returnMapInstance
    };
  };
  NgMapPool.$inject = [ '$document', '$window', '$timeout'];

  angular.module('ngMap').factory('NgMapPool', NgMapPool);

})();
