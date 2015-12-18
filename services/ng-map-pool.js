(function() {
  var mapInstances = [];

  var add = function(el) {
    var ngMapDiv = getNgMapDiv(el);
    el.appendChild(ngMapDiv);
    var map = new google.maps.Map(ngMapDiv, {});
    mapInstances.push(map);
    return map;
  };
  
  var find = function(el) {
    getMapInstance.forEach(function(map) {
      if (!map.inUse) {
        var mapDiv = map.getDiv();
        el.appendChild(mapDiv);
        return map;
      }
    });
    return;
  };

  var getMapInstance = function(el) {
    var map = find(el) || add(el);
    map.inUse = true;
    return map;
  };


  /**
   * @memberof NgMapPool
   * @function getNgMapDiv
   * @param {HTMLElemnet} el html element
   * @returns map DIV elemnt
   * @desc
   * create a new `div` inside map tag, so that it does not touch map element
   * and disable drag event for the elmement
   */
  var getNgMapDiv = function(ngMapEl) {
    var el = $document.createElement("div");
    var defaultStyle = ngMapEl.getAttribute('default-style');
    el.style.width = "100%";
    el.style.height = "100%";

    //if style is not given to the map element, set display and height
    if (defaultStyle == "true") {
        ngMapEl.style.display = 'block';
        ngMapEl.style.height = '300px';
    } else {
      if (getStyle(ngMapEl, 'display') != "block") {
        ngMapEl.style.display = 'block';
      }
      if (getStyle(ngMapEl, 'height').match(/^(0|auto)/)) {
        ngMapEl.style.height = '300px';
      }
    }

    // disable drag event
    el.addEventListener('dragstart', function (event) {
      event.preventDefault();
      return false;
    });
    return el;
  };

  angular.module('ngMap').factory('NgMapPool', function() {
    var NgMapPool = function(_$document_) {
      $document = _$document_[0];

      return {
        getMapInstance: getMapInstance
      };
    };
    NgMap.$inject = [ '$document' ]; 
})();
