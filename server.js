var ex= require('express'), ap= ex();
var ac= {'Access-Control-Allow-Origin':
         'https://pokerica.github.io'};



ap.get("/lgn", function(q, a)
{
  if(q.headers.secret === process.env.SECRET)
  {
    a.header(ac).send('yoKk');
  }
  else
  {
    a.header(ac).send('noGy');
  }
//  console.log(q.headers.secret);
});



ap.get('/lod', function(q, a) {
  a.header(ac).sendFile(__dirname + '/db.txt'); });

ap.post("/sav", function(q, a)
{ 
  var t, b= '';
  a.header(ac);
  
  q.on('data', function(d)
  {
    b+= d;
    // Too much POST data ~3MB... kill the connection!
    if(b.length > 3210123)
    {
      b= (b.length/1024).toFixed(2);
      t= 'erSZ-s.save: '+ b +' KB';
      
      a.send(t);
      q.connection.destroy();
      return console.log(t);
    }
  });
  
  q.on('end', function()
  {
    t= (b.length/1025).toFixed(2);
    console.log('goIN-s.save: '+ t +' KB');
    
    var fs= require('fs');
    fs.writeFile('db.txt', b, function(e)
    { // writeFileSync?
      if(e)
      {
        t= 'erWR-s.save:'+ e;
        
        a.send(t);
        return console.log(t);
      }
      else
      {
        b= (b.length/1024).toFixed(2);
        t= 'okWR-s.save: '+ b +' KB';
        
        a.send(t);
        console.log(t);
      }
    });
  });
  
});

ap.use(ex.static('./')).listen(3000);
