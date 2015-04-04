/**
 * @ngdoc directive
 * @name info-window 
 * @requires Attr2Options 
 * @requires $compile
 * @description 
 *   Defines infoWindow and provides compile method
 *   
 *   Requires:  map directive
 *
 *   Restrict To:  Element
 *
 * @param {Boolean} visible Indicates to show it when map is initialized
 * @param {Boolean} visible-on-marker Indicates to show it on a marker when map is initialized
 * @param {Expression} geo-callback if position is an address, the expression is will be performed when geo-lookup is successful. e.g., geo-callback="showDetail()"
 * @param {String} &lt;InfoWindowOption> Any InfoWindow options,
 *        https://developers.google.com/maps/documentation/javascript/reference?csw=1#InfoWindowOptions  
 * @param {String} &lt;InfoWindowEvent> Any InfoWindow events, https://developers.google.com/maps/documentation/javascript/reference
 * @example
 * Usage: 
 *   <map MAP_ATTRIBUTES>
 *    <info-window id="foo" ANY_OPTIONS ANY_EVENTS"></info-window>
 *   </map>
 *
 * Example: 
 *  <map center="41.850033,-87.6500523" zoom="3">
 *    <info-window id="1" position="41.850033,-87.6500523" >
 *      <div ng-non-bindable>
 *        Chicago, IL<br/>
 *        LatLng: {{chicago.lat()}}, {{chicago.lng()}}, <br/>
 *        World Coordinate: {{worldCoordinate.x}}, {{worldCoordinate.y}}, <br/>
 *        Pixel Coordinate: {{pixelCoordinate.x}}, {{pixelCoordinate.y}}, <br/>
 *        Tile Coordinate: {{tileCoordinate.x}}, {{tileCoordinate.y}} at Zoom Level {{map.getZoom()}}
 *      </div>
 *    </info-window>
 *  </map>
 */
/* global google */
(function() {
  'use strict';

   var infoWindow = function(Attr2Options, $compile, $timeout, $parse)  {
     var parser = Attr2Options;

     var getInfoWindow = function(options, events, element) {
       var infoWindow;

       /**
        * set options
        */
       if (options.position && !(options.position instanceof google.maps.LatLng)) {
         delete options.position;
       }
       infoWindow = new google.maps.InfoWindow(options);

       /**
        * set events
        */
       if (Object.keys(events).length > 0) {
         console.log("infoWindow events", events);
       }
       for (var eventName in events) {
         if (eventName) {
           google.maps.event.addListener(infoWindow, eventName, events[eventName]);
         }
       }

       /**
        * set template ane template-relate functions
        * it must have a container element with ng-non-bindable
        */
       var template = element.html().trim();
       if (angular.element(template).length != 1) {
         throw "info-window working as a template must have a container";
       }
       infoWindow.__template = template.replace(/\s?ng-non-bindable[='"]+/,"");

       infoWindow.__compile = function(scope) {
         var el = $compile(infoWindow.__template)(scope);
         scope.$apply();
         infoWindow.setContent(el[0]);
       };

       infoWindow.__eval = function() {
         var template = infoWindow.__template;
         var _this = this;
         template = template.replace(/{{(event|this)[^;\}]+}}/g, function(match) {
           var expression = match.replace(/[{}]/g, "").replace("this.", "_this.");
           console.log('expression', expression);
           return eval(expression);
         });
         console.log('template', template);
         return template;
       };

       infoWindow.__open = function(scope, anchor) {
         var _this = this;
         $timeout(function() {
           var tempTemplate = infoWindow.__template; // set template in a temporary variable
           infoWindow.__template = infoWindow.__eval.apply(_this);
           infoWindow.__compile(scope);
           if (anchor && anchor.getPosition) {
             infoWindow.open(infoWindow.map, anchor);
           } else {
             infoWindow.open(infoWindow.map);
           }
           infoWindow.__template = tempTemplate; // reset template to the object
         });
       };

       return infoWindow;
     };

     var linkFunc = function(scope, element, attrs, mapController) {
       element.css('display','none');
       var orgAttrs = parser.orgAttributes(element);
       var filtered = parser.filter(attrs);
       var options = parser.getOptions(filtered, scope);
       var events = parser.getEvents(scope, filtered);
       console.log('infoWindow', 'options', options, 'events', events);

       var address;
       if (options.position && !(options.position instanceof google.maps.LatLng)) {
         address = options.position;
       }
       var infoWindow = getInfoWindow(options, events, element);
       if (address) {
         mapController.getGeoLocation(address).then(function(latlng) {
           infoWindow.setPosition(latlng);
           infoWindow.__open(scope, latlng);
           var geoCallback = attrs.geoCallback;
           geoCallback && $parse(geoCallback)(scope);
         });
       }

       mapController.addObject('infoWindows', infoWindow);
       mapController.observeAttrSetObj(orgAttrs, attrs, infoWindow); /* observers */
       element.bind('$destroy', function() {
         mapController.deleteObject('infoWindows', infoWindow);
       });

       scope.$on('mapInitialized', function(evt, map) {
         infoWindow.map = map;
         infoWindow.visible && infoWindow.__open(scope);
         if (infoWindow.visibleOnMarker) {
           var markerId = infoWindow.visibleOnMarker;
           infoWindow.__open(scope, map.markers[markerId]);
         }
       });

       /**
        * provide showInfoWindow method to scope
        */
       scope.showInfoWindow  = scope.showInfoWindow ||
         function(event, id, marker) {
           var infoWindow = mapController.map.infoWindows[id];
           var anchor = marker ? marker :
             this.getPosition ? this : null;
           infoWindow.__open.apply(this, [scope, anchor]);
         };

       /**
        * provide hideInfoWindow method to scope
        */
       scope.hideInfoWindow  = scope.hideInfoWindow ||
         function(event, id) {
           var infoWindow = mapController.map.infoWindows[id];
           infoWindow.close();
         };

     }; //link

     return {
       restrict: 'E',
       require: '^map',
       link: linkFunc
     }; 

   }; // infoWindow
   infoWindow.$inject = ['Attr2Options', '$compile', '$timeout', '$parse'];

   angular.module('ngMap').directive('infoWindow', infoWindow); 
})();
