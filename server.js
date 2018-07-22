// *** v0.1 a
var ex= require('express'), ap= ex();
var wl= ['https://pokerica.github.io', 'https://p22.glitch.me'];

function sh(q,a)
{
  var o= q.headers.origin;
  if(wl.indexOf(o) < 0) { q.connection.destroy(); return; }  
  a.header({'Access-Control-Allow-Origin':o});
}
 
ap.get('/lgn:msg', function(q, a)
{
  var t= '';
  if(q.params.msg === ':'+ process.env.SECRET)
    t= 'pOkk';
  else
    t= 'wrong password';
  
  sh(q,a);
  a.send(t);
  console.log('logme attempt');
});

ap.get('/lod', function(q, a)
{
  sh(q,a);
  a.sendFile(__dirname + '/m1.txt');
});

ap.post('/sav:msg', function(q, a)
{
  sh(q,a);
  var t, b= '';
  if(q.params.msg !== ':'+ process.env.SECRET)
  {   
    a.send(t= 'wrong password');
    q.connection.destroy();
    return console.log(t);
  }
  
  q.on('data', function(d)
  {
    b+= d;
    // *** Too much POST data > ~3MB
    if(b.length > 3210123)
    {
      b= (b.length/1024).toFixed(2);
      a.send(t= 'fail size:'+ b +' KB');
      
      q.connection.destroy();
      return console.log(t);
    }
  });
  
  q.on('end', function()
  {
    var fs= require('fs');
    fs.writeFile('m1.txt', b, function(e)
    { // writeFileSync?
      if(e)
      {
        a.send(t= 'fail write:'+ e);
        return console.log(t);
      }
      else
      {
        b= (b.length/1024).toFixed(2);        
        a.send(t= 'size:'+ b +' KB');
        console.log('saved:'+ t);
      }
    });
  });
  
});

ap.listen(3000);
