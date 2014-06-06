SAUCE_ACCESS_KEY=`echo $SAUCE_ACCESS_KEY | rev`

if [ $JOB = "smoke" ]; then
  node ./node_modules/protractor/bin/protractor spec/smokeConf.js
elif [ $JOB = "suite" ]; then
  node ./node_modules/protractor/bin/protractor spec/ciConf.js
else
  echo "Unknown job type. Please set JOB=smoke or JOB=suite"
fi
