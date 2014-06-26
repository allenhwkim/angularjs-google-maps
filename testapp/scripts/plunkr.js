var plunkr = angular.module("plunkr", []);

plunkr.service('submitForm', function() {
  return function(url, method, postData) {
    var form = document.createElement('form');
    form.style.display = 'none';
    form.target = '_blank';
    form.method = method || 'get';
    form.action = url;
    for(var key in postData) {
      var input = document.createElement('input');
      input.type = "hidden";
      input.name = key;
      input.value = postData[key];
      form.appendChild(input);
    }
    form.submit();
    form.remove();
  }; // return
}); // service
        
plunkr.directive('plunkr', function(submitForm) {
  return {
    link: function(scope, el, attrs) {
      
      var _this = this;
      _this.moduleName = attrs.moduleName;

      scope.$parent.postToPlunkr = function() {

        var files = {
          "index.html" : (_this.html||'').replace(/&lt;/g,'<').replace(/&gt;/g,'>'),
          "script.js" : (_this.js||''),
          "style.css" : (_this.css||'')
        };

        var options = {
          deps : [
              "http://maps.google.com/maps/api/js?sensor=false",
              "http://code.angularjs.org/1.2.5/angular.js",
              "http://rawgithub.com/allenhwkim/angularjs-google-maps/master/build/scripts/ng-map.min.js"
            ],
          title: "AngularJS Google Maps Directive",
          module: (_this.moduleName||'ngMap')
        }

        var postData = {};
        postData['tags[]'] = 'auglarjs';
        postData['private'] = true;
        postData.description = options.title || 'My Example';
        for(var fileName in files) {
          if (fileName != 'index.html') {
            postData['files[' + fileName + ']'] = files[fileName];
          }
        }

        var head = "";
        var css = '<link rel="stylesheet" href="{{src}}"/>\n';
        var js =  '<script src="{{src}}"></'+'script>\n';
        var fileNames = Object.keys(files);
        if ((ndx = fileNames.indexOf("index.html")) > -1) {
          fileNames.splice(ndx, 1);
        }
        options.deps = options.deps.concat(fileNames);
        if (options.deps) {
          for (var i=0; i<options.deps.length; i++) {
            var src = options.deps[i];
            var template = src.match(/\.css$/) ? css : js;
            head += template.replace("{{src}}", src);
          }
        }

        postData['files[index.html]'] = 
          '<!doctype html>\n' +
          '<html ng-app="'+options.module+'">\n' +
          '  <head>\n' +
          head +
          '  </head>\n' +
          '  <body>\n\n' +
          files['index.html'] + '\n\n' +
          '  </body>\n' +
          '</html>\n';

        submitForm('http://plnkr.co/edit/?p=preview', 'post', postData);
      }; // function

      this.html = (el = document.querySelector('#my-html')) 
        && el.innerHTML.replace(/<div(.*)<\/div>/,'').replace(/</g,'&lt;');
      this.css = (el = document.querySelector('#my-css')) && el.innerHTML;
      this.js = (el = document.querySelector('#my-js'))
              &&  el.innerHTML.replace(/,[\ "']+plunkr['"]/,'');

      document.querySelector("#html").innerHTML = this.html;
      document.querySelector("#css").innerHTML = this.css;
      document.querySelector("#js").innerHTML = this.js;
    } // link
  } // return
}); // directive
