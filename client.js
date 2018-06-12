var versionCode= "v1.3r85 \n";

$(document).ready(
function() {  
     
 // ☆☆☆ load from cache blob? 
 var audQuack= new Audio("https://raw.githubusercontent.com/pokerica/pokerica.github.io/data/qua.wav");
 var audCheng= new Audio("https://raw.githubusercontent.com/pokerica/pokerica.github.io/data/che.wav");  
 var audClick= new Audio("https://raw.githubusercontent.com/pokerica/pokerica.github.io/data/cli.wav");
 var audChang= new Audio("https://raw.githubusercontent.com/pokerica/pokerica.github.io/data/cha.wav"); 

  
 $.ajaxSetup({ async:true, cache:true, timeout:7000 });       
  
 var dbUrl= "https://api.github.com/repos/pokerica/pokerica.github.io/"; 
 var adminInfo= document.getElementById("dbFrame"); //.contentWindow.document.body;
 var nBar= document.getElementById("notif");
  
 var dbPass= "*";
 var filesha= "#";
 var isLogged= false; 
 
 var listMode= 1;
 var editRow= -1;
 var editMode= false;
 var gameOver= false;
  
 var nextID= 0; 
 var curTab= 1;
 var vSpace= 10;
 var sortColP= 4;
 var sortColH= 0;
 var muteAudio= false;
  
  
 // ***  id  name  gms  $buy  $won  $bal  csh%  rnk%  total
 var tPl = [ ["0", "declaration-init", "0", "0", "0", "0", "0", "0", "0"] ];
  
  
 var sortedPl= [ 'name1', 'name2', 'name3' ];
  
 // ***         id1.rx, id2.rx, id3.rx...
 var rvsPLindex= [ 0, 1, 2, 3 ];
 /*                             v-1st..       v-2nd..
   date | #nP | $bank | $1st | plid : $buy : plid...    */
 var tHi= [ [ '20010101005959', '2', '0', '0', '0:0:1:1:2:1' ] ];
 // ***                 date     np bnk $1  1st     $2  2nd        m-tGm   gid
 var tHiFull= [ [ 20180101005959, 0, 0, 0, 'name1', 0, 'name2', '0:0:1:1', 0 ] ];
  
       
 // ***                 0     1     2     3     4    5     6     7       8
 // *** tPl:           id    name  gms  $buy  $won  $bal  csh%  rnk%  total
 // *** tHiFull:       date  np    bnk  $1    1st   $2    2nd   m-tGm   gid
 // *** tGm:           isIn  pid   rnk  $won  $buy
 var tGm = [ ['F', 0, '-', '-', 0] ];
  
 //var tb= document.getElementById('playerTable');
 //var gmt= document.getElementById('gameTable');
 //var hit= document.getElementById('historyTable');
 //var selected= tb.getElementsByClassName('selected');
 //var selected= $('#ptb')[0].getElementsByClassName('selected');
  
 function fCash(num) {
   // *** clear commas: .replace(/,/g, '')
   
   if(isNaN(num)) return '-';
   else
     return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");   
 }
   
 function numCTD() {
   
   var dt= new Date(); 
   var retStr= dt.getFullYear() 
                 + ("00"+(dt.getMonth()+1)).slice(-2) 
                 + ("00"+dt.getDate()).slice(-2)
                 + ("00"+dt.getHours()).slice(-2)
                 + ("00"+dt.getMinutes()).slice(-2)
                 + ("00"+dt.getSeconds()).slice(-2);
   
   var retInt= parseInt(retStr, 10);
   return retInt;
 }
  
  
// *** recalc. selected history-table rows  
 function reclcSelHrows() {
   
   
   var tSelSum = JSON.parse(JSON.stringify(tPl));
   tSelSum.sort(function(a, b) { return a[0] - b[0] });
   tSelSum.forEach(function(row) {
     
     row[2]= row[3]= row[4]= row[5]= row[6]= row[7]= row[8]= 0;
   });

   
   
   var selHgm= $('#htb')[0].getElementsByClassName('selected');
   
   for(var j= 0; j < selHgm.length; j++) {
   
     var ri= +$(selHgm[j]).children()[8].innerText;
     
     var fSiz= 5;
     var miniGm= tHiFull[ri][7].split(':');
     for(var i= fSiz; i < miniGm.length; i+= 5) {
        
         var pid= +miniGm[i+0]-1;
         var buy= +miniGm[i+1];
       
         var won= 0;
         if(i/fSiz === 1) won= +tHiFull[ri][3]; // $:1
           else if(i/fSiz === 2) won= +tHiFull[ri][5]; // $:2
       
         //var wons= (mnyw === 0) ? '   ' : fCash(+mnyw*100);
         
         tSelSum[pid][2]++;
         tSelSum[pid][3]+= buy;
         tSelSum[pid][4]+= won;
        
     } //end for i     
   } //end for j
  
   
   var stb= '';
   stb+= ' NAME      $BUY    $WON      >$BAL<            #(gms)  %(buy)   %(won)  \n'
       + '----------------------------------------------------------------------- \n';
   
   tSelSum.forEach(function(row) {
     
     row[5]= row[4] - row[3]*10;
     row[6]= c6Avg(row[3], row[2]);
     row[7]= c6Avg(row[4], row[2]);
     
   });
   
   
   tSelSum.sort(function(a, b) { return b[5] - a[5] });
   
   var pl= 0;
   for(var pid= 0; pid < tSelSum.length; pid++) {

     if(tSelSum[pid][2] > 0) {
       
       pl++;
       
       var gms= tSelSum[pid][2];
       var buy= tSelSum[pid][3];
       var won= tSelSum[pid][4];
       
       var bal= tSelSum[pid][5];
       var av6= tSelSum[pid][6];
       var av7= tSelSum[pid][7];
       

       stb+= ' '+(tSelSum[pid][1] +'        ').substring(0, 8)
       
             + ('     '+ (buy +'k')).slice(-5)
             + ('         '+ fCash(won *100)).slice(-9)
       
             + ('           '+ fCash(bal *100)).slice(-11)
       
             + '              '+ ('    '+ gms).slice(-4)
       
             + ('         '+ fCash(av6 *100)).slice(-9)
             + ('         '+ fCash(av7 *10)).slice(-9)
       
             + ' \n';
     }
   }
 
  if(selHgm.length < 1)
     document.getElementById('sumSg').innerText= "___selected games balance___";
   else
     document.getElementById('sumSg')
       .innerHTML= ('<pre id="selSum" style="font:bold 15px monospace; '
                  + 'padding:0 10px; margin-bottom:20px; text-align:left;">'+ stb +'</pre>');
   
   $('#selSum').css({height:(pl +2)*18 +'px'});
 }
  
  
  
  
  
 var keepMsgBar= false;
 function rowAnim(tbrow, turnOn) {

           if(!turnOn) {
             
             $(tbrow).removeClass('already').removeClass('clean');
             if(listMode > 1)
               $(tbrow).addClass('clean').removeClass('selected');
             else
               $(tbrow).removeClass('selected');
             
             if(curTab === 3) reclcSelHrows();
           }
           else {
             
             $(tbrow).removeClass('clean').addClass('selected');
             
             if(curTab === 3) reclcSelHrows();
           }
 }
  
   
 function resetEdit(formToo) {

   var selRows= $('#ptb')[0].getElementsByClassName('selected');
   $(selRows).removeClass('already').removeClass('clean');

   if(listMode > 1)
     $(selRows).addClass('clean').removeClass('selected');   
   else     
     $(selRows).removeClass('selected');   

   if(!formToo) return;
   
   //$('.initDis').prop("disabled", true);
   
   editRow= -1;
   document.getElementById("subBut").value= "New";
   $('input#in0').val(nextID+1);
   $('input#in1').val('');
   $('input#in2').val('');
   $('input#in3').val('');
   $('input#in4').val('');
   $('input#in5').val('');  

   //$('input#in1').focus();
 }
 
  
  
  
  
 // *** timer stuff... 
 var btSec= 0;
 var btMin= 0;
 var ttMin= 0;   
 var btState= 8;  
 var bankTotal= 0;
  
 function timeText(istt) {
   
   if(gameOver && !istt) return "ENTER";
     
     
   if(!istt) { var m= btMin, s= btSec; if(btSec >= 60) { m++; s= 0; }     
     return ("00" +m).slice(-2) +":"+ ("00" +s).slice(-2); }
   else {     
     var m= ttMin % 60, h= (ttMin -m) / 60;
     return ("00"+h).slice(-2) +":"+ ("00"+m).slice(-2); }
   
   return "??:!!";
 }

 var sirenState= 0;   
 function timerPaint(isBlack, inf) {   
   
   var bt= document.getElementById("blindTimer");
   
   if(sirenState > 0 && inf === "!!!") {

       if( (sirenState === 1 && listMode !== 3)  
            ||(sirenState === 2 && listMode === 3) ) {

         inf= 'Alarm !!!';    
         document.body.style.backgroundColor = "white";
       }
       else {
         
         inf= '!!! Alarm';  
         document.body.style.backgroundColor = "black";
       }
       isBlack= (sirenState === 2);    
   }
    
   
   if(listMode === 3)
     isBlack= !isBlack;
   
   switch(isBlack) {
     
     case false: 
         if(listMode === 3)
           $(bt).css({"border-color":"white"}); 
         else
           $(bt).css({"border-color":"lightgrey"}); 
         
         $(bt).css({"background":"black", "color":"white"});
        
       break;
       
     case true: 
         if(listMode === 3)
           $(bt).css({"border-color":"white"}); 
         else
           $(bt).css({"border-color":"grey"}); 
         
         $(bt).css({"background":"white", "color":"black"});
         
       break;
   }       
   
   if(inf !== "***") 
     bt.innerHTML= timeText(false) +'<b id="timeTxt">'+ inf +'<br>'
                                   + 'Game time '+ timeText(true) +'</b>';
 }
  
 var rotStrT= 'rot-T';
 $("#blindTimer").on("transitionend", //// webkitTransitionEnd oTransitionEnd MSTransitionEnd
 function(e) {

    if (!e || e.defaultPrevented) return;
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
        
    if(this.style.transform === rotStrT +"90deg)") {
      
      if(btState === 0)
        timerPaint(false, 'Click to START');
      else
        timerPaint(true, 'Click to PAUSE');
      
      
      $(this).css({"transform":rotStrT +"0deg)"});         
    }
    else            
    if(this.style.transform === rotStrT +"0deg)") {
      
      $(this).css({"transition":"", "transform":""}); 
    }
 });
  
  
 var revSort= false;
 var initGanim= false;

 // *** tabs# redraw... *********************************************************
  
 function freshTab1() {
     
   var tscp= sortColP;
   
   if(tscp === 5) tscp= 2;
   else if(tscp > 1 && tscp < 5) tscp++;
     
   if(revSort)
     tPl.reverse();
   else
   if(tscp !== 1)    
     tPl.sort(function(a, b) { if(tscp === 0) 
       return a[tscp] - b[tscp]; else return b[tscp] - a[tscp]; });
   else 
     tPl.sort( function(a, b) { 
       if(b[tscp] > a[tscp]) return -1;
       else
         if(b[tscp] < a[tscp]) return 1;
       else 
         return 0; 
     });
      
   
   rvsPLindex.length= tPl.length;
   
   var vpd= '15px 5px 12px 5px';
   if(vSpace > 10) vpd= '25px 5px 22px 5px'; 
   
   var cx= 0;
   nextID= 0;
   $("#ptb").empty();      
   tPl.forEach(function(col) {
          
     rvsPLindex[ (+col[0]) ]= cx++;;
 // ***  id  name  gms  $buy  $won  $bal  csh%  rnk%  total
     //var rvg= Math.round(col[7]/col[2]);
     if(+col[0] > nextID) nextID= +col[0];         
     $('#ptb').append('<tr><td class="admin">'+ col[0]
                      +'</td><td style="padding:' + vpd                      
                      +'; text-align:left">'+ col[1]
                      
                      
                      +'</td><td>'+ ((col[2] === 0) ? ' ' : fCash(col[3]*1000))
                      +'</td><td>'+ ((col[2] === 0) ? ' ' : fCash(col[4]*100))
                      +'</td><td>'+ ((col[2] === 0) ? ' ' : fCash(col[5]*100))
                      
                      
                      +'</td><td>'+ ((col[2] === 0) ? ' ' : col[2])
                      
                      +'</td><td>'+ ((col[2] === 0) ? ' ' : fCash(col[6]*100))
                      +'</td><td>'+ ((col[2] === 0) ? ' ' : fCash(col[7]*100))
                      /*
                      +'</td><td>'+ ((col[2] === 0) ? '-' : (col[8]/10).toFixed(1))
                      */
                      
                      +'</td></tr>'); 
   });
   
   
   
   $('#ptb>tr').addClass("clean"); 
   switch(listMode) {
     case 1: $('#ptb>tr').removeClass('clean'); break; 
     case 2: $('#ptb>tr').css("border-top", "1px solid lightgrey"); break;     
     case 3: // plain, besic set in css '.clean'
   }
   

   // *** header
   $('#pth>tr').children().css({border:'none'});
   $("#pth>tr").children().eq(sortColP).css({border:'2px solid grey'});
   
   
   for(var i= 0; i < tPl.length; i++) {
     
     var pid= (+tPl[i][0]) - 1;
     //alert('i: '+ i +'   pid: '+ pid);
     
     if(tGm[pid][0] !== 'F') 
       $('#ptb>tr').eq(i).removeClass('clean').addClass('selected'); 
     
     if(tGm[pid][0] === 'A')
       $('#ptb>tr').eq(i).addClass('already');
   }
   
 }
  
  
 var curRank= 0;
 var reInit= false;  
 var rotStr= 'rot-0'; //"rotate3d(0, 1, 0, -"; 
 function freshTab2() {   
   
   var vss= '';   
   var vpd= '15px 5px 12px 5px';
   if(vSpace > 10) {
     vss= 'style="bottom:17px"'; 
     vpd= '25px 5px 22px 5px'; 
   } 
   
   var cnt= 0;
   $('#gtb').empty();
   tGm.forEach(function(col) {
     var showStr= 'style="display:none"';
     if(reInit) { col[2]= '-'; col[3]= '-'; }
     if(editMode || col[0] === "T" || col[0] === "A") showStr= ''; //'style="display:table-row"';
     $('#gtb').append('<tr '+ showStr +'><td class="admin" style="text-align:center">'+ col[0] 
                      +'</td><td class="admin" style="padding-right:20px">'+ col[1]
                      +'</td><td style="text-align:left; padding:' + vpd + '">'+ sortedPl[ +col[1] -1 ]
                      +'</td><td style="text-align:center">'+ col[2]
                      +'</td><td>' //<input type="tel" autocomplete="off" style="text-align:left">'                      
                      + fCash(+col[3]) 
                      +'</td><td style="text-align:right">'+ fCash(+col[4] *1000) 
                      +'</td><td style="position:relative; overflow:visible">'
                      +'<pre class="mnyInfo"' +'> </pre>'
                      +'<pre class="money"' + vss +'>  $  </pre></td></tr>');  
     
     
     if(!reInit && +col[2] > 0) {
       
       var mny= $('.money')[cnt];
       
       $(mny).css({right:'430px', font:'bold 15px monospace',
                   background:'lightgrey', color:'black',
                   bottom:'12px', width:'50px', height:'25px'}); 
      
       mny.innerText= 'OUT'; 
       
       if(vSpace > 10) 
        $(mny).css({bottom:'21px'});
       
       if(+col[2] === 2) { 
         $(mny).css({right:'390px'}); mny.innerText= '2nd'; } 
       else
       if(+col[2] === 1) { 
         $(mny).css({right:'390px'}); 
         mny.innerText= '1st';        
       }
         
     }
     
     cnt++;
  });
    
   
  $('#timeSelect, #blindSelect')
     .css({filter:'', color:'black', 'background-color':'white'});  
  $('#lblBank, #timeSelect, #blindSelect').css({'border-color':'black'});
  
  switch(listMode) {
      
    case 1: // empty, default defined in .css
      break;
    case 2: $('#gtb>tr').css("border-top", "1px solid lightgrey");
      break;      
    case 3: $('#lblBank').css({'border-color':'white'});
            $('#gtb>tr').css("border-top", "1px solid grey");
            $('#timeSelect, #blindSelect').css({"filter":"invert(100%)"});
            $('#appFrame, #tab2').css({"color":"white", "background":"black"});
      break;
  }   
   
   
/*   
  $(".money").off();   
  $(".money").on("transitionend", //// webkitTransitionEnd oTransitionEnd MSTransitionEnd
  function(e) {
*/
 }  

  
  
  
 var monthStr= ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  
 // *** tHiFull:  0:date  1:#nP  2:$bnk  3:$1  4:1name  5:$2  6:2name  7:m-tGm
 function freshTab3() {   
     
   
   // *** hmmm, can I not do without this?
   //tPl.sort(function(a, b) { return a[0] - b[0] });
   
   var srtCH= sortColH;
   if(sortColH === 7) srtCH= 8;
   
   if(revSort)
     tHiFull.reverse();
   else
   if(srtCH !== 4 && srtCH !== 6)
     tHiFull.sort(function(a, b) { 
         return b[srtCH] - a[srtCH]; });
   else 
     tHiFull.sort( function(a, b) { 
       if(b[srtCH] > a[srtCH]) return -1;
       else
         if(b[srtCH] < a[srtCH]) return 1;
       else 
         return 0; 
     });
   
   var vpd= '15px 5px 12px 5px';
   if(vSpace > 10) vpd= '25px 5px 22px 5px';
   
   
   var cnt= 0;
   $('#htb').empty();
   tHiFull.forEach(function(col) {
     var showAdmin= ''; //'style="font:7px monospace; white-space:pre-wrap"';  
     if(!editMode) showAdmin= 'style="display:none"';
    
     var mon= +(''+col[0]).substring(4,6);
     var dtStr= (''+col[0]).substring(6,8)+" " + monthStr[mon-1] + "`"+(''+col[0]).substring(2,4);
     //var dtStr= ''+col[0];
     
     $('#htb').append('<tr><td style="font:17px bold monospace; text-align:center;">'
                     +dtStr
                     +'</td><td style="padding:' + vpd + '">'+ col[1]
                     +'</td><td>'+ fCash(+col[2]*1000) // bank
                     +'</td><td>'+ fCash(+col[3]*100) // $:1
                     +'</td><td  style="text-align:left">'+ col[4]
                     +'</td><td>'+ fCash(+col[5]*100) // $:2
                     +'</td><td style="text-align:left">'+ col[6]
                      
                     +'</td><td '+ showAdmin+'>'+ col[8] 
                     +'</td><td style="display:none">'+ cnt 
                     +'</td></tr>');
     cnt++;
   });
   
   
   
   $('#htb>tr').addClass("clean"); 
   switch(listMode) {
     case 1: $('#htb>tr').removeClass('clean'); break; 
     case 2: $('#htb>tr').css("border-top", "1px solid lightgrey"); break;     
     case 3: break;
   }
   
   
   // *** header   
   $('#hth>tr').children().css({border:'none'});
   $('#hth>tr').children().eq(sortColH).css({'border':'2px solid grey'});
   //[0].childNodes[sortColH].style= "border:1px solid g";
   
   
   if(editMode) {
     
     $('#dtEdit').val('');
     $('.initDis').prop("disabled", true);
   }
   
   //freshCanvas();
   reclcSelHrows();
 }

  
  
  
// *** clear state timeout
 var clrST;
 var ssPend= false;
  
 
// ***  SAVE STATE - - - - - - - - - -  
 var tmpGm= [[ 1, 2, 3, 4, 5 ]];
  
 function prtGm() {  
   adminInfo.innerText+= '\n'
                      + '[tGm]: 0    1   2      3      4 \n'
                      + '      in?  id  rnk   $won   $buy \n'
                      + '--------------------------------- \n';
   
   tmpGm.forEach(function(col) {     
     adminInfo.innerText+= ('        '+ col[0]).slice(-8)
                         + ('     '+ col[1]).slice(-5)
                         + ('     '+ col[2]).slice(-5)
                         + ('        '+ col[3]).slice(-7)
                         + ('        '+ col[4]).slice(-7) +' \n';
   });   
 }
  
 function loadState(isImport) {
     //nBar.innerText= ''; clrNotif();   
     caches.open('pmpAppCache').then(
     function(cch) { cch.match('cchGm').then(
       function(mres) { 
         if(!mres) return "!empty"; 
           else return mres.text(); }).then(
       
           function(loDat) {
             
               tmpGm.length= 0;
               if(loDat === "!empty") { tmpGm.push([ '.', '..', '..', '....', '..']);
                 adminInfo.innerText+= "Game state empty, skip import! \n"; prtGm(); return; }
               else {
                 loDat= loDat.split('|');
                 loDat.forEach(function(row) {
                   tmpGm.push( row.split(':') ); });


                 tmpGm.forEach(function(col) {
                   col[1]= +col[1]; col[4]= +col[4]; 
                   col[2]= +col[2]; col[3]= +col[3];
                 });
               }

               if(isImport) {

                 tGm.length= 0;            
                 tGm= tmpGm.slice(0);
                 //tGm= JSON.parse(JSON.stringify(tmpGm));

                 nBar.innerText+= "Game state imported"+ endNotfChar;
                 adminInfo.innerText+= "Game state imported, rows#: "+ tGm.length +'\n';
                 
                 resetEdit(false);
                 
                 keepMsgBar= true;
                 $('#mtb1').click();
               }
               else 
                 adminInfo.innerText+= "Game state acquired, rows#: "+ tmpGm.length +'\n';

               prtGm();
             
           }).catch(function(err) {
               nBar.innerText+= 'Load game state failure: '+ err.message +endNotfChar; });
     });    
 }

  
 function saveState(isClear) {   
//     nBar.innerText= ''; clrNotif();                 
         caches.open('pmpAppCache').then(
         function(cch) {
             cch.delete('cchGm', {ignoreSearch:true}).then( function(res) {

                 if(isClear) {
                   cch.put('cchGm', new Response("!empty", {"status":200}) );
                   tmpGm.length= 0; tmpGm.push([ '.', '..', '..', '....', '..']);
                   adminInfo.innerText+= "Game state cleared! \n"; prtGm(); return;
                 }
               
                 var upDat= [0,1,2];

                 upDat.length= 0;
                 tGm.forEach(function(row) {
                   if(row[0] !== 'F') row[0]= 'A';
                   upDat.push( row.join(':') ); });
               
                 cch.put('cchGm', new Response(upDat.join('|'), {"status":200}));

                 nBar.innerText+= "Game state recorded"+ endNotfChar;           
                 adminInfo.innerText+= "Game state recorded, rows#: "+ tGm.length +'\n';
            
                 tmpGm.length= 0; 
                 //tmpGm= tGm.slice(0);
                 //tmpGm= JSON.parse(JSON.stringify(tGm));
               
                 prtGm();
             });
         }).catch(function(err) { 
              nBar.innerText+= "Save game state failure: "+ err.message+ endNotfChar; });
 }
  
  
  
// *** GAME OVER *** *** *** *** *** *** *** *** *** *** *** *** *** *** ***

 function c6Avg(buy, nG) {
   var retVal= buy*10 / nG;
   if(isNaN(retVal)) retVal= -555; 
   return Math.round(retVal);
 }
  
 function c7Avg(won, nG) {

   var retVal= won / nG;
   if(isNaN(retVal)) retVal= -444; 
   return Math.round(retVal);
 }
  
  
// *** GAME OVER *** *** *** *** *** *** *** *** *** *** *** *** *** *** ***
var useThisDate= 0;
var gamePlayers= 0;
var sortedRnk= [ [1, 2] ];

// *** disMini: ∑nG, ∑buy, ∑won...
var disMini= [ [ 0, 0, 0 ] ];
var rx1= 0, rx2= 0; // table row for 1st & 2nd place
  
function actSavG() {
  
  var cf1= +tGm[rx1][3];
  var cf2= +tGm[rx2][3];
  
                 $('#gtb>tr')[rx1].cells[4].innerText= fCash(cf1*100);
                 
                 var gdat= numCTD();
                 if(useThisDate > 0) gdat= useThisDate;
                 
                 tPl.sort(function(a, b) { return a[0] - b[0] });
                 var sortedMini= [ [0, 0, 0, 0, 0, 0] ]; 
                 sortedMini.length= 0; 
                 
                 var cnt= 0;
                 tGm.forEach(function(col) {
                   //              0   1     2    3     4     5     6     7     8
                   // *** tPl:    id  name  gms  $buy  $won  $bal  csh%  rnk%  total 
                   // *** tGm:  isIn  pid   rnk  $won  $buy
                   
                   if(tPl[cnt][2] <= 0) 
                       tPl[cnt][2]= tPl[cnt][3]= tPl[cnt][4]= tPl[cnt][5]= tPl[cnt][6]= tPl[cnt][7]= tPl[cnt][8]= 0;
                   
                   if(+col[4] > 0) {
                    
                      //                    rnk     pid      buy    ∑nG   ∑buy  ∑won
                      sortedMini.push([ +col[2], +col[1], +col[4], tPl[cnt][2], tPl[cnt][3], tPl[cnt][4] ]);

                      tPl[cnt][2]+= 1; //gms
                      tPl[cnt][3]+= col[4]; //buy;
                      tPl[cnt][4]+= isNaN(col[3]) ? 0 : col[3]; //won
                     
                      tPl[cnt][5]= tPl[cnt][4] - tPl[cnt][3]*10; //bal                      
                      tPl[cnt][6]= c6Avg(tPl[cnt][3], tPl[cnt][2]); 
                     
                      tPl[cnt][7]= c7Avg(tPl[cnt][4], tPl[cnt][2]);
                      tPl[cnt][8]= tPl[cnt][6] + tPl[cnt][7]; //totl
                   }
                   
                   cnt++;
                 });
                 
                 
// *** disMini:    ∑nG, ∑buy, ∑won...
  
                 sortedMini.sort(function(a, b) { return a[0] - b[0] }); 
//alert('aa: '+ sortedMini);
                 if(useThisDate > 0 && sortedMini.length !== disMini.length) {
                   alert('err:min'); 
                   return;
                 }
  
                 cnt= 0;
                 var upGm= "0:0:0:0:0"; 
                 sortedMini.forEach(function(col) {
                   
                   if(useThisDate > 0)
                     upGm+= ':'+ col[1] +':'+ col[2] +':'+ disMini[cnt][0] +':'+ disMini[cnt][1] +':'+ disMini[cnt][2];
                   else
                     upGm+= ':'+ col[1] +':'+ col[2] +':'+ col[3] +':'+ col[4] +':'+ col[5];
                 
                   cnt++;
                 });

                 
 /*                 0       1      2      3      v-1st       v-2nd     
         tHi:     date     #nP   $bnk   $1st  | id : $buy : id... 
 // *** tHiFull:  date     #np    bnk    $1    1st   $2    2nd  |  m-tGm |  gid
                    0       1      2      3     4     5     6      7         8*/    
                 
/*
                 tHiFull.push([ gdat, gamePlayers, bankTotal,
                      cf1, 
                      sortedPl[ sortedMini[0][1]-1 ], 
                      cf2, 
                      sortedPl[ sortedMini[1][1]-1 ],
                      upGm, -99 
                 ]);                 
                 */
                 
                 tHi.push([ gdat, gamePlayers, bankTotal, cf1, upGm ]);
  
  
  
                 saveDB();
  
                 saveState(true); 
                 
                 gamePlayers= 0;
                 gameOver= false;
                 
                 btSec= btMin= ttMin= 0; btState= 8;  
                 timerPaint(false, 'Click to START');
  
  
                 $('#mtb3').click();
  
                 if(useThisDate > 0 && editRow >= 0)
                   $('#htb>tr').eq(editRow).children().eq(1).click();
                 else
                   $('#htb>tr').eq(0).children().eq(1).click();
  
    useThisDate= 0;
  
    //alert('editRow@actSavG: '+ editRow);
}
  
function finalSave() {
  
    var cf1= +tGm[rx1][3];
    var cf2= +tGm[rx2][3];
  
               //$('#gtb>tr')[rx1].cells[4].innerText= fCash(cf1*100);
               
               if(isNaN(cf1) || isNaN(cf2) || cf2 < 0 || cf1 < cf2
                  || cf1 < bankTotal*5 || cf1 > bankTotal*10) {
                 
                 if(Math.random() < 0.3)
                   alert("Whaaat?!");
                 else
                 if(Math.random() < 0.5)
                   alert("La-le-li-lu-le-lo?!");
                 else
                   alert("It does not compute!");
                

                 $('#gtb>tr')[rx1].cells[4].firstChild.focus();
               }
               else
               if(confirm('1st $'+ fCash(cf1*100) +'  ::  '
                        + '2nd $'+ fCash(cf2*100) +' \n '))
               {
                 // Save it!
                 
                 ssPend= false;
                 clearTimeout(clrST); 
                 
                 actSavG();
               }
               else
                 $('#gtb>tr')[rx1].cells[4].firstChild.focus();
}
  
  
  
  
  
function mnySplit() 
{

  var wfT= $('#gtb>tr')[rx1].cells[4];
  
  wfT.innerText= "";
  wfT.innerHTML= '<input type="tel" autocomplete="off" style="text-align:right; padding:5px 10px">';       
  var wf= wfT.firstChild;
  
  $(wf).css({border:'1px solid gold', width:'90%'});
    
  $(wf).off();  
  $(wf).on('focus',
  function(e) {       
    //alert(1);
    
    //e.stopImmediatePropagation(); 
    e.stopPropagation(); 
    if(!e || e.defaultPrevented) return;
    e.preventDefault();
  
    tGm[rx1][3]= 0;
    tGm[rx2][3]= 0;
 
    //$('#gtb>tr')[rx1].cells[4].firstChild
      
    this.value= "00";
    this.setSelectionRange(0, 0);
    $('#gtb>tr')[rx2].cells[4].innerText= "???";
  });
   
  /*
  $(wf).on('blur', 
  function(e) {
    
    e.stopImmediatePropagation(); e.stopPropagation(); 
    if(!e || e.defaultPrevented) return; e.preventDefault();
    
    this.focus();
  });
  
*/

 $(wf).on("keydown",
 function(e) {
   
   e.stopImmediatePropagation(); e.stopPropagation();
   if(!e || !e.which || e.defaultPrevented) return;
   //e.preventDefault(); 
  
     if(e.which === 13 || e.which === 9) {
       
       e.preventDefault(); 
       //alert(99); return;
       
       finalSave();
     }   
 });
   
 $(wf).on("keyup",
 function(e) {
    
   //alert(JSON.stringify(e));
   
   e.stopImmediatePropagation(); e.stopPropagation();
   if(!e || !e.which || e.defaultPrevented) return;
   e.preventDefault(); 
           
       //alert(e.which);
       
       var w1Typ= e.target;  
       var w2Typ= $('#gtb>tr')[rx2].cells[4];
       
       var wf1, wf2;
       var nsf= (w1Typ.value.replace(/,/g, '')); 
                 
       if(e.which === 8 || isNaN(nsf) 
          || +nsf <= 0 || nsf === "00") {
         
         tGm[rx1][3]= 0;
         tGm[rx2][3]= 0;
         
         this.value= "00";
         this.setSelectionRange(0, 0);
         w2Typ.innerText= "???";
         
         //w1Typ.focus().blur();
         return;         
       }
   
       //alert('isN: '+isNaN(nsf)+'aa: >'+nsf+'<    bb:'+tGm[rx1][3]);
   
       if(nsf > 99) nsf/= 100; 
       
       wf1= parseInt(nsf, 10);
       wf2= bankTotal*10 - wf1;
       
       tGm[rx1][3]= wf1;
       tGm[rx2][3]= wf2;
       w1Typ.value= fCash(wf1*100);
       w2Typ.innerText= fCash(wf2*100);
       w1Typ.setSelectionRange(w1Typ.value.length-2, w1Typ.value.length-2);
  });
     
  
  gameOver= true;
     
        
  btState= 0;
  sirenState= 0;
         
  timerPaint(false, 'Click to SAVE');
  
  //var bt= document.getElementById("blindTimer");
  //bt.innerHTML= "Enter & Save";
  
  
  wf.focus();
}
  
  
  
 // *** main redraw function --- D O W N   B E  =L O W  ****************
  
  
 var lastNotif= "";
 function clrNotif() {
   lastNotif= nBar.innerText; nBar.innerText= ""; }  
  
  
  
 // *** main redraw function ************************************************
  
 var lastTab= 0;
 var fastInit= 0;
 var dontInit= false;
 var initOnceG= false;
 function reFresh() {
   
   var ttxt= "Party Mix";
   if(!navigator.onLine) ttxt= "OFFLINE"; 
   document.getElementById("mtb1").value = ttxt;
  
   
   if(useThisDate > 0 && curTab === 1) {
     nBar.innerText= 'Cannot now, save first' +endNotfChar;
     $('#mtb2').click(); return;
   }
   
   if(!initOnceG || (!dontInit && editMode && curTab !== 2)) { 
     
     initGanim= !initOnceG && !editMode;
     initOnceG= true; resetEdit( false ); 
    
     tGm.length= 0;
     sortedPl.length= 0;
     
     tPl.sort(function(a, b) { return a[0] - b[0] }); 
     tPl.forEach(function(col) { 
       
         if(col[2] < 1) 
           col[5]= col[6]= col[7]= col[8]= -900 - col[0];
       
       tGm.push([ 'F', +col[0], '-', '-', 0 ]); 
       sortedPl.push( col[1] );     
     });
     
     
   //alert('a1: '+ tHiFull+'\n b1: '+tHi);
     var cnt= 0;
     tHiFull.length= 0;
     tHi.sort(function(a, b) { return b[0] - a[0] }); 
     tHi.forEach(function(col) {

       var miniGm= col[4].split(':');
       
       tHiFull.push([ +col[0], +col[1], +col[2], 
                      +col[3], 
                      sortedPl[ +miniGm[5]-1 ], 
                      (+col[2]*10) - (+col[3]), 
                      sortedPl[ +miniGm[10]-1 ],
                      col[4], cnt++
                    ]);
     });
     
     
/* ONLY IF EMPTY ..later
     fileAction= 4;
     fileJunction(); 
     saveState();
*/
     
}
else
if(!keepMsgBar && useThisDate < 1 && nBar.innerText.length > 1)
       setTimeout( function() { clrNotif(); }, 350);
   
   
   var selRows= $('#ptb')[0].getElementsByClassName('selected');
   
   //tGm.forEach(function(col) {  col[0]= 'F'; });   
   for(var i= 0; i < selRows.length; i++) {
     
      var pid= +(selRows[i].firstChild.innerText) -1; 
     
      //alert("aa: "+ pid + "   bb: "+ tGm[pid][0]);
      if(parseInt(tGm[pid][4], 10) < 1) {
        tGm[pid][4]= 0; 
        tGm[pid][0]= "T"; 
      }
      else 
        tGm[pid][0]= "A";
   }
   
   sortedRnk.length= 0;
   tGm.forEach(function(col) {          
      if(col[0] !== "T" && col[0] !== "A") { 
        
        //alert(col[0])
        
        col[0]= "F"; col[2]= '-'; col[3]= '-'; col[4]= 0; }
      else {
        
        //alert(col[0])
        
        if(!isNaN(col[2]))
          sortedRnk.push([ +col[2], +col[1] ]);
      }
   });
   
   
   // ☆☆☆ this all over the place, sort out later
   $('#appFrame, #tab2') //, #gameTable tr
     .css({"color":"black", "background":"white"});
   
   
   if(lastTab === 2 && curTab !== 2) {

     if(--listMode < 1) listMode= 3;
     
     // pausevthe timer on exit-tab2, why?a
     //if(btState > 0 && btState !== 8) $('#blindTimer').click();   
   }
   else
   if(lastTab !== 2 && curTab === 2)
       if(++listMode > 3) listMode= 1;     
   
   if(curTab === 2) timerPaint((btState === 1), '***');
   
   
   // *** tab switch
   switch(curTab) {     
     case 1: freshTab1(); break;
     case 2: freshTab2(); break;
     case 3: freshTab3(); break;                    
   }
       
   
   if(editMode) {
     if(curTab === 1) resetEdit(true);
     $(".admin").css("display", "table-cell");
   }
   else
     $(".admin").css("display", "none");
   
   if(useThisDate < 1) editRow= -1;
     else nBar.innerText+= 'Game modification in progress' +endNotfChar;
   
  
   if(reInit) gameOver= false;
   if(curTab === 2 && gameOver) mnySplit();   
     
   
   dontInit= keepMsgBar= false;
  
   
   if(lastTab === 2 && ssPend) {
     clearTimeout(clrST); saveState(false); ssPend= false; }
  
   
   lastTab= curTab;
 }     
  
  
  
 function backAnim(rx) {  
      
   var iRnk= +tGm[rx][2];
   var mny= $('.money')[rx];
   
   if(!editMode && useThisDate === 0 && iRnk > curRank+1) {
        
        audQuack.currentTime= 0; audQuack.play();
        return;
   }


   var cx= 0;

   tGm.forEach(
   function(col) {
                  
                  var cr= 0;
                  if(col[2] !== '-') cr= parseInt(col[2], 10);
                  
                  
                  var tm= $('.money')[cx];
                  
                  var rp= '430px';
                  if(cr === 1 || (cr === 2 && iRnk === 1)) {
                    
                     rp= '390px';
                     tm.innerText= '2nd';

                    rx1= 0;
                    if(cr === 2 || (cr === 1 && iRnk > 1)){
                      rx2= cx;
                      //alert('rx2= '+ rx2 + '   cx= '+ cx);
                    }                            
                  }
                  
                  
                  if(cr === 1 || cr === 2) {
                    
                     if(gameOver) {                   
                       gameOver= false;
                       timerPaint(false, 'Click to START');
                     }
                    
                     var wf= $('#gtb>tr')[cx].cells[4];
                    
                     $(wf.firstChild).off(); 
                    
                     wf.innerHTML= "";
                     wf.innerText= '-'; 
                     tGm[cx][3]= '0';                                            
                  }
                
                  
                  if(cr > 0 && cr < iRnk) {
                    
                    audQuack.currentTime= 0; audQuack.play();
                    tm.parentNode.parentNode.cells[3].innerText=  (col[2]= cr+1); 
             
                    if(col[2] === 3) tm.innerText= 'OUT';
                  }
                  cx++;
   });


   curRank++;
 
   audCheng.currentTime= 0; audCheng.play();
   //audClick.currentTime= 0; audClick.play();
   
   mny.innerText= '  $  ';
   mny.parentNode.parentNode.cells[3].innerText= (tGm[rx][2]= '-');
   
   $(mny).css({right:'5px',color:'white',background:'darkgreen'});
   $(mny).css({font:'bold 24px monospace',height:'35px',width:''});
   (vSpace > 10)? $(mny).css({bottom:'17px'}):$(mny).css({bottom:'7px'});
   
 }
    
  
 function outAnim(rx, rc) {
      
     if(rc){ 
       audCheng.currentTime= 0; audCheng.play(); }
     else {
       audQuack.currentTime= 0; audQuack.play();}
   
     var mny= $('.money')[rx];
      
     if(!rc) return;
       
           if(curRank === 2) {
             rx2= rx; mny.innerText= '2nd'; }
           else
           if(curRank === 1) {
             rx1= rx; mny.innerText= '1st'; }
           else
             mny.innerText= 'OUT';
       
           rc.innerText= (tGm[rx][2]= curRank--);
          
           var rp= (tGm[rx][2] === 1 || tGm[rx][2] === 2) ? '380px' : '430px';

           $(mny).css({right:rp, bottom:'12px', width:'50px', height:'25px', 
                  font:'bold 15px monospace', 'text-align':'center', 
                  background:'lightgrey', color:'black'});

           $(mny.previousSibling).innerText= '';
           //$(mny.previousSibling).css({visibility:'hidden'});
   
   
           // *** GAME OVER
           if(curRank === 0)
             mnySplit();
 }
  
  
 // *** GAME TAB TABLEA

 //gmt.onclick= 
 $('#gameTable').click(
 function(e) {
  
   if(!e || e.defaultPrevented) return;  
   e.preventDefault(); 
   e.stopPropagation();
   e.stopImmediatePropagation();
   
   if(e.target.parentNode.rowIndex === 0) {
     // *** header click, sort game table?
     //alert("thead.cellIndex: "+ e.target.cellIndex);  
     return;
   }
   
   clrNotif();

   var lmy= document.getElementsByClassName('money');
   
   ssPend= true;
   clearTimeout(clrST);
   clrST= setTimeout(function() {     
     saveState(false); ssPend= false;
     for(var i= 0; i < lmy.length; i++) {
         $(lmy[i].previousSibling).css({'font-size':'15px'}); } 
   }, 4000);
  
   
   if(e.target.className === "money" || e.target.cellIndex > 5) {
     
     var mny= (e.target.className === "money" ) ? e.target : e.target.firstChild.nextSibling;         
     var rx= mny.parentNode.parentNode.rowIndex -1; 

 
     if(+tGm[rx][2] > 0
        && e.target.className === "money") {
       backAnim(rx);
       return;
     }
     
     audChang.currentTime= 0; audChang.play();
   
     for(var i= 0; i < lmy.length; i++) {
       if(i !== rx) {
         //lmy[i].previousSibling.innerText= '';
         $(lmy[i].previousSibling).css({font:'15px monospace', color:'grey'}); }
     }
     
     var mif= mny.previousSibling;
     var nim= +(mif.innerText.substring(1, mif.innerText.length-1));
     //alert('aaa: '+ $(mif).css('font-size'));
     if($(mif).css('font-size') !== '19px')
       mif.innerText= '+1k';
     else
     if(mif.innerText[0] === '+')
       mif.innerText= '+'+ (nim+1) +'k';
     

     if(listMode !== 3)
       $(mif).css({font:'bold 19px monospace', color:'black'});
     else
       $(mif).css({font:'bold 19px monospace', color:'white'});

     mny.parentNode.previousSibling
       .innerText= fCash(1000* (tGm[rx][4]= +tGm[rx][4] +1));
     
     bankTotal++; 
     document.getElementById('lblBank')
       .innerText= 'Bank: $'+ fCash(bankTotal*1000);
     
   }
   else
   if(e.target.cellIndex < 2) {
     
     var rx= e.target.parentNode.rowIndex-1;
     if(tGm[rx][0] !== 'F') {
       
       audQuack.currentTime= 0; audQuack.play();       
       e.target.parentNode.firstChild.innerText= tGm[rx][0]= 'F';
       $(e.target.parentNode).children()[5].innerText= tGm[rx][4]= 0;
     }
     else {
       $('.money').eq(rx).click(); 
       e.target.parentNode.firstChild.innerText= tGm[rx][0]= 'T'; 
     }
   }
   else
   if(e.target.cellIndex === 2 || e.target.cellIndex === 3) {
     
     var rx= e.target.parentNode.rowIndex-1;
      
     if(+tGm[rx][2] > 0) 
       backAnim(rx);
     else {
       if(e.target.cellIndex === 3)
         outAnim(rx, e.target);
       else
         outAnim(rx, e.target.nextSibling);       
     }
   }
   else
   if(e.target.cellIndex === 5) {
     
         var rx= e.target.parentNode.rowIndex-1;

         if(e.target.innerText === "1,000") {
           audQuack.currentTime= 0; audQuack.play();
           return;       
         }
     
         audCheng.currentTime= 0; audCheng.play();
     
         var mny= e.target.nextSibling.firstChild.nextSibling;
     
     
         for(var i= 0; i < lmy.length; i++) {
           if(i !== rx) {
             //lmy[i].previousSibling.innerText= '';
             $(lmy[i].previousSibling).css({font:'15px monospace', color:'grey'}); }
         }

     
         mny.previousSibling.innerText=  '-'+ (tGm[rx][4] -1) +'k';
     
         if(listMode !== 3)
           $(mny.previousSibling).css({font:'bold 18px monospace', color:'black'});
         else
           $(mny.previousSibling).css({font:'bold 18px monospace', color:'white'});

     
         bankTotal-= tGm[rx][4] -1;
         document.getElementById('lblBank').innerText= 'Bank: $'+ fCash(bankTotal*1000);
         e.target.innerText= fCash(1000* (tGm[rx][4]= 1));
   }
   else {
/*     
    alert("v.02" 
          + "\n this: " + this 
          + "\n this.className: " + this.className 
          + "\n this.style.transform: " + this.style.transform       
          + "\n e.type: " + e.type 
          + "\n e.eventPhase: " + e.eventPhase 
          + "\n e.bubbles: " + e.bubbles 
          + "\n e.defaultPrevented: " + e.defaultPrevented 
          + "\n e.target: " + e.target 
          + "\n e.currentTarget: " + e.currentTarget
          + "\n e.target.parentNode.cellIndex: " + e.target.parentNode.cellIndex 
          + "\n e.target.parentNode.parentNode.rowIndex: " + e.target.parentNode.parentNode.rowIndex);
*/          
   }
   
 });
   
  
 
// tb.onclick= 
 $('#playerTable').click(   
 function(e) {
   
   if(!e || e.defaultPrevented) return;        
   e.preventDefault(); e.stopPropagation();     
   e.stopImmediatePropagation();
     
   
   if(!gameOver && nBar.innerText.length > 1) clrNotif();
   
   
   audClick.currentTime= 0; audClick.play();
   
   var trx= e.target.parentNode.rowIndex;
   
   //alert(e.target.parentNode.rowIndex);
   if(trx === 0) {
     
     if(sortColP === e.target.cellIndex) 
       revSort= !revSort;
     else 
       revSort= false;
     
     sortColP= e.target.cellIndex;
     
     dontInit= true;
     reFresh();
   }
   else {
     
     var pid= parseInt($('#ptb>tr')[trx-1].firstChild.innerText, 10)-1
   
     //alert("row: "+ e.target.parentNode.rowIndex +"  col: "+ e.target.cellIndex);     
     if($(e.target.parentNode).hasClass('selected')) {
       
       if(tGm[pid][0] === 'A' 
          || tGm[pid][0] === 'B') tGm[pid][0]= 'B'; else tGm[pid][0]= 'F';
              
       if(editMode)
         resetEdit(true);
       else
         rowAnim(e.target.parentNode, false);       
     }
     else {
              
     
       if(editMode) resetEdit(false);          
       rowAnim(e.target.parentNode, true);
       
       if(tGm[pid][0] === 'B')
         $(e.target.parentNode).addClass('already'); 
       
       
       if(editMode) {         
         document.getElementById("subBut").value= "Edit";
         
         //$('.initDis').prop("disabled", false);
         
         editRow= e.target.parentNode.rowIndex -1;
         $('input#in0').val( tPl[editRow][0] );
         $('input#in1').val( tPl[editRow][1] );
         $('input#in2').val( tPl[editRow][2] );
         $('input#in3').val( tPl[editRow][3] );
         $('input#in4').val( tPl[editRow][4] );
         $('input#in5').val( tPl[editRow][7] );  
         
         $('input#in1').focus();       
       }        
     }  
   }
 
 });
 
 
 
 
 // *** $('#historyTable') ****************************
 
 // ☆☆☆ subRow-content - REMOVE
 function subrowDelete(etpn) {
   
       if(editMode) $('#dtEdit').val('');

       rowAnim(etpn.previousSibling, false);
       audClick.currentTime= 0; audClick.play();  
     
       if(editMode) { editRow= -1;
         $('.initDis').prop("disabled", true);
       }
     
       etpn.remove();
 }

  
 //hit.onclick= 
 $('#historyTable').click(
 function(e) {

     if(!e || e.defaultPrevented) return; 

     e.stopImmediatePropagation();
     e.preventDefault(); e.stopPropagation();
   

     if(!gameOver && nBar.innerText.length > 1) clrNotif();
   
   
     var etpn= e.target.parentNode;
     if($(etpn).hasClass('already') && !($(etpn).hasClass('selected'))) { return; }
     if($(etpn).hasClass('extra')) { subrowDelete( etpn ); return; }
     if($(etpn.parentNode).hasClass('extra')) { subrowDelete(etpn.parentNode); return; }
     if($(etpn).hasClass('selected')) { subrowDelete(etpn.nextSibling); return; }

     if(etpn.rowIndex === 0) {
       //alert('Header cell: '+ e.target.cellIndex);

       audClick.currentTime= 0; audClick.play();  
       
       if(sortColH === e.target.cellIndex) 
         revSort= !revSort;
       else 
         revSort= false;

       sortColH= e.target.cellIndex;
       if(sortColH > 7) sortColH= 7;
       
       dontInit= true;
       reFresh();
       
       return;     
     }
   
   
// ☆☆☆ subRow-content - CREATE ***********************
   
     var cx, ri= +$(etpn).children()[8].innerText;
   //alert(ri);
  
     var selRows= $('#htb')[0].getElementsByClassName('selected');
     if(editMode) { //        rowAnim($(selRows)[0], false);
       $(selRows).children().eq(3).click();
       $('#dtEdit').val( tHiFull[ri][0] );
     }

     $(etpn).addClass('already');
   
   
// ***                 0     1     2     3     4    5     6     7       8
// *** tPl:           id    name  gms  $buy  $won  $bal  csh%  rnk%  total
// *** tHiFull:       date  np    bnk  $1    1st   $2    2nd   m-tGm  gid
// *** tGm:           isIn  pid   rnk  $won  $buy
   
     var dtCode= tHiFull[ri][0].toString();
     var mon= +dtCode.substring(4,6);
     var dtStr= dtCode.substring(6,8)+" " + monthStr[mon-1] +" "+dtCode.substring(0,4)
              + " @ "+ dtCode.substring(8,10) +":"+ dtCode.substring(10,12);
   
     var scd= ''; //'BANK: $'+ fCash(...                                      ---|
     //    ' 99.|NAME______| 99k| 999,9xx|   +-999.9xx| +-99,9xx|+-99,9xx|+-99.99 \n';
     scd+= ' RANK  NAME     $BUY    $WON     \n' //  $BAL ∑    ± $(#)   ± %($)    ± ∑  \n'
        +  '-----------------------------'
        +  '              '+ dtStr +' \n';
   
    
     var miniGm= tHiFull[ri][7].split(':');
   
     for(var i= 5; i < miniGm.length; i+= 5) {
       
         cx= i/5;
         
         var mnyw= 0;
         if(cx === 1)
           mnyw= +tHiFull[ri][3]; // $:1
         else
         if(cx === 2)
           mnyw= +tHiFull[ri][5]; // $:2 
         else 
         if(cx === 3) scd+= '\n';
       
         var wons= (mnyw === 0) ? '   ' : fCash(+mnyw*100);
       
         var pid= +miniGm[i+0]-1;
         var buy= +miniGm[i+1];
       
         scd+= '  '+ ('  ' + cx).slice(-2) +'.  '
             + (sortedPl[ pid ] +'        ').substring(0, 8)
             + ('    '+ (buy+'k')).slice(-4) 
             + ('         '+ wons).slice(-9) +' \n';

     } //end for
     


     var ctes= 'style="color:white; background:black"';
     if(listMode === 2) ctes= 'style="color:black; background:white"';
       else if(listMode === 3) ctes= 'style="color:black; background:#f0f0f0"';
         else if(editMode && vSpace > 10) ctes= '';
   
     $(etpn).after('<tr tabindex="1" class="extra"'+ ctes +'><td colspan='
                   + (editMode?8:7) +'><pre style="height:'+ (+tHiFull[ri][1] +4)*18 + 'px; padding:5px 10px; '
                   + 'margin:0; text-align:left; font:bold 15px monospace">'+ scd +'</pre></td></tr>'); 



     if(editMode) {
           editRow= etpn.rowIndex -1;
           $('.initDis').prop("disabled", false);
     }
       
     $(etpn.nextSibling).focus();
   
     rowAnim(etpn, true);   
     audClick.currentTime= 0; audClick.play();  
 });

  
  
  
  
  
 var endNotfChar= '. #'; 
 
 // *** import... ************************************************************
 function importDB(data) {
   
   initOnceG= false;

// *** 1st part - players data
                          
     var gmHistory= data[1];
     data= data[0].split('|'); 
         
     if(!data) { nBar.innerText+=
              'No cache data X' +endNotfChar; return; }
                          
     var nCol= 6;              
     tPl.length = 0;
     for (var i = 0; i < data.length / nCol; i++) {
       
       var nbrs= [ parseInt(data[i*nCol +0], 10), 0, parseInt(data[i*nCol +2], 10), parseInt(data[i*nCol +3], 10), 
                         parseInt(data[i*nCol +4], 10), parseInt(data[i*nCol +5], 10) ];
       
       var bal= nbrs[4] - nbrs[3]*10;
       var col6= c6Avg(nbrs[3], nbrs[2]);
       var col7= c7Avg(nbrs[4], nbrs[2]);     
       var totl= col6 + col7;
       
   // ***  id  name  gms  $buy  $won  rnk%    
   // ***  id  name  gms  $buy  $won  $bal  csh%  rnk%  total  
       if(parseInt(data[i*nCol +0], 10) > 0) {
         
         if(nbrs[2] === 0) 
           bal= col6= col7= totl= -900 -nbrs[0];
         
         tPl.push( [ +data[i*nCol +0], data[i*nCol +1], nbrs[2], 
                     nbrs[3], nbrs[4], bal, col6, col7, totl ] );         
       }
       
     }
         
                 
// *** 2nd part - games history data
  
     if(!gmHistory) { nBar.innerText+=
              'No cache data Y' +endNotfChar; return; }
                          
     nCol= 5;
     data= gmHistory.split('|');
                          
     tHi.length= 0;
     for (var i = 0; i < data.length / nCol; i++) {
          if(+data[i*nCol +2] > 0)
            tHi.push([ +data[i*nCol +0], +data[i*nCol +1],
                       +data[i*nCol +2], +data[i*nCol +3],
                       data[i*nCol +4] ]); 
     }
  
//     alert("0: "+ tPl.length +"\ntPl: "+ tPl);

     reFresh();
     loadState(true);
 } 
  
  
 function cchInfo() {
   
   adminInfo.innerText+= "Cache info.v8 ---  \n";
   
   if(navigator.serviceWorker) 
     adminInfo.innerText+= "ServiceWorker in navigator, OK! \n";
   else
     adminInfo.innerText+= "No serviceWorker in navigator, FAIL! \n";   
       
   if(navigator.storage) {
  
    if(navigator.storage.persist) {
      
       navigator.storage.persisted().then(
       function(getP) { 
          adminInfo.innerText+= "Persistence: "+ getP +'\n';                          
       }); 
    }
    else
      adminInfo.innerText+= "No persist in navigator.storage! \n"; 
   
    if(navigator.storage.estimate) {
/*      not suported in a way to break the code, why?
       navigator.storage.estimate()
       .then(({usage, quota}) => {                                    
          adminInfo.innerText+= "Usage: "+ (usage/1048576)
               .toFixed(2) +"MB out of "+ (quota/1048576).toFixed(2) +"MB. \n";                                      
       }); 
*/       
     }
     else
       adminInfo.innerText+= "No estimate in navigator.storage! \n";       
   }
   else 
     adminInfo.innerText+= "No storage in navigator! \n"; 
   
   
   if(caches) {   
          
     caches.keys().then(
     function(cacheNames) { cacheNames.forEach(
       function(cacheName) { caches.open(cacheName).then(
         function(cache) { return cache.keys() }).then(
         function(reqs) { 
          
           var strOut= "Cache data files: \n";
           reqs.forEach(
             function(rs, i) {
                 strOut+= '            '+ ('   '+ (i+1)).slice(-3) +':: '
                   + (rs.url).substr(0+ (rs.url).lastIndexOf('/')) +"\n";
             });
           
           adminInfo.innerText+= "Cache name: "+ cacheName +" \n"+ strOut +'\n'; 
           strOut= "";
         });
       });
     });
   }
   else
     adminInfo.innerText+= "No caches in window! \n";                   
 }
  
     
 function loadCache(isImport) {      
   
     nBar.innerText= ''; clrNotif();
   
     caches.open('pmpAppCache').then(
     function(cch) { cch.match('db').then(
       function(mres) { return mres.text() }).then(
       function(dbData) {
         
           if(!dbData) { nBar.innerText+=
             'No cache data A' +endNotfChar; return; }

           if(isImport) { importDB(dbData.split('@'));
             adminInfo.innerText+=  '::import@loadCache \n'; }
           else
             adminInfo.innerText+=  '::show@loadCache \n';

            dbData= dbData.split('@');
            var gmHistory= dbData[1];
           
            dbData= dbData[0];
           
            if(!dbData) { nBar.innerText+=
              'No cache data B' +endNotfChar; return; }           
           
            dbData= dbData.split('|');           
            adminInfo.innerText+= '[tPl @Ex]: 1         2      3       4        5  \n'
                               + '     id  name       gms   $buy    $won     rnk% \n'
                               + '----------------------------------------------- \n';
 
            var nCol= 6;
            for (var i = 0; i < dbData.length / nCol; i++) {
              
              adminInfo
                .innerText+= '    '+ ('   '+ dbData[i*nCol +0]).slice(-3) +'  '
                         + (dbData[i*nCol +1] +'           ').substring(0, 9)
                         + ('     '+ dbData[i*nCol +2]).slice(-5)
                         + ('       '+ dbData[i*nCol +3]).slice(-7)
                         + ('        '+ dbData[i*nCol +4]).slice(-8)
                         + ('        '+ dbData[i*nCol +5]).slice(-8) +' \n';
           
            } 
  
           
           
// *** 2nd part - games history data
           
           adminInfo
             .innerText+= '\n'
             + '[tHi @Ex]: 0       1      2      3      v-1st       v-2nd \n'
             + '         date     #nP   $bnk   $1st  | id : $buy : id... \n'
             + '--------------------------------------------------------------------- \n'
           
            if(!gmHistory) { nBar.innerText+=
              'No cache data C' +endNotfChar; return; }
           
            nCol= 5;
            dbData= gmHistory.split('|');
            for(var i= 0; i < dbData.length / nCol; i++) {
              
              adminInfo
                .innerText+= ('               '+ dbData[i*nCol +0]).slice(-15) +'  '
                         + ('    '+ dbData[i*nCol +1]).slice(-4)
                         + ('       '+ dbData[i*nCol +2]).slice(-7)
                         + ('       '+ dbData[i*nCol +3]).slice(-7) +'  | '
                         + dbData[i*nCol +4] +' \n';
            }

         adminInfo.innerText+= '\n';
         if(!isImport) cchInfo();
         
         
       }).catch(function(err) {
           nBar.innerText+= 'Load cache failure: '+ err.message +endNotfChar; });                   
     });
 }
  
 var timePerf, fileAction= 0;
 function fileJunction() {       
       
   var upData= "0|export-init|0|0|0|0";
   var upHistory= "@12345678|2|0|0|0:0:0:0:0:1:1:1:1:1:2:2:2:2:2";
   
   if(fileAction > 2) {
     
       // ***  id  name  gms  $buy  $won  rnk%    
       // ***  id  name  gms  $buy  $won  $bal  csh%  rnk%  total
       tPl.forEach(function(col) { 
         upData+= '|'+ col[0] +'|'+ col[1] +'|'+ col[2] +'|'+ col[3] +'|'+ col[4] +'|'+ '#';
       });
     /*                 0       1      2      3      v-1st       v-2nd     
             tHi:     date     #nP   $bnk   $1st  | id : $buy : id... 
     // *** tHiFull:  date     #np    bnk    $1    1st   $2    2nd  |  m-tGm |  gid
                        0       1      2      3     4     5     6      7         8  */
       tHi.forEach(function(col) {
         upHistory+= '|'+ col[0] +'|'+ col[1] +'|'+ col[2] +'|'+ col[3] +'|'+ col[4]; });

       upData+= upHistory;
     
       adminInfo.innerText+= ':;fileAction('+ fileAction
         +') @fileJunction \n'+ 'tPl= '+ tPl +'\n'+ 'tHi= '+ tHi +'\n';
   }
   else
     adminInfo.innerText+= '::fileAction('+ fileAction + ') @fileJunction \n';
   
   
   timePerf= performance.now();
   
   // *** joo, joo, joo, joonctni me you junction...
   switch(fileAction) {

       case 0: alert('err:fa0'); break;

       case 1: // *** SERVER LOAD

         tHi.length= 0;
         tHiFull.length= 0;
         $.ajax({
           url: dbUrl + "git/blobs/" + filesha,
           type: 'GET', //dataType: 'json',    
           beforeSend: function(xhr) { 
             xhr.setRequestHeader("Authorization", "Basic " + btoa("pokerica" + ":" + dbPass)); 
           },
           error: 
           function(err, bb, cc) { 
             //alert("Server load failure: "
                   //+ err.status +" "+ err.statusText + "\n..loading from cache!"); 
             adminInfo.innerText+= "Server load failure: "
               + err.status +" "+ err.statusText + " ..loading from cache.\n";

             loadCache(true);
             $("#mtb4").click();
             return;
           }
         }).done(function(response, st, x) {
         //  alert("got this: " + response.?data?.content);
           
           var resCon= (response.content).replace(/\n|\r/g, "");
           
           importDB(atob(resCon).split('@'));
           
           timePerf= performance.now() - timePerf;
           adminInfo.innerText+= "[*] load & import \n";
           adminInfo.innerText+= x.getAllResponseHeaders() +'\n'
             +"Done, time: "+ (timePerf/1000).toFixed(2) +" seconds.< \n";

           nBar.innerText+= "Server load success: "
                         + (timePerf/1000).toFixed(2) +' seconds'+ endNotfChar;
         
           
// *** SAVE TO CACHE ---- put in importDB??
           //setTimeout( function() { fileAction= 4; fileJunction(); }, 2500);
         });       
    
       break;


       case 2: // *** CACHE LOAD
       break;


       case 3: // *** SERVER SAVE
         var filedata = '{"message":"'+ "update" +'","content":"'+ btoa(upData) 
                          +'", "branch":"'+ "data" +'", "sha":"' + filesha + '"}'; 
         $.ajax({
           url: dbUrl + "contents/db.txt", 
           type: 'PUT',
           data: filedata,            
           beforeSend: function(xhr) {
             //xhr.setRequestHeader("Authorization", "token 1fa49d9ba6xxxxxxxx462b3e9d690073c99");
             xhr.setRequestHeader("Authorization", "Basic " + btoa("pokerica" + ":" + dbPass)); 
           }, error: function(err) { 
                //alert("Server save: \n"+ err.status +" "+ err.statusText) 
                nBar.innerText+= "Server save failure: "+ err.status +" "+ err.statusText+ endNotfChar;
           }    
         }).done(function(response, st, x) {

             timePerf= performance.now() - timePerf;   
             adminInfo.innerText+= "[*] export & save \n";               
             adminInfo.innerText+= x.getAllResponseHeaders() +'\n';
               + "Done, time: "+ (timePerf/1000).toFixed(2) +" seconds.< \n";

             filesha= response.content.sha;
             nBar.innerText+= "Server save success: "
                           + (timePerf/1000).toFixed(2) +' seconds'+ endNotfChar;
         });       
//  *** NO BREAK so it falls thru and does the cache save too
//       break;

       case 4: // *** CACHE SAVE                        
         caches.open('pmpAppCache').then(          
         function(cch) {

           cch.delete('db', {ignoreSearch:true}).then(
           function(res) {

             cch.put('db', new Response(upData, {"status":200}));
             
             //alert("Saved to cache: \n!"+ upData); // (del: "+ res +")");
             nBar.innerText+= "Cache save success"+ endNotfChar;
             adminInfo.innerText+= "Cache save success, data: \n"+ upData +'\n';
           });     
         }).catch(function(err) { 
              nBar.innerText+= "Cache save failure: "+ err.message+ endNotfChar; });
       break;
   }
   
   fileAction= 0;
 }
  
  
 var xrlL= 0, xrlR= 0; 
 function getSha() {
   
    var xhr= new XMLHttpRequest();
    var url= dbUrl + "git/trees/data";

    var loginYet= isLogged;
    if(dbPass.length < 3) dbPass= "";
   
    xhr.open('GET', url, true); //true: async
    xhr.onloadend = function() {            
      var str= xhr.responseText;
      var pos1 = str.indexOf('db.txt');
      pos1 = str.indexOf('"sha": "', pos1);
      var pos2 = str.indexOf('",', pos1);
      
      filesha= str.substring(pos1 + 8, pos2);    
  
      xrlL= parseInt(xhr.getResponseHeader("X-RateLimit-Limit"), 10);
      xrlR= parseInt(xhr.getResponseHeader("X-RateLimit-Remaining"), 10);
      
      isLogged= (!isNaN(xrlL) && xrlL > 99);
      if(isLogged) $('#mnu1').css('display', 'block'); 
      
      adminInfo.innerText= versionCode + ">logged-in: "+ isLogged +"\n";
    
      if(!loginYet && isLogged) {
        nBar.innerText= 'Log-in success'+ endNotfChar;        
        adminInfo.innerText+= '[*] getShA-done: '+ filesha + "\n";        
        adminInfo.innerText+= (xhr.getAllResponseHeaders()).toString() +"\n";
        
        $('#lgBut').css({background:'none', 'box-shadow':'none'});
        $('#lgBut').val("Logged In"); $('#pasIn').css({display:'none'});
        return;
      }
      
      if(fileAction === 1) fileJunction();
        else adminInfo.innerText+= xhr.responseText +"\n";
      
      nBar.innerText+= 'SHA p/h: '+ xrlR+ ' out of '+ xrlL +endNotfChar;
    }
    
    xhr.onerror = function() { 
      //alert('Getting file SHA, COARS error!') 
      nBar.innerText+= 'Getting file SHA, COARS error'+ endNotfChar;
    }
    
    xhr.setRequestHeader("Authorization", "Basic " + btoa("pokerica" + ":" + dbPass)); 
    xhr.withCredentials = false;
   
    // *** catch timeout event & just load from cache... working?
    xhr.ontimeout = function (e) {    
       nBar.innerText+= "Cannot get SHA, loading from cache!"+ endNotfChar;
       loadCache(true);     
    };

    xhr.timeout= 5900;   
    xhr.send();
 }
  
  
 function loadDB() {
   
   adminInfo.innerText= "";
   nBar.innerText= ''; clrNotif();
   
   if(navigator.storage) { 
     navigator.storage.persisted().then(
         function(getP) {
             if(getP) { $('#gpc4But').val("Persistance Granted");
               $('#gpc4But').css({background:'none', color:'black', 'box-shadow':'none'}); }
         });
   }
   
   if(!navigator.onLine) {       
       //alert("Server unavailable, loading from cache!");       
       nBar.innerTex+= "Server unavailable, loading from cache"+ endNotfChar;
       
       loadCache(true);
       return;
   }
   
   
   fileAction= 1;
   if(filesha === "#") 
      getSha();
   else
     fileJunction();
 }
  
 function saveDB() { 
   
   initOnceG= false;
   
   adminInfo.innerText= "";   
   nBar.innerText= "" ; clrNotif();  
   
   fileAction= 3;
   if(!navigator.onLine) { fileAction= 4;
     nBar.innerText+= "Server unavailable, saving to cache only"+ endNotfChar; }
   else
   if(!isLogged) { fileAction= 4;
     nBar.innerText+= "You must be logged-in to update server database"+ endNotfChar; }
     
   fileJunction();
 }
 
  
    
// *** action starts here *********************************
 loadDB();
  
  
  
  
 function initBuyin(plNo) {
   
   gamePlayers++;
   
   if(plNo < 0) {
     plNo= -(plNo +100);
     
     //audQuack.currentTime= 0; audQuack.play();
     
     bankTotal+= tGm[plNo][4];
     document.getElementById('lblBank').innerText= 'Bank: $'+ fCash(bankTotal*1000);
     
   }
   else 
     $('.money').eq(plNo).click();
   
    tGm[plNo][0]= 'r';
 }
  
  
 $("#headbar").click( 
 function() {
   //alert(339)
   nBar.innerText= lastNotif;
 });
  
  
 // *** tab buttons listener ******************************** 
 var initOnceA= false;
 $(".mtb").click(
 function(e) {
   e.stopPropagation();

   if(!initOnceA) { initOnceA= true;
          
     // *** .load() no effect?? ..in reFresh(), so...
     // move to event listener & init audio upon actual user input event
     audQuack.load(); audCheng.load(); audClick.load(); audChang.load();
   } 
   
     $(".mtb").removeClass("act dea").addClass("dea");
     $(this).removeClass("dea").addClass("act");
     
     $(".ptab").removeClass("pac pde").addClass("pde");   
     var tid= "#tab"+ (this.id).substring(3,4);      
     $(tid).removeClass("pde").addClass("pac");
   
   
     curTab= 0;
     if(editMode) { editMode= false;
       $('.adminEdit').css('display', 'none'); }
   
  
     audClick.currentTime= 0; audClick.play();

     if(tid === "#tab2") { 
       
       curTab= 2;
       
       reInit= true;
         reFresh();
       reInit= false;
       
       gamePlayers= 0;
       sortedRnk.sort(function(a, b) { return b[0] - a[0] }); 
       
       
       var dt = new Date();
       document.getElementById("lblDate")
         .innerText= (useThisDate) ? useThisDate: dt.toDateString();
       
       curRank= 0; bankTotal= 0;
       document.getElementById('lblBank').innerText= 'Bank: $'+ fCash(bankTotal*1000);
      

       for(var i= 0; i < tGm.length; i++) {
           if(tGm[i][0] === "T") { curRank++; initBuyin(i); }
           if(tGm[i][0] === "A") { curRank++; initBuyin(-(i+100)); }
       }
       
    //   for(var i= 0; i < tGm.length; i++) {                    
    //       if(tGm[i][0] === "T") { curRank++; initBuyin(i); } }
       
       for(var i= 0; i < sortedRnk.length; i++) {
      
         var trx= +sortedRnk[i][1] -1;
         var rf= $('#gtb>tr')[trx].cells[3];
         
         outAnim(trx, rf);         
       }
       
       return;       
     } // *** end tab-2
   
      
     if(tid === "#tab1") { 
       sortColP= 4; revSort= false; curTab= 1; }
     else   
     if(tid === "#tab3") {
      sortColH= 0; revSort= false; curTab= 3; }
     else
     if(tid === "#tab4") { curTab= 4; }
   
     reFresh();   
 });

  
 var tsAdmin= 1000;  
 function minuteUp() {
   
   if(btState !== 1) return;
   
   // *** bigger step to save battery, update every 5sec? 
   if(--btSec <= 0) {
     btSec= 60;
     btMin--;
     ttMin++;     
   }
   
   if(editMode) {
     
     if((curTab === 2 && listMode === 3)
        || (curTab !== 2 && listMode === 2)) { btSec= 60; ttMin++; btMin--; }
     else
     if((curTab === 2 && listMode === 1)
        || (curTab !== 2 && listMode === 3)){ btSec= 60; if(ttMin > 0)ttMin--; btMin--; }

   }
   
   
   if(btMin < 0) {
     
     //btMin= 0;
     var cn= 1+ parseInt($('#blindSelect').val(), 10);
     if(cn > 15) cn= 15; $('#blindSelect').val(cn);
             
     
     btState= 2;
     $('#blindTimer').click();
   }
   else
     setTimeout( minuteUp, editMode ? tsAdmin:1000); 
   
   timerPaint(true, 'Click to PAUSE');
 }
  
 function bkgSiren() {
   
   if(sirenState === 0) return;
   
   audQuack.currentTime= 0;
   audQuack.play();   
  
   timerPaint(true, '!!!');
   
   setTimeout(bkgSiren, 700);  
   sirenState= (sirenState === 1) ? 2 : 1;
 }
  
  
 function btInit() {    
   var ni= ($('#timeSelect :selected').text()).indexOf('min'); 
   var ts= ($('#timeSelect :selected').text()).substring(0, ni);
       
   btSec= 60;
   btMin= parseInt(ts, 10) -1;    
 }
  
  
 $('#blindTimer').click(
 function(e) {
      
   audClick.currentTime= 0;
   audClick.play();
   
   if(gameOver) { finalSave(); return; }
         
   
   if(btState === 0)      
     btState= 1;
   else
   if(btState === 1)      
     btState= 0;

   
   switch(btState) {
     case 0:
     case 9:
       
       if(btState === 9) {
         
         btState= 0;
         sirenState= 0;
         
         rotStrT= "rotate3d(1, 0, 0, -"; 
         $('#blindTimer').css({"transition":"transform 0.2s ease-out",//ease-out linear
                               "transform-style":"preserve-3d", "transform":rotStrT +"90deg)"});
       
         if($('#wlBut').val() === "WL enabled")
           document.body.style.backgroundColor = "#333333";
         else
           document.body.style.backgroundColor = "#777777";
         
         btInit();
       }
       else
         timerPaint(false, 'Click to START');       
       
       break;
       
     case 8:
     case 1:
       
       if(btState === 8) { 
         btState= 1; btInit(); }
      
       (listMode === 2) ? tsAdmin= 90 : tsAdmin= 700;
       
       timerPaint(true, 'Click to PAUSE');
       setTimeout( minuteUp, editMode ? tsAdmin:1000);      
       break;
       
     case 2:
       
       btState= 9; 
       sirenState= 1;
       
       if(curTab === 2) {
         
         rotStrT= "rotate3d(1, 0, 0, "; 
         $('#blindTimer').css({"transition":"transform 0.2s ease-in",//ease-out linear
                               "transform-style":"preserve-3d", "transform":rotStrT +"90deg)"}); 
       }
       else {

         lastTab= curTab= 2;
         
         if(++listMode > 3) listMode= 1;
         
         // ☆☆☆ this all over the place, sort out later
         $('#appFrame, #tab2') //, #gameTable tr
           .css({"color":"black", "background":"white"});


         $('#timeSelect, #blindSelect')
           .css({filter:'', color:'black', 'background-color':'white'});  
         $('#lblBank, #timeSelect, #blindSelect').css({'border-color':'black'});

         switch(listMode) {

            case 1: // empty, default defined in .css
              break;
            case 2: $('#gtb>tr').css("border-top", "1px solid lightgrey");
              break;      
            case 3: $('#lblBank').css({'border-color':'white'});
                    $('#gtb>tr').css("border-top", "1px solid grey");
                    $('#timeSelect, #blindSelect').css({"filter":"invert(100%)"});
                    $('#appFrame, #tab2').css({"color":"white", "background":"black"});
              break;
         }
         
         $(".mtb").removeClass("act dea").addClass("dea");
         $('#mtb2').removeClass("dea").addClass("act");

         $(".ptab").removeClass("pac pde").addClass("pde"); 
         $('#tab2').removeClass("pde").addClass("pac");
       }
       
       setTimeout(bkgSiren, 950);
       break;
   }
 });
  
 $('#timeSelect').on('focus change',
 function() {
   
   if(btState !== 0) return;
   
   /* var ni= ($('#timeSelect :selected').text()).indexOf('min'); 
   var ts= ($('#timeSelect :selected').text()).substring(0, ni); */
   
   var ni= (this.options[this.selectedIndex].text).indexOf('min'); 
   var ts= (this.options[this.selectedIndex].text).substring(0, ni);
   
   btSec= 60;
   btMin= parseInt(ts, 10) -1;
   
   timerPaint(false, 'Click to START');            
 });
  
  
  
  
// *** BUTTONS #######################################################
// *** ...............................................................
  
 $(".ord, .ord2, .mnu").click(
 function() { // async? 
     audClick.currentTime= 0;
     audClick.play();
 });
  
 $("#mnu1").click(
 function(e) {
   e.stopPropagation();
   
   if(useThisDate > 0) 
     alert('Game modification in progress, save the game first!')
   
   
   revSort= false;
   if(editMode= !editMode) {
     if(curTab === 1) sortColP= 0;
       else if(curTab === 3) sortColH= 7;
     
     $('.adminEdit').css('display', 'block'); }
   else {
     //initOnceG= false;
     if(curTab === 1) sortColP= 4;
       else if(curTab === 3) sortColH= 0;
     
     $('.adminEdit').css('display', 'none');
   }
   
   reFresh();
 });
  
 $("#mnu2").click(
 function(e) {
   e.stopPropagation();
   
   if(vSpace > 10) vSpace= 10;
     else vSpace= 20;
   
   dontInit= true;
   reFresh();
});
   
 $("#mnu3").click(
 function(e) {
   e.stopPropagation();
   
   if(++listMode > 3) listMode= 1;
   
   dontInit= true;
   reFresh();
 });
  
  
  
  
// *** INPUT TEXT FIELD ...............................

 $(".finf").on('focus', 
 function(e) { 
   
   //this.select();    
   e.preventDefault(); 
   e.stopPropagation();
   // *** firefox no like:  e.stopImmediatePropagation();
   
   this.select();
 });
  
  
 $(".finf").on('keydown',  
 function(e) {
   
     if(!e || !e.which || e.defaultPrevented) return;
   
     if(e.which === 9 || e.which === 13) {
       
       e.preventDefault();
       
       
       if(this.id === "dtEdit")
         $("#rdt3But").focus().click();
       else
       if(this.id === "pasIn")
         $("#log4But").focus().click();
       else
       if(this.id !== "in4") 
         $(this).next("input").focus();
       else 
         $('#frmInput').submit();
       
       //$(this).blur();
     }
   
     e.stopPropagation();   
     e.stopImmediatePropagation();
 });
    
  
 $("#frmInput").submit(
 function(e) {
     e.preventDefault();
     e.stopPropagation();
     e.stopImmediatePropagation();
   
     if(editRow >= 0)        
       tPl.splice(editRow, 1); //delete, then add normaly = edit
        
     var col0 = $('input#in0').val();
     var col1 = $('input#in1').val();
     var col2 = +$('input#in2').val();
     var col3 = +$('input#in3').val();
     var col4 = +$('input#in4').val();
     var col5 = +$('input#in5').val();
   
// ***  id  name  gms  $buy  $won  rnk%    
// ***  id  name  gms  $buy  $won  $bal  csh%  rnk%  total
     var bal= col4 - col3*10;
     var col6= c6Avg(col3, col2);
     var col7= c7Avg(col4, col2);
     var totl= col6 + col6;
   

     if(col2 < 1) 
       bal= col6= col7= totl= -900 -col0;
       
     tPl.push([ col0, col1, col2, col3, col4, bal, col6, col7, totl ]);
   
     reFresh();
 });
  
  
  
// *** TAB 1 : ADMIN BUTTONS ***************************************
// *** -------------------------------------------------------------
  
// *** tab1-class="ord2" : DARK BOTTOM BUTTON
/*
        <button class="ord2" id="raz1But">Reset All to Zero</button>
        <button class="ord2" id="rli1But">Remove Last ID</button>
        <button class="ord2" id="rma1But">Remove All</button>
        <button class="ord2" id="ssv1But">Server Save</button>
*/
  
 $("#raz1But").click( //>Reset All to Zero<
 function() {
   // *** reset to zero  
   tPl.forEach(function(col) {
     col[2]= col[3]= col[4]= col[5]= col[6]= col[7]= col[8]= 0; });
   
   tHi.length= 0;
   reFresh();
 });
  
// *** To be, or no delete (for tPl at least)...
// instead, just set inactive by #nG= -1, hmm?
// ... can delete last ID safely, sort of
$('#rli1But').click( //>Remove Last ID<
 function() { tPl.splice(nextID-1, 1); reFresh(); });
   
$("#rma1But").click(//>Remove All<
   function() { tPl.length= 0; reFresh(); });
  
$("#ssv1But").click( //>Server Save<
   function() { saveDB(); });
  
  
// *** TAB 2 : ADMIN BUTTONS ***************************************
// *** -------------------------------------------------------------
 $("#rng2But").click( //>Create Random Game<
 function() {
   
   if(tGm.length < 4) {    
     nBar.innerText= 'There needs to be at least 4 players registered'+ endNotfChar;
     return;
   }   
   
   fastInit= 50;
   gameOver= false;
   
   var unq, plst= [ 1, 2, 3 ];
   var npx= Math.min(5,tGm.length-3);
   var nP= 4+ Math.floor( Math.random()*npx );
   
   plst.length= 0;     
   for(var i= 0; i < nP; i++) { unq= false;     
     while(!unq) { unq= true;
       npx= Math.floor( Math.random()*tGm.length );
       plst.forEach(function(id) { if(npx === +id) unq= false; }); }
     
     plst.push([ npx ]);
   }
  
   npx= 0; resetEdit(false);
   plst.forEach(function(id) { 
     
     tGm[+id][0]= "A";     
     tGm[+id][2]= npx++;
     
     $('#ptb>tr').eq(rvsPLindex[(+id)+1]).addClass('selected');
     
     if(+id < 4)
       tGm[+id][4]= 2+ Math.floor( Math.random()*8 );
     else
     if(+id < 8)
       tGm[+id][4]= 1+ Math.floor( Math.random()*5 );
     else
       tGm[+id][4]= 1+ Math.floor( Math.random()*3 );
   });
      
   $('#mtb2').click();
 });
  
  
// *** mini-Gm:        pid  buy   ∑nG  ∑buy  ∑won
//                      0    1     2     3     4    5     6      7     8
// *** tHiFull:       date  #nP   bnk    $1   1st   $2   2nd   m-tGm  gid
// *** tGm:           isIn  pid   rnk  $won  $buy
// *** tPl:            pid  name  #nG  $buy  $won  $bal  csh%  rnk%  total    
function delHrow() {
  
//Need this?, having rvsPLindex??
   tPl.sort(function(a, b) { return a[0] - b[0] });
  
   disMini.length= 0;
   var miniGm= (tHiFull[editRow][7]).split(':');
   
   var id, cx;
   for(var i= 5; i < miniGm.length; i+= 5) {
     
     cx= i/5;
     id= +miniGm[i +0] - 1;
     
     tPl[id][2]-= 1; if(tPl[id][2] < 0) { tPl[id][2]= 0; alert('err:mod2'); } //nG
     
     if(tPl[id][2] === 0) {
       tPl[id][2]= tPl[id][3]= tPl[id][4]= tPl[id][5]= tPl[id][6]= tPl[id][7]= tPl[id][8]= 0; }
     else {
       
         var won= 0;
         if(cx === 1) won= +tHiFull[editRow][3];
         if(cx === 2) won= +tHiFull[editRow][5];

         var buy= +miniGm[i +1]; //buy

       
         tPl[id][3]-= buy; if(tPl[id][3] < 0) { tPl[id][3]= 0; alert('err:mod3'); } //buy;
         tPl[id][4]-= won; if(tPl[id][4] < 0) { tPl[id][4]= 0; alert('err:mod4'); }  //won

         tPl[id][5]= tPl[id][4] - tPl[id][3]*10; //bal
       
         tPl[id][6]= c6Avg(tPl[id][3], tPl[id][2]);
         tPl[id][7]= c7Avg(tPl[id][4], tPl[id][2]);
         tPl[id][8]= tPl[id][6] + tPl[id][7]; //totl
     }
     disMini.push([ miniGm[i +2], miniGm[i +3], miniGm[i +4] ]);
   }
   
   // *** delete
   tHi.splice(+tHiFull[editRow][8], 1);
} 
  
// *** TAB 3 : ADMIN BUTTONS ***************************************
// *** -------------------------------------------------------------
 $("#rdt3But").click( //>Re-Date<
 function() {
   tHi[ (+tHiFull[editRow][8]) ][0]= tHiFull[editRow][0]=
     $('#htb>tr')[editRow].cells[0].innerText= +$('input#dtEdit').val();
 });
  
// *** modify game: so, after all...
// recorded game stats must not be based on current player stats...
// but, what about balance graph which needs absolute values?
// solution A.: 
// record current player stats: nG-sofar, buy-sofar, won-sofar:
//                0    1    2     3     4 
// *** mini-Gm:  pid  buy  ∑nG  ∑buy  ∑won   
 $("#mdf3But").click( //>Modify<
 function() {
   
   if(editRow < 0) {
     alert("Row #: "+ editRow +"...Something's wrong!");
     return;
   }
   
   fastInit= 50;
   gameOver= false;
   var miniGm= (tHiFull[editRow][7]).split(':');
   
   var won, id, cx;
   for(var i= 5; i < miniGm.length; i+= 5) {
     
     won= 0; cx= i/5; id= +miniGm[i +0] - 1;
     if(cx === 1) won= +tHiFull[editRow][3];
     if(cx === 2) won= +tHiFull[editRow][5];
     
     tGm[id][0]= "A"; //isIn
     tGm[id][1]= id+1; //pid
     tGm[id][2]= cx; //rnk
     tGm[id][3]= won;//won
     tGm[id][4]= +miniGm[i +1]; //buy
     
     $('#ptb>tr').eq(rvsPLindex[id+1]).addClass('selected');
   }
   
   useThisDate= +tHiFull[editRow][0];
   delHrow(); editRow= +tHiFull[editRow][8];
   
   $('#mtb2').click();
 });

 $('#rmr3But').click( //>Remove<
 function() {
   
   if(editRow < 0) {
     alert("Row #: "+ editRow +"...Something's wrong!");
     return;
   }
   
   delHrow();
   reFresh();   
 });
 
  
// *** tab3 - class="ord2" : DARK BOTTOM BUTTON
 $("#rcl3But").click( //>Recalculate All<
 function() { 
   // *** recalculate all... for some resson?
 });
  
 $("#rma3But").click( //>Remove All<
 function() {  
     tHi.length= 0; reFresh(); });
  
 $("#ssv3But").click( //>Server Save<
   function() { saveDB(); } );
  
  
// *** TAB 4 : ADMIN BUTTONS ***************************************
// *** -------------------------------------------------------------
 $("#log4But").click( //>Log In<
 function() {  
   if(isLogged) return;   
   dbPass= $('input#pasIn').val(); getSha();   
 }); 
   
 $("#mfx4But").click( //>Mute Audio FX<
 function() {
   
   muteAudio= !muteAudio;
   
   if(muteAudio) { this.value= "Audio FX Muted";
     audCheng.muted= audClick.muted= audChang.muted= true; }
   else { this.value= "Mute Audio FX";
     audCheng.muted= audClick.muted= audChang.muted= false; }
 });
  
  
// *** class="ord2" : DARK BOTTOM BUTTON
 $("#gms4But").click( function() { // >Game State<
   adminInfo.innerText= ""; loadState(false); });  
 $("#aps4But").click( function() { // >Apply State<
   adminInfo.innerText= ""; loadState(true); });
 $("#kps4But").click( function() { // >Keep State<
   adminInfo.innerText= ""; saveState(false); });
 $("#ems4But").click( function() { // >Empty State<
   adminInfo.innerText= ""; saveState(true); });   

 $("#cad4But").click( function() { // >Cache Data<
   adminInfo.innerText= ""; loadCache(false); });  
 $("#imc4But").click( function() { // >Import Cache<
   adminInfo.innerText= ""; loadCache(true); });
 $("#stc4But").click( function() { // >Store Cache<
   adminInfo.innerText= ""; fileAction= 4; fileJunction(); });
  
 $("#gpc4But").click( //>Grant Persistance<
 function() {
/*
     navigator.webkitPersistentStorage.requestQuota (
       (1024*1024), function(grantedBytes) {  
         //window.requestFileSystem(PERSISTENT, grantedBytes, onInitFs, errorHandler);
         alert("Granted persistent storage: "+ (grantedBytes/1000000).toFixed(2)+"MB");
       }, 
       function(err) { alert(err); });
*/   
     adminInfo.innerText= "";
   
     if(navigator.storage) {
     
       if(!navigator.storage.persist) {                
         adminInfo.innerText+= "No persist in navigator.storage! \n";  
         return;
       }
       
       navigator.storage.persisted().then(
       function(getP) {
         
         if(getP) 
           adminInfo.innerText+= "Storage persistence already granted! \n";
         else {
           
           navigator.storage.persist().then(
           function(setP) {
             if(setP) {
               adminInfo.innerText+= "Storage persistence is now granted! \n";
               $('#gpc4But').val("Persistance Granted");
               $('#gpc4But').css({background:'none', color:'black', 'box-shadow':'none'});
             }
             else {                  
               adminInfo.innerText+= "Storage persistence denied, \n"
                                   + "try again after enabing notifications! \n";
               
               if(!Notification)
                 adminInfo.innerText+= 'Desktop notifications not available, try Chromium! \n';
               else
                 Notification.requestPermission();                  
             }
           });              
         }
         
       });  
     }
     else
       adminInfo.innerText+= "No storage in navigator! \n";      
 });
  
 $("#sld4But").click( function() { loadDB(); }); //>Server Load<
 $("#ssv4But").click( function() { saveDB(); }); //>Server Save<
 $("#med4But").click( //>Memory Data<
 function() {
 // ***                 0     1     2     3     4    5     6     7     8
 // *** tPl:           id    name  gms  $buy  $won  $bal  csh%  rnk%  total
 // *** tHiFull:       date  np    bnk  $1    1st   $2    2nd   m-tGm
 // *** tGm:           isIn  pid   rnk  $won  $buy
   adminInfo.innerText= '[tPl]: 1       2      3       4       5       6     7      8 \n'
                      + ' id  name     #nG   $buy    $won    $bal    $(#)  %($)  total \n'
                      + '-------------------------------------------------------------- \n';
   tPl.forEach(function(col) {     
     adminInfo.innerText+= ('   '+ col[0]).slice(-3) +'  '
                         + (col[1] +'        ').substring(0, 8)
                         + ('    '+ col[2]).slice(-4)
                         + ('       '+ col[3]).slice(-7)
                         + ('        '+ col[4]).slice(-8)
                         + ('        '+ col[5]).slice(-8)
                         + ('        '+ col[6]).slice(-8)
                         + ('      '+ col[7]).slice(-6)
                         + ('       '+ col[8]).slice(-7) +' \n'; });
   
// *** 2nd part - games history data
   adminInfo.innerText+= '\n'
             + '[tHiFull]: 0     1     2     3    4      5   6       7     8 \n'
             + '         date   #nP  $bnk  $1st:name   $2nd:name   |tGm|  gid \n'
             + '---------------------------------------------------|-x-|------ \n';

   tHiFull.forEach(function(col) {     
     adminInfo.innerText+= ('               '+ col[0]).slice(-15) +' '
                         + ('   '+ col[1]).slice(-3) +' '
                         + ('     '+ col[2]).slice(-5) +' '
                         + ('     '+ col[3]).slice(-5) +' '
                         + (col[4] +'       ').substring(0, 7)
                         + ('    '+ col[5]).slice(-4) +' '
                         + (col[6] +'       ').substring(0, 7)
                         + '|-x-| '
                         + ('    '+ col[8]).slice(-4) +' \n'; });
 });
  
  
// THE END : $(document).ready  
});

