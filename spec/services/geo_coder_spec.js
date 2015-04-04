/* global jasmine */
describe('GeoCoder', function () {
  'use strict';
  var scope, geoCoder;

  beforeEach(module('ngMap'));
  beforeEach(inject(function ($rootScope, GeoCoder) {
    scope = $rootScope, geoCoder = GeoCoder;
    google.maps.Geocoder = jasmine.createSpy();
  }));
  
  describe('geocode function', function () {
    
    it('Should return a promise', function () {
      var GoodResponse = function (params, callback) { callback('GOOD', 'OK'); };
      google.maps.Geocoder.prototype.geocode = jasmine.createSpy().andCallFake(GoodResponse);
      var promise = geoCoder.geocode('Canada');
      expect(typeof promise.then).toBe('function');
    });
    
    it('Should call geocoder.geocode to retrieve good results', function () {
      var GoodResponse = function (params, callback) { callback('GOOD', 'OK'); };
      google.maps.Geocoder.prototype.geocode = jasmine.createSpy().andCallFake(GoodResponse);
      var okMock = jasmine.createSpy();
      geoCoder.geocode('Canada').then(okMock);
      scope.$apply();
      expect(okMock).toHaveBeenCalledWith('GOOD');
    }); 
          
    it('Should call geocoder.geocode to retrieve  bad results', function () {
      var BadResponse = function (params, callback) { callback('BAD', 'ERROR'); };
      google.maps.Geocoder.prototype.geocode = jasmine.createSpy().andCallFake(BadResponse);
      var okMock = jasmine.createSpy();
      var errorMock = jasmine.createSpy();
      geoCoder.geocode('Canada').then(okMock, errorMock);
      scope.$apply();
      expect(okMock).not.toHaveBeenCalled();
      expect(errorMock).toHaveBeenCalledWith('Geocoder failed due to: ERROR');
    });
          
  });
  
});
