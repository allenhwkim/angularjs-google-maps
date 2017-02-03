/**
 * @ngdoc controller
 * @name MapController
 */
(function() {
  'use strict';
  var Attr2MapOptions;

  var __MapController = function(
      $scope, $element, $attrs, $parse, $interpolate, _Attr2MapOptions_, NgMap, NgMapPool, escapeRegExp
    ) {
    Attr2MapOptions = _Attr2MapOptions_;
    var vm = this;
    var exprStartSymbol = $interpolate.startSymbol();
    var exprEndSymbol = $interpolate.endSymbol();

    vm.mapOptions; /** @memberof __MapController */
    vm.mapEvents;  /** @memberof __MapController */
    vm.eventListeners;  /** @memberof __MapController */

    /**
     * Add an object to the collection of group
     * @memberof __MapController
     * @function addObject
     * @param groupName the name of collection that object belongs to
     * @param obj  an object to add into a collection, i.e. marker, shape
     */
    vm.addObject = function(groupName, obj) {
      if (vm.map) {
        vm.map[groupName] = vm.map[groupName] || {};
        var len = Object.keys(vm.map[groupName]).length;
        vm.map[groupName][obj.id || len] = obj;

        if (vm.map instanceof google.maps.Map) {
          //infoWindow.setMap works like infoWindow.open
          if (groupName != "infoWindows" && obj.setMap) {
            obj.setMap && obj.setMap(vm.map);
          }
          if (obj.centered && obj.position) {
            vm.map.setCenter(obj.position);
          }
          (groupName == 'markers') && vm.objectChanged('markers');
          (groupName == 'customMarkers') && vm.objectChanged('customMarkers');
        }
      }
    };

    /**
     * Delete an object from the collection and remove from map
     * @memberof __MapController
     * @function deleteObject
     * @param {Array} objs the collection of objects. i.e., map.markers
     * @param {Object} obj the object to be removed. i.e., marker
     */
    vm.deleteObject = function(groupName, obj) {
      /* delete from group */
      if (obj.map) {
        var objs = obj.map[groupName];
        for (var name in objs) {
          if (objs[name] === obj) {
            console.log('Deleting', groupName, obj);
            google.maps.event.clearInstanceListeners(obj);
            delete objs[name];
          }
        }

        /* delete from map */
        obj.map && obj.setMap && obj.setMap(null);

        (groupName == 'markers') && vm.objectChanged('markers');
        (groupName == 'customMarkers') && vm.objectChanged('customMarkers');
      }
    };

    /**
     * @memberof __MapController
     * @function observeAttrSetObj
     * @param {Hash} orgAttrs attributes before its initialization
     * @param {Hash} attrs    attributes after its initialization
     * @param {Object} obj    map object that an action is to be done
     * @description watch changes of attribute values and
     * do appropriate action based on attribute name
     */
    vm.observeAttrSetObj = function(orgAttrs, attrs, obj) {
      if (attrs.noWatcher) {
        return false;
      }
      var attrsToObserve = Attr2MapOptions.getAttrsToObserve(orgAttrs);
      for (var i=0; i<attrsToObserve.length; i++) {
        var attrName = attrsToObserve[i];
        attrs.$observe(attrName, NgMap.observeAndSet(attrName, obj));
      }
    };

    /**
     * @memberof __MapController
     * @function zoomToIncludeMarkers
     */
    vm.zoomToIncludeMarkers = function() {
      // Only fit to bounds if we have any markers
      // object.keys is supported in all major browsers (IE9+)
      if ((vm.map.markers != null && Object.keys(vm.map.markers).length > 0) || (vm.map.customMarkers != null && Object.keys(vm.map.customMarkers).length > 0)) {
        var bounds = new google.maps.LatLngBounds();
        for (var k1 in vm.map.markers) {
          bounds.extend(vm.map.markers[k1].getPosition());
        }
        for (var k2 in vm.map.customMarkers) {
          bounds.extend(vm.map.customMarkers[k2].getPosition());
        }
    	  if (vm.mapOptions.maximumZoom) {
    		  vm.enableMaximumZoomCheck = true; //enable zoom check after resizing for markers
    	  }
        vm.map.fitBounds(bounds);
      }
    };

    /**
     * @memberof __MapController
     * @function objectChanged
     * @param {String} group name of group e.g., markers
     */
    vm.objectChanged = function(group) {
      if ( vm.map &&
        (group == 'markers' || group == 'customMarkers') &&
        vm.map.zoomToIncludeMarkers == 'auto'
      ) {
        vm.zoomToIncludeMarkers();
      }
    };

    /**
     * @memberof __MapController
     * @function initializeMap
     * @description
     *  . initialize Google map on <div> tag
     *  . set map options, events, and observers
     *  . reset zoom to include all (custom)markers
     */
    vm.initializeMap = function() {
      var mapOptions = vm.mapOptions,
          mapEvents = vm.mapEvents;

      var lazyInitMap = vm.map; //prepared for lazy init
      vm.map = NgMapPool.getMapInstance($element[0]);
      NgMap.setStyle($element[0]);

      // set objects for lazyInit
      if (lazyInitMap) {

        /**
         * rebuild mapOptions for lazyInit
         * because attributes values might have been changed
         */
        var filtered = Attr2MapOptions.filter($attrs);
        var options = Attr2MapOptions.getOptions(filtered);
        var controlOptions = Attr2MapOptions.getControlOptions(filtered);
        mapOptions = angular.extend(options, controlOptions);
        console.log('map options', mapOptions);

        for (var group in lazyInitMap) {
          var groupMembers = lazyInitMap[group]; //e.g. markers
          if (typeof groupMembers == 'object') {
            for (var id in groupMembers) {
              vm.addObject(group, groupMembers[id]);
            }
          }
        }
        vm.map.showInfoWindow = vm.showInfoWindow;
        vm.map.hideInfoWindow = vm.hideInfoWindow;
      }

      // set options
      mapOptions.zoom = mapOptions.zoom || 15;
      var center = mapOptions.center;
      var exprRegExp = new RegExp(escapeRegExp(exprStartSymbol) + '.*' + escapeRegExp(exprEndSymbol));

      if (!mapOptions.center ||
        ((typeof center === 'string') && center.match(exprRegExp))
      ) {
        mapOptions.center = new google.maps.LatLng(0, 0);
      } else if( (typeof center === 'string') && center.match(/^[0-9.-]*,[0-9.-]*$/) ){
        var lat = parseFloat(center.split(',')[0]);
        var lng = parseFloat(center.split(',')[1]);
        mapOptions.center = new google.maps.LatLng(lat, lng);
      } else if (!(center instanceof google.maps.LatLng)) {
        var geoCenter = mapOptions.center;
        delete mapOptions.center;
        NgMap.getGeoLocation(geoCenter, mapOptions.geoLocationOptions).
          then(function (latlng) {
            vm.map.setCenter(latlng);
            var geoCallback = mapOptions.geoCallback;
            geoCallback && $parse(geoCallback)($scope);
          }, function () {
            if (mapOptions.geoFallbackCenter) {
              vm.map.setCenter(mapOptions.geoFallbackCenter);
            }
          });
      }
      vm.map.setOptions(mapOptions);

      // set events
      for (var eventName in mapEvents) {
        var event = mapEvents[eventName];
        var listener = google.maps.event.addListener(vm.map, eventName, event);
        vm.eventListeners[eventName] = listener;
      }

      // set observers
      vm.observeAttrSetObj(orgAttrs, $attrs, vm.map);
      vm.singleInfoWindow = mapOptions.singleInfoWindow;

      google.maps.event.trigger(vm.map, 'resize');

      google.maps.event.addListenerOnce(vm.map, "idle", function () {
        NgMap.addMap(vm);
        if (mapOptions.zoomToIncludeMarkers) {
          vm.zoomToIncludeMarkers();
        }
        //TODO: it's for backward compatibiliy. will be removed
        $scope.map = vm.map;
        $scope.$emit('mapInitialized', vm.map);

        //callback
        if ($attrs.mapInitialized) {
          $parse($attrs.mapInitialized)($scope, {map: vm.map});
        }
      });

	  //add maximum zoom listeners if zoom-to-include-markers and and maximum-zoom are valid attributes
	  if (mapOptions.zoomToIncludeMarkers && mapOptions.maximumZoom) {
	    google.maps.event.addListener(vm.map, 'zoom_changed', function() {
          if (vm.enableMaximumZoomCheck == true) {
			vm.enableMaximumZoomCheck = false;
	        google.maps.event.addListenerOnce(vm.map, 'bounds_changed', function() {
		      vm.map.setZoom(Math.min(mapOptions.maximumZoom, vm.map.getZoom()));
		    });
	  	  }
	    });
	  }
    };

    $scope.google = google; //used by $scope.eval to avoid eval()

    /**
     * get map options and events
     */
    var orgAttrs = Attr2MapOptions.orgAttributes($element);
    var filtered = Attr2MapOptions.filter($attrs);
    var options = Attr2MapOptions.getOptions(filtered, {scope: $scope});
    var controlOptions = Attr2MapOptions.getControlOptions(filtered);
    var mapOptions = angular.extend(options, controlOptions);
    var mapEvents = Attr2MapOptions.getEvents($scope, filtered);
    console.log('ng-map Options', mapOptions);
    Object.keys(mapEvents).length && console.log('ng-map Events', mapEvents);

    vm.mapOptions = mapOptions;
    vm.mapEvents = mapEvents;
    vm.eventListeners = {};

    if (options.lazyInit) { // allows controlled initialization
      // parse angular expression for dynamic ids
      if (!!$attrs.id &&
      	  // starts with, at position 0
	  $attrs.id.indexOf(exprStartSymbol, 0) === 0 &&
	  // ends with
	  $attrs.id.indexOf(exprEndSymbol, $attrs.id.length - exprEndSymbol.length) !== -1) {
        var idExpression = $attrs.id.slice(2,-2);
        var mapId = $parse(idExpression)($scope);
      } else {
        var mapId = $attrs.id;
      }
      vm.map = {id: mapId}; //set empty, not real, map
      NgMap.addMap(vm);
    } else {
      vm.initializeMap();
    }

    //Trigger Resize
    if(options.triggerResize) {
      google.maps.event.trigger(vm.map, 'resize');
    }

    $element.bind('$destroy', function() {
      NgMapPool.returnMapInstance(vm.map);
      NgMap.deleteMap(vm);
    });
  }; // __MapController

  __MapController.$inject = [
    '$scope', '$element', '$attrs', '$parse', '$interpolate', 'Attr2MapOptions', 'NgMap', 'NgMapPool', 'escapeRegexpFilter'
  ];
  angular.module('ngMap').controller('__MapController', __MapController);
})();
