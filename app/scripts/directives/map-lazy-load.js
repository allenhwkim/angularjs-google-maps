/**
 * @ngdoc directive
 * @name lazy-load
 * @requires Attr2Options 
 * @description 
 *   Requires: Delay the initialization of directive until required .js loads
 *   Restrict To: Attribute 
 *
 * @param {String} lazy-load
      script source file location
 *    example:  
 *      'http://maps.googlecom/maps/api/js'   

 * @example
 * Example: 
 *
 *   <div lazy-load="http://maps.google.com/maps/api/js">
 *     <map center="Brampton" zoom="10">
 *       <marker position="Brampton"></marker>
 *     </map>
 *   </div>
 */
/*jshint -W089*/
ngMap.directive('mapLazyLoad', ['$compile', '$timeout', function($compile, $timeout) {
  'use strict';
  var directiveDefinitionObject = {
    compile: function(tElement, tAttrs) {
      (!tAttrs.mapLazyLoad) && console.error('requires src with map-lazy-load');
      var savedHtml = tElement.html(), src = tAttrs.mapLazyLoad;
      /**
       * if already loaded, stop processing it
       */
      if (document.querySelector('script[src="'+src+'"]')) {
        return false;
      }

      tElement.html('');  // will compile again after script is loaded
      return {
        pre: function(scope, element, attrs) {
          window.lazyLoadCallback = function() {
            console.log('script loaded,' + src);
            $timeout(function() { /* give some time to load */
              element.html(savedHtml);
              $compile(element.contents())(scope);
            }, 100);
          };

          var scriptEl = document.createElement('script');
          scriptEl.src = src + '?callback=lazyLoadCallback';
          document.body.appendChild(scriptEl);
        }
      };
    }
  };
  return directiveDefinitionObject;
}]);
