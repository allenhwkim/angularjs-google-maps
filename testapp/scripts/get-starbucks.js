/**
 * This is to generate startbucks.json, locations of all starbucks world wide
 */
var request = require("request");

var base = "https://opendata.socrata.com/resource/92ua-293q.json";
var stores = [];

for (var i=0; i<21000; i+=1000) {
  var url = base + "?$offset=" + i;
  request({ url: url, json: true }, function (error, response, body) {
    if (!error && response.statusCode === 200) {
      stores = stores.concat(body);
    }
    if (stores.length > 20000) {
      console.log(JSON.stringify(stores));
    }
  })
}
