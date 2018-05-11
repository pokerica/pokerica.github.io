// server.js

var express = require('express');

var app = express();
app.use(express.static('./'));

app.get("/", function (request, response) {
  response.sendFile(__dirname + '/index.html');
});
/*
app.get("/db-p.fileLoad", function (request, response) { 
  response.type('html');
  response.sendFile(__dirname + '/db.txt');  
});


app.post("/db-p.fileSave", function (request, response) {  
  console.log('saving..');  
  
        var body = '';
        request.on('data', function (data) {
          
            body+= data;
  
            // Too much POST data, kill the connection!
            // 1e6 === 1 * Math.pow(10, 6) === 1 * 1000000 ~~~ 1MB
            if (body.length > 1e6)
                request.connection.destroy();
        });

  
        request.on('end', function () {
          
          //console.log('body; '+body);
          var fs=require('fs')
          fs.writeFileSync('db.txt',body, 'utf8');
          console.log('saved, ok!');
        });    

  response.sendFile(__dirname + 'index.html');
});
*/

// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log('Listening on port ' + listener.address().port);
});

