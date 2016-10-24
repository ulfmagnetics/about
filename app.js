var express = require('express');
var path = require('path');
var app = express();

app.use(express.static(path.join(__dirname, '/public')));
app.use('/bower_components', express.static(path.join(__dirname, '/bower_components')));

var port = process.env.PORT || 6565;
app.listen(port, function () {
  console.log('Dev server listening on port ' + port + '!');
});
