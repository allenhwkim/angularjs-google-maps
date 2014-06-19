var ngMapModule = angular.module('ngMap', []);

for (var key in ngMap.services) {
  ngMapModule.service(key, ngMap.services[key]);
}

for (var key in ngMap.directives) {
  ngMapModule.directive(key, ngMap.directives[key]);
}
