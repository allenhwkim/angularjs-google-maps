var plunkr = angular.module("plunkr", []);

plunkr.service('Plnkr', function() {
  var urlToHtmlTag = function(url) {
    var linkTag   = '<link rel="stylesheet" href="' + url + '"/>';
    var scriptTag = '<script src="' + url +'"></'+'script>';
    return url.match(/\.css$/) ? linkTag : scriptTag;
  };
  
  this.html = null;
  this.js = null;
  this.css = null;
  this.libs = [
    "http://maps.google.com/maps/api/js?sensor=false",
    "http://code.angularjs.org/1.2.5/angular.js",
    "http://rawgithub.com/allenhwkim/angularjs-google-maps" +
       "/master/build/scripts/ng-map.min.js",
    "script.js",
    "style.css"
  ];

  this.submitToPlnkr = function() {
    var postData = this.getPostData();
    var form = document.createElement('form');
    form.style.display = 'none';
    form.target = '_blank';
    form.method = 'post';
    form.action = 'http://plnkr.co/edit/?p=preview';
    for(var key in postData) {
      if (key) {
        var input = document.createElement('input');
        input.type = "hidden";
        input.name = key;
        input.value = postData[key];
        form.appendChild(input);
      }
    }
    form.submit();
    form.remove();
  };

  this.getPostData = function() {
    var contents = this.html;
    var js  = this.js||'';
    var css = this.css;
    var appName = this.moduleName || "ngMap";
    js = js.replace(/,[ '"]*plunkr['"]?/,'');

    var headTags = [];
    for (var i=0; i<this.libs.length; i++) {
      var url = this.libs[i];
      headTags.push(urlToHtmlTag(url));
    }

    var postData = {};
    postData.description = "AngularJS Google Maps Directive";
    postData.private = true;
    postData['tags[]'] = 'auglarjs';
    postData['files[script.js]'] = js;
    postData['files[style.css]'] = css;
    postData['files[index.html]'] = 
      '<!doctype html>\n' +
      '<html ng-app="' + appName + '">\n' +
      '  <head>\n' +
           headTags.join('\n') + '\n' +
      '  </head>\n' +
      '  <body>\n' +
           contents + '\n' +
      '  </body>\n' +
      '</html>\n';

    return postData;
  };

  return this;

}); // service

plunkr.directive('plnkrCode', function(Plnkr) {
  return {
    compile: function(el, attrs) {
      var key = attrs.plnkrCode;
      var code = el.html();
      Plnkr[key] = code;
    }
  };
});

plunkr.directive('plnkrLib', function(Plnkr) {
  return {
    compile: function(el, attrs) {
      var url = attrs.src || attrs.href;
      Plnkr.libs.push(url);
    }
  };
});

plunkr.directive('plnkrShow', function(Plnkr) {
  return {
    templateUrl: 'source_code.html',
    link: function(scope, el, attrs) {
      // so that we can access Plnkr js, css, html and method
      scope.Plnkr = Plnkr;
      Plnkr.moduleName = attrs.moduleName;
    } 
  };
}); 
