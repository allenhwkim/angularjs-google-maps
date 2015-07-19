/**
 * @ngdoc directive
 * @name places-auto-complete
 * @requires Attr2Options 
 * @description 
 *   Provides address auto complete feature to an input element
 *   Requires: input tag
 *   Restrict To: Attribute
 *
 * @param {AutoCompleteOptions} Any AutocompleteOptions
 *    https://developers.google.com/maps/documentation/javascript/3.exp/reference#AutocompleteOptions
 *
 * @example
 * Example: 
 *   <script src="https://maps.googleapis.com/maps/api/js?libraries=places"></script>
 *   <input places-auto-complete types="['geocode']" />
 */
/* global google */
(function() {
  'use strict';

  var placesAutoComplete = function(Attr2Options, $timeout) {
    var parser = Attr2Options;

    var linkFunc = function(scope, element, attrs, ngModelCtrl) {
      var filtered = parser.filter(attrs);
      var options = parser.getOptions(filtered);
      var events = parser.getEvents(scope, filtered);
      console.log('autocomplete options', options, 'events', events);
      var autocomplete = new google.maps.places.Autocomplete(element[0], options);
      for (var eventName in events) {
        google.maps.event.addListener(autocomplete, eventName, events[eventName]);
      }
      element[0].addEventListener('change', function() {
        $timeout(function(){
          ngModelCtrl && ngModelCtrl.$setViewValue(element.val());
        },100);
      });

      attrs.$observe('types', function(val) {
        if (val) {
          console.log('observing types', val);
          var optionValue = parser.toOptionValue(val, {key: 'types'});
          console.log('setting types with value', optionValue);
          autocomplete.setTypes(optionValue);
        }
      });
    };

    return {
      restrict: 'A',
      require: '?ngModel',
      link: linkFunc
    };
  };

  placesAutoComplete.$inject = ['Attr2Options', '$timeout'];
  angular.module('ngMap').directive('placesAutoComplete', placesAutoComplete); 

})();
