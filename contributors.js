var https = require('https');
var fs = require('fs');
var options = {
  hostname: 'api.github.com',
  port: 443,
  path: '/repos/allenhwkim/angularjs-google-maps/contributors',
  method: 'GET',
  agent: false,
  headers: {'user-agent': 'node.js'}
};

var req = https.request(options, function(res){
  //console.log("statusCode: ", res.statusCode);
  //console.log("headers: ", res.headers);

  var body = '';
  res.setEncoding('utf8');
  res.on('data', function(d) {
    body += d;
  });
  res.on('end', function() {
    var contributors = JSON.parse(body);
    var markdown = "#Angularjs-Google-Maps Is Only Possible By;\n";
    contributors.forEach(function(user) {
      markdown += "\n<a href='"+user.html_url+"' title='"+user.login+"'><img src='"+user.avatar_url+"' width='60px' /></a>";
      console.log(user.login, user.avatar_url, user.html_url, user.contributions);
    });
    markdown += "\n## We Love You All\n";
    fs.writeFileSync("CONTRIBUTORS.md", markdown, 'utf8');
    //console.log(JSON.stringify(contributors, null, '  '));
  });

})
req.end();
req.on('error', function(e) {
  console.error(e);
});

