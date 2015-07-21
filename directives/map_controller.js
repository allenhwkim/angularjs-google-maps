/* global google */
(function() {
  'use strict';

  /**
   * @ngdoc controller
   * @name MapController
   * @requires $scope
   * @property {Hash} controls collection of Controls initiated within `map` directive
   * @property {Hash} markers collection of Markers initiated within `map` directive
   * @property {Hash} shapes collection of shapes initiated within `map` directive
   */
  var MapController = function($q, NavigatorGeolocation, GeoCoder, Attr2Options) { 
    var parser = Attr2Options;
    var _this = this;

    var observeAndSet = function(attrs, attrName, object) {
      attrs.$observe(attrName, function(val) {
        if (val) {
          console.log('observing ', object, attrName, val);
          var setMethod = parser.camelCase('set-'+attrName);
          var optionValue = parser.toOptionValue(val, {key: attrName});
          console.log('setting ', object, attrName, 'with value', optionValue);
          if (object[setMethod]) { //if set method does exist
            /* if an location is being observed */
            if (attrName.match(/center|position/) && 
              typeof optionValue == 'string') {
              _this.getGeoLocation(optionValue).then(function(latlng) {
                object[setMethod](latlng);
              });
            } else {
              object[setMethod](optionValue);
            }
          }
        }
      });
    };

    this.map = null;
    this._objects = []; /* temporary collection of map objects */

    /**
     * Add an object to the collection of group
     * @memberof MapController
     * @function addObject
     * @param groupName the name of collection that object belongs to
     * @param obj  an object to add into a collection, i.e. marker, shape
     */
    this.addObject = function(groupName, obj) {
      /**
       * objects, i.e. markers and shapes, are initialized before map is initialized
       * so, we collect those objects, then, we will add to map when map is initialized
       * However the case as in ng-repeat, we can directly add to map
       */
      if (this.map) {
        this.map[groupName] = this.map[groupName] || {};
        var len = Object.keys(this.map[groupName]).length;
        this.map[groupName][obj.id || len] = obj;
        if (groupName != "infoWindows" && obj.setMap) { //infoWindow.setMap works like infoWindow.open
          obj.setMap && obj.setMap(this.map);
        }
        if (obj.centered && obj.position) {
          this.map.setCenter(obj.position);
        }
      } else {
        obj.groupName = groupName;
        this._objects.push(obj);
      }
    };

    /**
     * Delete an object from the collection and remove from map
     * @memberof MapController
     * @function deleteObject
     * @param {Array} objs the collection of objects. i.e., map.markers
     * @param {Object} obj the object to be removed. i.e., marker
     */
    this.deleteObject = function(groupName, obj) {
      /* delete from group */
      if (obj.map) {
        var objs = obj.map[groupName];
        for (var name in objs) {
          objs[name] === obj && (delete objs[name]);
        }

        /* delete from map */
        obj.map && obj.setMap && obj.setMap(null);
      }
    };

    /**
     * Add collected objects to map
     * @memberof MapController
     * @function addObjects
     * @param {Array} objects the collection of objects. i.e., map.markers
     */
    this.addObjects = function(objects) {
      for (var i=0; i<objects.length; i++) {
        var obj=objects[i];
        if (obj instanceof google.maps.Marker) {
          this.addObject('markers', obj);
        } else if (obj instanceof google.maps.Circle ||
          obj instanceof google.maps.Polygon ||
          obj instanceof google.maps.Polyline ||
          obj instanceof google.maps.Rectangle ||
          obj instanceof google.maps.GroundOverlay) {
          this.addObject('shapes', obj);
        } else {
          this.addObject(obj.groupName, obj);
        }
      }
    };

    /**
     * returns the location of an address or 'current-location'
     * @memberof MapController
     * @function getGeoLocation
     * @param {String} string an address to find the location
     * @returns {Promise} latlng the location of the address
     */
    this.getGeoLocation = function(string) {
      var deferred = $q.defer();
      if (!string || string.match(/^current/i)) { // current location
        NavigatorGeolocation.getCurrentPosition().then(
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
     * watch changes of attribute values and do appropriate action based on attribute name
     * @memberof MapController
     * @function observeAttrSetObj
     * @param {Hash} orgAttrs attributes before its initialization
     * @param {Hash} attrs    attributes after its initialization
     * @param {Object} obj    map object that an action is to be done
     */
    this.observeAttrSetObj = function(orgAttrs, attrs, obj) {
      var attrsToObserve = parser.getAttrsToObserve(orgAttrs);
      if (Object.keys(attrsToObserve).length) {
        console.log(obj, "attributes to observe", attrsToObserve);
      }
      for (var i=0; i<attrsToObserve.length; i++) {
        observeAndSet(attrs, attrsToObserve[i], obj);
      }
    };

    /**
     * include all markers
     */
    this.zoomToIncludeMarkers = function() {
      var bounds = new google.maps.LatLngBounds();
      for (var marker in this.map.markers) {
        bounds.extend(this.map.markers[marker].getPosition());
      }
      this.map.fitBounds(bounds);
    };

  }; // MapController

  MapController.$inject = ['$q', 'NavigatorGeolocation', 'GeoCoder', 'Attr2Options'];
  angular.module('ngMap').controller('MapController', MapController);
})();
