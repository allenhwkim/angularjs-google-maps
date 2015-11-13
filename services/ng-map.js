/**
 * @ngdoc provider
 * @name NgMap
 * @description
 *  common utility service for ng-map
 */
(function() {
  'use strict';
  var $window, $document, $q;
  var NavigatorGeolocation, Attr2MapOptions, GeoCoder, camelCaseFilter;

  var mapControllers = {};

  /**
   * @memberof NgMap
   * @function initMap
   * @param id optional, id of the map. default 0
   */
  var initMap = function(id) {
    var ctrl = mapControllers[id || 0];
    ctrl.initializeMap();
  };

  /**
   * @memberof NgMap
   * @function getMap
   * @param {Hash} options optional, e.g., {id: 'foo, timeout: 5000}
   * @returns promise
   */
  var getMap = function(options) {
    options = options || {};
    var deferred = $q.defer();

    var id = options.id || 0;
    var timeout = options.timeout || 2000;

    function waitForMap(timeElapsed){
      if(mapControllers[id]){
        deferred.resolve(mapControllers[id].map);
      } else if (timeElapsed > timeout) {
        deferred.reject('could not find map');
      } else {
        $window.setTimeout( function(){
          waitForMap(timeElapsed+100);
        }, 100);
      }
    }
    waitForMap(0);

    return deferred.promise;
  };

  /**
   * @memberof NgMap
   * @function addMap
   * @param mapController {__MapContoller} a map controller
   * @returns promise
   */
  var addMap = function(mapCtrl) {
    var len = Object.keys(mapControllers).length;
    mapControllers[mapCtrl.map.id || len] = mapCtrl;
  };

  /**
   * @memberof NgMap
   * @function deleteMap
   * @param mapController {__MapContoller} a map controller
   */
  var deleteMap = function(mapCtrl) {
    var len = Object.keys(mapControllers).length - 1;
    delete mapControllers[mapCtrl.map.id || len];
  };

  /**
   * @memberof NgMap
   * @function getStyle
   * @param {HTMLElemnet} el html element
   * @param {String} styleProp style property name e.g. 'display'
   * @returns value of property
   */
  var getStyle = function(el, styleProp) {
    var y;
    if (el.currentStyle) {
      y = el.currentStyle[styleProp];
    } else if ($window.getComputedStyle) {
      y = $document.defaultView.
        getComputedStyle(el, null).
        getPropertyValue(styleProp);
    }
    return y;
  };

  /**
   * @memberof NgMap
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

  /**
   * @memberof NgMap
   * @function getGeoLocation
   * @param {String} address
   * @param {Hash} options geo options
   * @returns promise
   */
  var getGeoLocation = function(string, options) {
    var deferred = $q.defer();
    if (!string || string.match(/^current/i)) { // current location
      NavigatorGeolocation.getCurrentPosition(options).then(
        function(position) {
          var lat = position.coords.latitude;
          var lng = position.coords.longitude;
          var latLng = new google.maps.LatLng(lat,lng);
          deferred.resolve(latLng);
        },
        function(error) {
          deferred.reject(error);
        }
      );
    } else {
      GeoCoder.geocode({address: string}).then(
        function(results) {
          deferred.resolve(results[0].geometry.location);
        },
        function(error) {
          deferred.reject(error);
        }
      );
    }

    return deferred.promise;
  };

  /**
   * @memberof NgMap
   * @function observeAndSet
   * @param {String} attrName attribute name
   * @param {Object} object A Google maps object to be changed
   * @returns attribue observe function
   */
  var observeAndSet = function(attrName, object) {
    return function(val) {
      if (val) {
        console.log('observing ', object, attrName, val);
        var setMethod = camelCaseFilter('set-'+attrName);
        var optionValue = Attr2MapOptions.toOptionValue(val, {key: attrName});
        console.log('setting ', object, attrName, 'with value', optionValue);
        if (object[setMethod]) { //if set method does exist
          /* if an location is being observed */
          if (attrName.match(/center|position/) &&
            typeof optionValue == 'string') {
            getGeoLocation(optionValue).then(function(latlng) {
              object[setMethod](latlng);
            });
          } else {
            object[setMethod](optionValue);
          }
        }
      }
    };
  };

  angular.module('ngMap').provider('NgMap', function() {
    var defaultOptions = {};
    var useTinfoilShielding = false;

    /**
     * @memberof NgMap
     * @function setDefaultOptions
     * @param {Hash} options
     * @example
     *  app.config(function(NgMapProvider) {
     *    NgMapProvider.setDefaultOptions({
     *      marker: {
     *        optimized: false
     *      }
     *    });
     *  });
     */
    this.setDefaultOptions = function(options) {
      defaultOptions = options;
    };

    var NgMap = function(
        _$window_, _$document_, _$q_,
        _NavigatorGeolocation_, _Attr2MapOptions_,
        _GeoCoder_, _camelCaseFilter_
      ) {
      $window = _$window_;
      $document = _$document_[0];
      $q = _$q_;
      NavigatorGeolocation = _NavigatorGeolocation_;
      Attr2MapOptions = _Attr2MapOptions_;
      GeoCoder = _GeoCoder_;
      camelCaseFilter = _camelCaseFilter_;

      return {
        defaultOptions: defaultOptions,
        addMap: addMap,
        deleteMap: deleteMap,
        getMap: getMap,
        initMap: initMap,
        getStyle: getStyle,
        getNgMapDiv: getNgMapDiv,
        getGeoLocation: getGeoLocation,
        observeAndSet: observeAndSet
      };
    };
    NgMap.$inject = [
      '$window', '$document', '$q',
      'NavigatorGeolocation', 'Attr2MapOptions',
      'GeoCoder', 'camelCaseFilter'
    ];

    this.$get = NgMap;
  });
})();
