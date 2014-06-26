#!/usr/bin/env bash

#set -ex
set -e

killall node
testapp/web-server.js &
sleep 1
echo Test application started
 
./node_modules/protractor/bin/protractor spec/basicConf.js
