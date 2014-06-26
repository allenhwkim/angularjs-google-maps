#!/bin/bash

#set -ex
set -e

export SAUCE_USERNAME=allenhwkim
export SAUCE_ACCESS_KEY=9a0b91d5-4602-44cb-afdb-cd7a2fc3fdb4

killall node
testapp/web-server.js &
sleep 1
echo Test application started
 
if [ "$(uname)" == "Darwin" ]; then
  CONNECT_URL="https://d2nkw87yt5k0to.cloudfront.net/downloads/sc-latest-osx.zip"
  CONNECT_DOWNLOAD="sc-latest-osx.tar.gz"
else
  CONNECT_URL="https://d2nkw87yt5k0to.cloudfront.net/downloads/sc-latest-linux.tar.gz"
  CONNECT_DOWNLOAD="sc-latest-linux.tar.gz"
fi
CONNECT_DIR="/tmp/sauce-connect-$RANDOM"

CONNECT_LOG="$CONNECT_DIR/sauce-connect.log"
CONNECT_STDOUT="$CONNECT_DIR/sauce-connect.stdout"
CONNECT_STDERR="$CONNECT_DIR/sauce-connect.stderr"

READY_FILE="connect-ready-$RANDOM"

# Get Connect and start it
mkdir -p $CONNECT_DIR
cd $CONNECT_DIR
curl $CONNECT_URL -o $CONNECT_DOWNLOAD 2> /dev/null 1> /dev/null
mkdir sauce-connect
tar --extract --file=$CONNECT_DOWNLOAD --strip-components=1 --directory=sauce-connect > /dev/null
rm $CONNECT_DOWNLOAD

#SAUCE_ACCESS_KEY=`echo $SAUCE_ACCESS_KEY | rev`

ARGS=""

# Set tunnel-id only on Travis, to make local testing easier.
if [ ! -z "$TRAVIS_JOB_NUMBER" ]; then
  ARGS="$ARGS --tunnel-identifier $TRAVIS_JOB_NUMBER"
fi
if [ ! -z "$READY_FILE" ]; then
  ARGS="$ARGS --readyfile $READY_FILE"
fi


echo "Starting Sauce Connect in the background, logging into:"
echo "  $CONNECT_LOG"
echo "  $CONNECT_STDOUT"
echo "  $CONNECT_STDERR"
sauce-connect/bin/sc -u $SAUCE_USERNAME -k $SAUCE_ACCESS_KEY -v $ARGS \
  --logfile $CONNECT_LOG 2> $CONNECT_STDERR 1> $CONNECT_STDOUT &

# Wait for Connect to be ready before exiting
while [ ! -f $READY_FILE ]; do
  sleep .5
done

node ./node_modules/protractor/bin/protractor spec/smokeConf.js
