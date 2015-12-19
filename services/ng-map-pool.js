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

  /**
   * @memberof NgMapPool
   * @function getMapInstance
   * @param {HtmlElement} el map container element
   * @return map instance for the given element
   */
  var getMapInstance = function(el) {
    var map = find(el);
    if (!map) {
      map = add(el);
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
