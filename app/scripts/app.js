/**
 * @namespace ngMap
 */
var AngularFunc = function(obj) {
  if (typeof obj.func !== 'function' || !obj.deps instanceof Array)
    throw "Invalid obj. obj must have a `func` as function and `deps` as an array";
  obj.func.$inject = obj.deps;
  return obj.func;
};

var ngMapModule = angular.module('ngMap', []);
/**
 * @namespace ngMap.services 
 */
for (var key in ngMap.services) {
  ngMapModule.service(key, AngularFunc(ngMap.services[key]));
}

/**
 * @namespace ngMap.directives 
 */ 
for (var key in ngMap.directives) {
  ngMapModule.directive(key, AngularFunc(ngMap.directives[key]));
}
