/**
 * @ngdoc directive
 * @name MapController
 * @requires $scope
 * @property {Hash} controls collection of Controls initiated within `map` directive
 * @property {Hash} markersi collection of Markers initiated within `map` directive
 * @property {Hash} shapes collection of shapes initiated within `map` directive
 * @property {MarkerClusterer} markerClusterer MarkerClusterer initiated within `map` directive
 */
/*jshint -W089*/
/* global google, ngMap */
ngMap.MapController = function() { 
  'use strict';

  this.map = null;
  this._objects = []; /* temporary collection of map objects */

  /**
   * Add an object to the collection of group
   * @memberof MapController
   * @name addObject
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
        obj.setMap(this.map);
      }
      if (obj.centered && obj.position) {
        this.map.setCenter(obj.position);
      }
    } else {
      obj.groupName = groupName;
      this._objects.push(obj);
    }
  }

  /**
   * Delete an object from the collection and remove from map
   * @memberof MapController
   * @name deleteObject
   * @param {Array} objs the collection of objects. i.e., map.markers
   * @param {Object} obj the object to be removed. i.e., marker
   */
  this.deleteObject = function(groupName, obj) {
    /* delete from group */
    var objs = obj.map[groupName];
    for (var name in objs) {
      objs[name] === obj && (delete objs[name]);
    }

    /* delete from map */
    obj.map && obj.setMap(null);          
  };

  /**
   * Add collected objects to map
   * @memberof MapController
   * @name addShape
   * @param {Shape} shape google map shape
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

};
