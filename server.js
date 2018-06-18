var express= require('express');

var app= express();
app.use(express.static('./'));

app.post("/sv", function(q, a)
{ 
  var b= '';
  q.on('data', function(d)
  {
    b+= d;
    // Too much POST data ~3MB... kill the connection!
    if (b.length > 3012987 )
    {
      a.send('fail:'+ b.length);
      q.connection.destroy();
      return console.log('fail: '+ b.length);
    }
  });
  
  q.on('end', function()
  {
    var fs= require('fs');
    console.log('body.length; '+ b.length);
    fs.writeFile('db.txt', b, function(e)
    { // writeFileSync?
      if(e)
      {
        a.send('fail:'+ e);
        return console.log('fail: '+ e);
      }
      else
      {
        console.log('saved, ok!');
        a.send('pass:'+ b.length);
      }
    });
  });
  
});

app.listen(3000);
