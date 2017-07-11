//------------------------------------------------------------------------------
// App    LCL Capri
// Author Vincent Chartier
//------------------------------------------------------------------------------

// --- Variables
var cfenv = require('cfenv');
var appEnv = cfenv.getAppEnv();
var express = require ('express');
var app = express();

// --- Server start
app.use(express.static(__dirname + '/www'));
app.set('view engine','jade');
app.listen(appEnv.port, function() {
  console.log("Server started on " + appEnv.url);
});

// --- Methods serving HTML
app.get("/",function(req,res) {
  res.render('index.html');
});
