#!/usr/bin/env node

var glob = require('glob').sync;
var spawn = require('child_process').spawn;

var scripts = [
  './node_modules/protractor/bin/protractor spec/basicConf.js'
];

var failed = false;

(function runTests(i) {
  if (i < scripts.length) {
    console.log('node ' + scripts[i]);
    var args = scripts[i].split(/\s/);

    var test = spawn(args[0], args.slice(1), {stdio: 'inherit'});
    test.on('error', function(err) {
      throw err;
    });
    test.on('exit', function(code) {
      if (code != 0) {
        failed = true;
      }
      runTests(i + 1);
    });
  } else {
    process.exit(failed ? 1 : 0);
  }
}(0));
