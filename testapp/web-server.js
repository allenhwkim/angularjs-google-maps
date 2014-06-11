#!/usr/bin/env node

var express = require('express');
var compression = require('compression');

var util = require('util');
var testApp = express();
var DEFAULT_PORT = process.env.HTTP_PORT || 8081;
var testAppDir = require('path').resolve(__dirname, './');

var main = function(argv) {
  var port = Number(argv[2]) || DEFAULT_PORT;
  testApp.use(express.static(testAppDir));
  testApp.use(compression());
  testApp.listen(port);
  util.puts(["Starting express web server in", testAppDir ,"on port", port].
      join(" "));
};

main(process.argv);
