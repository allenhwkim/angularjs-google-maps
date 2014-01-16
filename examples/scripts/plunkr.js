var Plunkr = function(files, options) {
  var options = options || {};
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
  var css = '<link rel="stylesheet" type="text/css" href="{{src}}"/>\n';
  var js =  '<script type="text/javascript" src="{{src}}"></'+'script>\n';
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
    '<html ng-app="{{module}}">\n' +
    '  <head>\n' +
    head +
    '  </head>\n' +
    '  <body>\n\n' +
    files['index.html'] + '\n\n' +
    '  </body>\n' +
    '</html>\n';
  
  var form = document.createElement('form');
  form.style.display = 'none';
  form.target = '_blank';
  form.method = 'post';
  form.action = 'http://plnkr.co/edit/?p=preview';
  for(var key in postData) {
    var input = document.createElement('input');
    input.type = "hidden";
    input.name = key;
    input.value = postData[key];
    form.appendChild(input);
  }
  form.submit();
  form.remove();
}
var openPlunkr = function() {
  var files={};
  var deps = [
    "https://maps.google.com/maps/api/js?sensor=false",
    "https://ajax.googleapis.com/ajax/libs/angularjs/1.2.5/angular.js"
  ];
  if (styleTag = document.querySelector('my-css')) {
    files["style.css"] = styleTag.innerHTML;
  }
  if (scriptTag = document.querySelector("#my-js")) {
    files["script.js"] = scriptTag.innerHTML;
  }
  files["index.html"] = document.body.innerHTML;
  // remove edit link
  files["index.html"] = files["index.html"].replace(/<[^>]+>Edit<\/[^>]+>/ig,'');
  
  new Plunkr(files, {
    deps: deps, 
    title: "AngularJS Google Maps Directive"
  });
}
