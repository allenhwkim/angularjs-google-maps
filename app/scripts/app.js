var ngMapModule = angular.module('ngMap', []);

for (var key in ngMap.services) {
  ngMapModule.service(key, ngMap.services[key]);
}

for (var key in ngMap.directives) {
  if(key != "MapController") {   // MapController is a controller for directives
    ngMapModule.directive(key, ngMap.directives[key]);
  }
}
