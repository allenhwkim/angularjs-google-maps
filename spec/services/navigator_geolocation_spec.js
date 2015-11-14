/* global google, jasmine */
describe('NavigatorGeolocation', function () {
  var scope, navGeo;
  //don't do this, it will interfere others, i.e navigator.userAgent
  //navigator = jasmine.createSpy('navigator'); 
  navigator.geolocation = jasmine.createSpy('geolocation');

  beforeEach(module('ngMap'));
  beforeEach(inject(function ($rootScope, NavigatorGeolocation) {
    scope = $rootScope, navGeo = NavigatorGeolocation;
  }));

  describe('getCurrentPosition function', function () {

    beforeEach(function() {
      var GoodResponse = function (successCallback, errorCallback) { successCallback('GOOD'); };
      navigator.geolocation.getCurrentPosition = jasmine.createSpy().and.callFake(GoodResponse);
    });

    it('Should return a promise', function () {
      var promise = navGeo.getCurrentPosition();
      expect(typeof promise.then).toBe('function');
    });

    it('Should call getCurrentPosition to retrieve good results', function () {
      var jasmineSuccess = jasmine.createSpy('success');
      var jasmineError = jasmine.createSpy('error');
      navGeo.getCurrentPosition().then(jasmineSuccess, jasmineError);
      scope.$apply();
      expect(jasmineSuccess).toHaveBeenCalled();
      expect(jasmineError).not.toHaveBeenCalled();
      expect(jasmineSuccess).toHaveBeenCalledWith('GOOD');
    });

  });

  describe('getCurrentPosition function', function () {

    beforeEach(function() {
      var BadResponse = function (successCallback, errorCallback) { errorCallback('BAD'); };
      navigator.geolocation.getCurrentPosition = jasmine.createSpy().and.callFake(BadResponse);
    });

    it('Should call getCurrentPosition to retrieve bad results', function () {
      var jasmineSuccess = jasmine.createSpy('success');
      var jasmineError = jasmine.createSpy('error');
      navGeo.getCurrentPosition().then(jasmineSuccess, jasmineError);
      scope.$apply();
      expect(jasmineSuccess).not.toHaveBeenCalled();
      expect(jasmineError).toHaveBeenCalled();
      expect(jasmineSuccess).not.toHaveBeenCalled();
    });

  });
});
