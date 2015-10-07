/**
 * @ngdoc directive
 * @memberof ngmap
 * @name custom-marker
 * @param Attr2Options {service} convert html attribute to Gogole map api options
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
  var parser, $timeout, $compile;

  var CustomMarker = function(options) {
    options = options || {};

    this.el = document.createElement('div');
    this.el.style.display = 'inline-block';
    this.visible = true;
    for (var key in options) { /* jshint ignore:line */
     this[key] = options[key];
    }
  };

  var setCustomMarker = function() {

    CustomMarker.prototype = new google.maps.OverlayView();

    CustomMarker.prototype.setContent = function(html, scope) {
      this.el.innerHTML = html;
      this.el.style.position = 'absolute';
      if (scope) {
        $compile(angular.element(this.el).contents())(scope);
      }
    };

    CustomMarker.prototype.setPosition = function(position) {
      position && (this.position = position); /* jshint ignore:line */
      if (this.getProjection() && typeof this.position.lng == 'function') {
        var posPixel = this.getProjection().fromLatLngToDivPixel(this.position);
        var x = Math.round(posPixel.x - (this.el.offsetWidth/2));
        var y = Math.round(posPixel.y - this.el.offsetHeight - 10); // 10px for anchor
        this.el.style.left = x + "px";
        this.el.style.top = y + "px";
      }
    };

    CustomMarker.prototype.setZIndex = function(zIndex) {
      zIndex && (this.zIndex = zIndex); /* jshint ignore:line */
      this.el.style.zIndex = this.zIndex;
    };

    CustomMarker.prototype.setVisible = function(visible) {
      this.el.style.display = visible ? 'inline-block' : 'none';
      this.visible = visible;
    };

    CustomMarker.prototype.addClass = function(className) {
      var classNames = this.el.className.trim().split(' ');
      (classNames.indexOf(className) == -1) && classNames.push(className); /* jshint ignore:line */
      this.el.className = classNames.join(' ');
    };

    CustomMarker.prototype.removeClass = function(className) {
      var classNames = this.el.className.split(' ');
      var index = classNames.indexOf(className);
      (index > -1) && classNames.splice(index, 1); /* jshint ignore:line */
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

  var linkFunc = function(orgHtml, varsToWatch) {
    //console.log('orgHtml', orgHtml, 'varsToWatch', varsToWatch);

    return function(scope, element, attrs, mapController) {

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

      $timeout(function() { //apply contents, class, and location after it is compiled
        scope.$watch('[' + varsToWatch.join(',') + ']', function(val) {
          customMarker.setContent(orgHtml, scope);
        });

        customMarker.setContent(removedEl.innerHTML, scope);
        var classNames = removedEl.firstElementChild.className;
        customMarker.addClass('custom-marker');
        customMarker.addClass(classNames);
        console.log('customMarker', customMarker);

        if (!(options.position instanceof google.maps.LatLng)) {
          mapController.getGeoLocation(options.position).then(
            function(latlng) {
              customMarker.setPosition(latlng);
            }
          );
        }
      });

      console.log("custom-marker events", "events");
      for (var eventName in events) { /* jshint ignore:line */
        google.maps.event.addDomListener(
          customMarker.el, eventName, events[eventName]);
      }
      mapController.addObject('customMarkers', customMarker);

      element.bind('$destroy', function() {
        //Is it required to remove event listeners when DOM is removed?
        mapController.deleteObject('customMarkers', customMarker);
      });

    }; // linkFunc
  };

  var customMarkerDirective = function(Attr2Options, _$timeout_, _$compile_)  {
    parser = Attr2Options;
    $timeout = _$timeout_;
    $compile = _$compile_;
    setCustomMarker();

    return {
      restrict: 'E',
      require: '^map',
      compile: function(element) {
        var orgHtml = element.html();
        var matches = orgHtml.match(/{{([^}]+)}}/g);
        var varsToWatch = [];
        (matches || []).forEach(function(match) { //filter out that contains '::', 'this.'
          var toWatch = match.replace('{{','').replace('}}','');
          if (match.indexOf('::') == -1 && match.indexOf('this.') == -1 && varsToWatch.indexOf(toWatch) == -1) {
            varsToWatch.push(match.replace('{{','').replace('}}',''));
          }
        });

        return linkFunc(orgHtml, varsToWatch);
      }
    }; // return
  };// function
  customMarkerDirective.$inject = ['Attr2Options', '$timeout', '$compile'];

  angular.module('ngMap').directive('customMarker', customMarkerDirective);
})();
