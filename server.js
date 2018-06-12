// server.js
var express = require('express');
var app = express();
app.use(express.static('./'));
app.get("/", function (request, response) {
  response.sendFile(__dirname + '/index.html');
});
var listener = app.listen(process.env.PORT, function () {
  console.log('Listening on port ' + listener.address().port);
});

