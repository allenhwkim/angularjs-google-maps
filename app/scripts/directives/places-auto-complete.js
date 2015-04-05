/**
 * @ngdoc directive
 * @name places-auto-complete
 * @requires Attr2Options 
 * @description 
 *   Provides address auto complete feature to an input element
 *   
 *   Requires: input tag
 *
 *   Restrict To: Attribute
 *
 * @param {AutoCompleteOptions} Any AutocompleteOptions
 *    https://developers.google.com/maps/documentation/javascript/3.exp/reference#AutocompleteOptions
 * @param on-place_changed Callback function when a place is selected
 *
 * @example
 * Example: 
 *   <script src="https://maps.googleapis.com/maps/api/js?libraries=places"></script>
 *   <input places-auto-complete types="['geocode']" />
 */
/* global google */
(function() {
  'use strict';

  var placesAutoComplete = function(Attr2Options, $parse) {
    var parser = Attr2Options;
    var autocomplete;

    var linkFunc = function(scope, element, attrs) {
      var filtered = parser.filter(attrs);
      var options = parser.getOptions(filtered);
     
      autocomplete = new google.maps.places.Autocomplete(element[0]);
      google.maps.event.addListener(autocomplete, 'place_changed', function() {
        var place = autocomplete.getPlace();
        var onPlaceChanged = $parse(attrs.onPlaceChanged);
        onPlaceChanged(scope, {place: place});
      });
    };

    return {
      restrict: 'A',
      link: linkFunc
    };
  };

  placesAutoComplete.$inject = ['Attr2Options', '$parse'];
  angular.module('ngMap').directive('placesAutoComplete', placesAutoComplete); 

})();
