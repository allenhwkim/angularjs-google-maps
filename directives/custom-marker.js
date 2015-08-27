/**
 * @ngdoc directive
 * @memberof ngmap
 * @name custom-marker
 * @param Attr2Options {service} convert html attribute to Gogole map api options
 * @param $compile {service} AngularJS $compile service
 * @param $timeout {service} AngularJS $timeout
 * @description 
 *   Marker with html
 *   Requires:  map directive
 *   Restrict To:  Element
 *
 * @attr {String} position required, position on map
 * @attr {Number} z-index optional
 * @attr {Boolean} visible optional
 * @example
 *
 * Example: 
 *   <map center="41.850033,-87.6500523" zoom="3">
 *     <custom-marker position="41.850033,-87.6500523">
 *       <div>
 *         <b>Home</b>
 *       </div>
 *     </custom-marker>
 *   </map>
 *
 */
(function() {
  'use strict';
  var parser, $compile, $timeout;

  var cAbortEvent = function (e) {
    e.preventDefault && e.preventDefault();
    e.cancelBubble = true;
    e.stopPropagation && e.stopPropagation();
  }; 

  var CustomMarker = function(options) {
    options = options || {};

    this.el = document.createElement('div');
    this.el.style.display = 'inline-block';
    this.visible = true; for (var key in options) {
     this[key] = options[key];
    }
  };

  var setCustomMarker = function() {

    CustomMarker.prototype = new google.maps.OverlayView();

    CustomMarker.prototype.setContent = function(html, scope) {
      this.html = html;
      if (scope) {
        var compiledEl = $compile(html)(scope);
        var customMarkerEl = compiledEl[0];
        var me = this;
        $timeout(function() {
          me.content = customMarkerEl.innerHTML;
          me.el.innerHTML = me.content;
        });
      } else {
        this.content = html;
        this.el.innerHTML = this.content;
      }
      this.el.style.position = 'relative';
      this.el.className = 'custom-marker';
    };

    CustomMarker.prototype.setPosition = function(position) {
      position && (this.position = position);
      if (this.getProjection() && typeof this.position.lng == 'function') {
        var posPixel = this.getProjection().fromLatLngToDivPixel(this.position);
        var x = Math.round(posPixel.x - (this.el.offsetWidth/2));
        var y = Math.round(posPixel.y - this.el.offsetHeight - 10); // 10px for anchor
        this.el.style.left = x + "px";
        this.el.style.top = y + "px";
      }
    };

    CustomMarker.prototype.setZIndex = function(zIndex) {
      zIndex && (this.zIndex = zIndex);
      this.el.style.zIndex = this.zIndex;
    };

    CustomMarker.prototype.setVisible = function(visible) {
      this.el.style.display = visible ? 'inline-block' : 'none';
      this.visible = visible;
    };

    CustomMarker.prototype.addClass = function(className) {
      var classNames = this.el.className.split(' ');
      (classNames.indexOf(className) == -1) && classNames.push(className);
      this.el.className = classNames.join(' ');
    };
    
    CustomMarker.prototype.removeClass = function(className) {
      var classNames = this.el.className.split(' ');
      var index = classNames.indexOf(className);
      (index > -1) && classNames.splice(index, 1);
      this.el.className = classNames.join(' ');
    };

    CustomMarker.prototype.onAdd = function() {
      this.getPanes().overlayMouseTarget.appendChild(this.el);
    };
    
    CustomMarker.prototype.draw = function() {
      this.setPosition();
      this.setZIndex(this.zIndex);
      this.setVisible(this.visible);
    };
    
    CustomMarker.prototype.onRemove = function() {
      this.el.parentNode.removeChild(this.el);
      this.el = null;
    };
  };

  var customMarkerDirective = function(Attr2Options, _$compile_, _$timeout_)  {
    parser = Attr2Options;
    $compile = _$compile_;
    $timeout = _$timeout_;
    setCustomMarker();

    return {
      restrict: 'E',
      require: '^map',
      link: function(scope, element, attrs, mapController) {

        var orgAttrs = parser.orgAttributes(element);
        var filtered = parser.filter(attrs);
        var options = parser.getOptions(filtered, scope);
        var events = parser.getEvents(scope, filtered);

        /**
         * build a custom marker element
         */
        var removedEl = element[0].parentElement.removeChild(element[0]);
        console.log("custom-marker options", options);
        var customMarker = new CustomMarker(options);
        customMarker.setContent(removedEl.innerHTML, scope);
        console.log('customMarker', customMarker);

        console.log("custom-marker events", "events");
        for (var eventName in events) {
          google.maps.event.addDomListener(
            customMarker.el, eventName, events[eventName]);
        }
        mapController.addObject('customMarkers', customMarker);

        if (!(options.position instanceof google.maps.LatLng)) {
          mapController.getGeoLocation(options.position).then(
            function(latlng) {
              customMarker.setPosition(latlng);
            }
          );
        }

        element.bind('$destroy', function() {
          //Is it required to remove event listeners when DOM is removed?
          mapController.deleteObject('customMarkers', marker);
        });

      } //link
    }; // return
  };// function
  customMarkerDirective.$inject = ['Attr2Options', '$compile', '$timeout'];

  angular.module('ngMap').directive('customMarker', customMarkerDirective);
})();
