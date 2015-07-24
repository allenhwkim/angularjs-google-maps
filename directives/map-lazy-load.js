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
 *   <div map-lazy-load="http://maps.google.com/maps/api/js">
 *     <map center="Brampton" zoom="10">
 *       <marker position="Brampton"></marker>
 *     </map>
 *   </div>
 */
(function() {
  'use strict';
  var $timeout, $compile, src, savedHtml;

  var preLinkFunc = function(scope, element, attrs) {
    window.lazyLoadCallback = function() {
      console.log('script loaded,' + src);
      $timeout(function() { /* give some time to load */
        element.html(savedHtml);
        $compile(element.contents())(scope);
      }, 100);
    };

    if(window.google === undefined || window.google.maps === undefined) {
      var scriptEl = document.createElement('script');
      scriptEl.src = src + (src.indexOf('?') > -1 ? '&' : '?') + 'callback=lazyLoadCallback';
      document.body.appendChild(scriptEl);
    } else {
      element.html(savedHtml);
      $compile(element.contents())(scope);
    }
  };

  var compileFunc = function(tElement, tAttrs) {

    (!tAttrs.mapLazyLoad) && console.error('requires src with map-lazy-load');
    savedHtml = tElement.html(); 
    src = tAttrs.mapLazyLoad;

    /**
     * if already loaded, stop processing it
     */
    if (document.querySelector('script[src="'+src+'?callback=lazyLoadCallback"]')) {
      return false;
    }

    tElement.html('');  // will compile again after script is loaded
    return {
      pre: preLinkFunc
    };
  };

  var mapLazyLoad = function(_$compile_, _$timeout_) {
    $compile = _$compile_, $timeout = _$timeout_;
    return {
      compile: compileFunc
    }
  };
  mapLazyLoad.$inject = ['$compile','$timeout'];

  angular.module('ngMap').directive('mapLazyLoad', mapLazyLoad);
})();
