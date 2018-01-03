
$(document).ready(
  function() {   
	  
    var sleepOff= false; 
    var noSleep = new NoSleep();
         
    var audClick= new Audio("https://raw.githubusercontent.com/pokerica/pokerica.github.io/data/audClick.wav"); 
    //var audClick= new Audio("audClick.wav"); 
    audClick.load();  
  
    $.ajaxSetup({ async: true }); 
           
    var filesha="#init";
    var dbPas = "*pasInit";
    var prH = "1px 10px 1px 10px";
    var tPl = [ ["0", "declaration-init", "0", "0", "0"] ];
    var dbUrl = "https://api.github.com/repos/pokerica/pokerica.github.io/";
   
    var cshVer = 0;
    function updateCashe() {
      cshVer++;
    
/*
      window.UpUp.start({
        'cache-version': "v" + (cshVer++),
        'content-url': 'index.html',
        'assets': ['client.js', 'style.css', 'db.txt']
      });
*/       
    }
      
      
    function reFresh() {
      var ttxt = "Party Mix";
      if (!navigator.onLine)
        ttxt = "Party Mix --- OFFLINE"; 
      document.getElementById("ttl").value = ttxt;
      
      tPl.sort(function(a, b) {
        return b[4] - a[4]
      });
      $("#ptb").empty();
      //tPl.forEach(function(col) {
      for(var i= 0; i < 100; i++) {
        $('#ptb').append('<tr><td style="padding:' + prH + '">' + tPl[i][0] + '</td><td align="left">' + tPl[i][1] +
          '</td><td>' + tPl[i][2] + '</td><td>' + tPl[i][3] + '</td><td>' + tPl[i][4] + "% " + '</td></tr>'); 
      }
      
      //});    
    }
    
    function loadDB() {      
      $.ajax({
        url: dbUrl + "git/blobs/" + filesha, 
        //dataType: 'json',
        type: 'GET',
        beforeSend: function(xhr) { 
           xhr.setRequestHeader("Authorization", "Basic " + btoa("pokerica" + ":" + dbPas)); 
        }, 
          
        error: 
          function(e) { alert("Error: \n"+ JSON.stringify(e)); }        
          
      }).done(function(response, st, x) {
        //alert("proso: " + atob(response.data.content));        
        //alert("proso-json :" + atob(response.content));      
          
          //alert("aaa:" + JSON.stringify(response) +"  ###-> " + response);
          
        alert("loadDB-done: " + x.getAllResponseHeaders());
          
        var data = atob(response.content).split(',');
        //alert(data)
        
        tPl.length = 0;
        for (var i = 0; i < data.length / 4; i++) {
          if (Number(data[i * 4]) > 0)
            tPl[i] = [data[i * 4 + 0], data[i * 4 + 1], data[i * 4 + 2],
              data[i * 4 + 3], (100 * data[i * 4 + 3] / data[i * 4 + 2]).toFixed(2)
            ];
        }
        //frames['dbFrame'].contentWindow.document.body.textContent = tPl;
        reFresh();
      });      
    }
      
    function getSha() {
               
          var xhr = new XMLHttpRequest();
          var url = dbUrl + "git/trees/data";           
          if ("withCredentials" in xhr)
            xhr.open('GET', url, false); //true: async
          else {
            xhr = null;
            throw new Error('CORS not supported');
          }
          xhr.onerror = function() {
            alert('COARS error!');
          }
          xhr.onloadend = function() {
            alert("getShA-loadend: "+xhr.getAllResponseHeaders());
              
            var str = xhr.responseText;
            var pos1 = str.indexOf('db.txt');
            pos1 = str.indexOf('"sha": "', pos1);
            var pos2 = str.indexOf('",', pos1);
            filesha = str.substring(pos1 + 8, pos2);
            
            document.getElementById("dbFrame").contentWindow.document.body.textContent = devReady;
            
            loadDB();
            //updateCashe();
          }
          
          xhr.setRequestHeader("Authorization", "Basic " + btoa("pokerica" + ":" + dbPas)); 
          xhr.withCredentials = false;
          xhr.send();
    }
      
      
      
// ***action starts here   
    // *** modal popup login dialog          
    document.getElementById('mask').style.visibility = "visible";
    document.getElementById('popupbox').style.visibility = "visible";
    $('input#lg0').focus(); 
    
    $("#logIn").submit(
      function(event) {
      
        dbPas = $('input#pasIn').val(); 
        document.getElementById('mask').style.visibility = "hidden";
        document.getElementById('popupbox').style.visibility = "hidden"; 
        getSha();
      });
      
           
    $(".ord").click(
      function() {
        //audClick.stop();
        audClick.currentTime = "0";
        audClick.play();
      });
      
    $(".mnu").click(
      function() {
        //audClick.stop();
        audClick.currentTime = "0";
        audClick.play();
      });
      
              
    $("#mnu1").click(
      function() {       
      
        if (!sleepOff) {
          noSleep.enable(); 
          sleepOff = true;	
        } 
	else {		
          noSleep.disable(); 
          wakeLockEnabled = false;	
        } 
	      
	document.getElementById("dbFrame").contentWindow.document.body.textContent = "sleepOff: " + sleepOff;
	      
      });
      
    $("#mnu2").click(
      function() { 
        
        if (prH != "1px 10px 1px 10px")
          prH = "1px 10px 1px 10px";
        else
          prH = "10px 10px 10px 10px";
        reFresh();
	      window.powermanagement.release();
      });
      
    $("#mnu3").click(
      function() {
        //loadDB();
        //reFresh();        
        
        var num= 30;
        tPl.length = 0;
        for (var i = 0; i < num; i++) {
          var name= (Math.random()+Math.random()).toString(36).replace(/[^a-zA-Z]+/g, '').substr(0, 9);
            tPl[i] = [i+1, name.charAt(0).toUpperCase() + name.slice(1),
                        num+100, i+2, (100 * (i+2)/(num+100)).toFixed(2)];
        } 
        reFresh();      
      });            
      
           
     
    $("#svBut").click(
      function() {
        
        var upData = [ ["0", "upload-data", "0", "0"] ];
 
        tPl.forEach(function(col) {
          upData.push(col[0], col[1], col[2], col[3]);
        });
        if (navigator.onLine) {     
            // ***************** S A V E  D B ****************************************            
            var filemessage = "datttteee";
            var filecontent = upData;
            var basecontent = btoa(filecontent);   
            var filedata = '{"message":"'+ filemessage +'","content":"'+ basecontent 
                             +'", "branch":"'+ "data" +'", "sha":"' + filesha + '"}'; 
 
            $.ajax({
              url: dbUrl + "contents/db.txt", 
              type: 'PUT',
              beforeSend: function(xhr) {
                //xhr.setRequestHeader("Authorization", "token 1fa49d9ba6xxxxxxxx462b3e9d690073c99");
                xhr.setRequestHeader("Authorization", "Basic " + btoa("pokerica" + ":" + dbPas)); 
              },
              
              data: filedata,
              
              error: 
              function(e) { alert("Error: \n"+ JSON.stringify(e)); }
                   
            }).done(function(response, st, x) {
              alert("proso: " + JSON.stringify(response.content.sha));
              alert("saveDB-done: " + x.getAllResponseHeaders());
              //reFresh();
              //updateCashe();
              
              filesha= response.content.sha;
              document.getElementById("dbFrame").contentWindow.document.body.textContent = filesha;
            
              alert("Database saved! cache.v" + cshVer);
            }); 
            //********************************************************* 
 
        } else {
          reFresh();
          alert("No connection to server, saved to memory!");
          //frames['dbFrame'].contentWindow.document.body.textContent = upData;
        }
      });    
    
    $('input').on('keydown', 
      function(e) { 
         
        if(e.which === 9 || e.which === 13 || e.which === 10) {
           
           var tabindex = $(this).attr('tabindex');
            tabindex++; 
            if(tabindex < 5)          
              $('[tabindex=' + tabindex + ']').focus();      
            else {
              e.preventDefault();
              $('#frmInput').submit(); 
            }           
            
            return false;
        } 
    });
       
    $("#frmInput").submit(
      function(event) {
        event.preventDefault(); 
        //alert("aa: " + JSON.stringify(event));

        if (event.type === "submit") {
           //Handling "Go" Button to move to next input field
         // $('input#in2').focus(); 
          //return;
       }
        
        var col0 = $('input#in0').val();
        var col1 = $('input#in1').val();
        var col2 = $('input#in2').val();
        var col3 = $('input#in3').val();
        var col4 = (100 * col3 / col2).toFixed(2);
        tPl.push([col0, col1, col2, col3, col4]);
        
        
        $('input#in0').val('');
        $('input#in1').val('');
        $('input#in2').val('');
        $('input#in3').val('');
        $('input#in0').focus();
        
        reFresh();
      });
      
    $("#rsBut").click(
      function() {
        tPl = [
          ["0", "reset-init", "0", "0", "0"]
        ];
        reFresh();
      });       
     
  }); //doc.ready() END
  
