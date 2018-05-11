
$(document).ready(
function() {  
      
 // ☆☆☆ load from cache blob?  
 
 var audQuack= new Audio("https://raw.githubusercontent.com/pokerica/pokerica.github.io/data/qua.wav");
 var audCheng= new Audio("https://raw.githubusercontent.com/pokerica/pokerica.github.io/data/che.wav");  
 var audClick= new Audio("https://raw.githubusercontent.com/pokerica/pokerica.github.io/data/cli.wav");
 var audChang= new Audio("https://raw.githubusercontent.com/pokerica/pokerica.github.io/data/cha.wav"); 
/*
 var audQuack= document.getElementById("audQuack");
 var audCheng= document.getElementById("audCheng");
 var audClick= document.getElementById("audClick");
 var audChang= document.getElementById("audChang");
*/
  


  
  
 $.ajaxSetup({ async:true, cache:true, timeout:5000 });       
  
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
 var sortColP= 8;
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
 var tb= document.getElementById('playerTable');
 var gmt= document.getElementById('gameTable');
 var hit= document.getElementById('historyTable');
 var selected= tb.getElementsByClassName('selected');
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
  
  
 var keepMsgBar= false;
 function rowAnim(tbrow, turnOn) {

       if(turnOn < 2) {
         
           if(turnOn === 0)
             setTimeout( function() {
               $(tbrow).removeClass('already').removeClass('clean'); 
               if(listMode > 1) $(tbrow).addClass('clean').removeClass('selected');
                 else $(tbrow).removeClass('selected'); }, 280);
           else
           if(turnOn === 1)
             setTimeout( function() {      
               $(tbrow).removeClass('clean').addClass('selected'); }, 100);
       }

       if(tbrow.style.transform === 'rotate3d(1, 0, 0, 360deg)')
         $(tbrow).css({transition:'transform 0.5s ease-out',
                       "transform-style":'preserve-3d', transform:'rotate3d(1, 0, 0, 0deg)'});
       else
         $(tbrow).css({transition:'transform 0.5s ease-out',
                       "transform-style":'preserve-3d', transform:'rotate3d(1, 0, 0, 360deg)'});
 }
  
   
 function resetEdit(formToo) {

   $(".selected").removeClass('already').removeClass('clean');

   if(listMode > 1)
     $(".selected").addClass('clean').removeClass("selected");   
   else     
     $(".selected").removeClass("selected");   

   
   //var selRows= tb.getElementsByClassName('selected');
   //$(selRows).children().eq(3).click();
   
   
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
     
   if(revSort)
     tPl.reverse();
   else
   if(sortColP !== 1)    
     tPl.sort(function(a, b) { if(sortColP === 0) 
       return a[sortColP] - b[sortColP]; else return b[sortColP] - a[sortColP]; });
   else 
     tPl.sort( function(a, b) { 
       if(b[sortColP] > a[sortColP]) return -1;
       else
         if(b[sortColP] < a[sortColP]) return 1;
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
                      +'; text-align:left">'+ col[1] +'</td><td>'+ col[2] 
                      +'</td><td>'+ ((col[2] === 0) ? '-' : fCash(col[3]*1000))
                      +'</td><td>'+ ((col[2] === 0) ? '-' : fCash(col[4]*100))
                      +'</td><td>'+ ((col[2] === 0) ? '-' : fCash(col[5]*100))
                      +'</td><td>'+ ((col[2] === 0) ? '-' : fCash(col[6]*100))
                      +'</td><td>'+ ((col[2] === 0) ? '-' : fCash(col[7]*100))
                      +'</td><td>'+ ((col[2] === 0) ? '-' : (col[8]/10).toFixed(1))
                      +'</td></tr>'); 
   });
   
   
   
   $('#ptb>tr').addClass("clean"); 
   switch(listMode) {
     case 1: $('#ptb>tr').removeClass('clean'); break; 
     case 2: $('#ptb>tr').css("border-top", "1px solid lightgrey"); break;     
     case 3: // plain, besic set in css '.clean'
   }
   

   for(var i= 0; i < tPl.length; i++) {
     
     var pid= (+tPl[i][0]) - 1;
     //alert('i: '+ i +'   pid: '+ pid);
     
     if(tGm[pid][0] !== 'F') 
       $('#ptb>tr').eq(i).removeClass('clean').addClass('selected'); 
     
     if(tGm[pid][0] === 'A')
       $('#ptb>tr').eq(i).addClass('already');
   }
   
   
   
   // *** header
   $('#pth>tr').children().css({border:'none'});
   $("#pth>tr").children().eq(sortColP).css({border:'2px solid grey'});
//                                            "border-bottom":'2px solid lightgrey'});
   
   if(initGanim) { var ttcnt= 0; initGanim= false; //noSwitch= true;
                  
     for(var i= 0; i < nextID; i++) { setTimeout(
       function(rx) {
           rowAnim($('#ptb>tr')[rx], 9); //$('#ptb>tr').eq(rx).children().eq(3).click();
     }, 200+ i*20, i); ttcnt= i; }
                  
     for(var i= 0; i < nextID; i++) { setTimeout(
       
       function(rx) {
           rowAnim($('#ptb>tr')[rx], 9); //$('#ptb>tr').eq(rx).children().eq(3).click();
     }, 450+(i+ttcnt)*20, (nextID-1) - i); } 
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
   
   
   
   
   
   
   
  $(".money").off();   
  $(".money").on("transitionend", //// webkitTransitionEnd oTransitionEnd MSTransitionEnd
  function(e) {
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

    e.stopPropagation(); e.stopImmediatePropagation();
    if (!e || e.defaultPrevented) return; e.preventDefault();
    

    var rx= this.parentNode.parentNode.rowIndex -1; 
    
    if($(this).css('z-index') === '9')      
      $(this).css({"transition":"none", "transform":"none", 'z-index':'0'});
    else
    if($(this).css('z-index') === '8') {
      
      $(this).css({"transform":"rotate3d(0, 1, 0, 0deg) scale3d(0.7, 0.7, 1)",  
                   'z-index':9, "background": "lightgrey", "color":"black"}); 
      
      $(this).css({'font':'bold 15px monospace',
                   'bottom':'12px', 'width':'50px', 'height':'25px'});
      
      this.innerText= 'OUT';  
      
   
      if(vSpace > 10) 
        $(this).css({bottom:'21px'});
      
      if(+tGm[rx][2] === 2) { 
         $(this).css({right:'390px'}); this.innerText= '2nd'; }
      else
      if(+tGm[rx][2] === 1) { 
         $(this).css({right:'390px'}); this.innerText= '1st'; }
        
    }
    else            
    if($(this).css('z-index') !== '0'
       || this.style.transform === rotStr +"360deg)") {
      
      $(this).css({"transition":"", "transform":"", 'z-index':'0'}); 
    }    
    else     
    if(this.style.transform === rotStr +"90deg)") {
      
      if(editMode)
        $(this).css({"transform":rotStr +"270deg)", 
                     "background": "grey", "color":"white"}); 
      else
        $(this).css({"transform":rotStr +"270deg)" +' scale3d(1.7, 1.7, 1)', 
                     "background": "lightgrey", "color":"black"});         
    }
    else            
    if(this.style.transform === rotStr +"270deg)" +' scale3d(1.7, 1.7, 1)') {
      
      $(this).css({background:'darkgreen', color:'white',
                   transform:rotStr +'360deg)' + ' scale3d(0.8, 0.8, 1)'});
    }
    else                  
      $(this).css({"transition":"", "transform":"", 'z-index':'0'});     
  });
 }  

  
  
  
  
 // *** CANVAS GRAPHICS, DRAW LINE GRAPH ------------------------
  
 var ctx, isBar= false, curCanv= 0, cnvsAhow= 0, cnvsBhow= 0;
 function linGrap(ofset, mx, mn, ptList, lCol, leg, ttl) {

   var vertMax= mx-mn; 
   var horDist= 470 / (ptList.length-1);
   var zeroLine= 97 - (15+ Math.round(-mn/vertMax*70));
   
   ctx.fillStyle= "black";
   ctx.font= "11px monospace";
   
    var fDec= ptList[0];
    var fMul= fDec ? 0.1 : 1;
   
    var single= false;
    if((curCanv === 1 && cnvsAhow > 0)
       || (curCanv === 2 && cnvsBhow > 0)) { //mn <= 0 && 

        single= true;
        horDist= 500 / (ptList.length-1);
      
        ctx.fillText(("     "+(mn *fMul).toFixed(fDec)).slice(-5), 1, 80 +4);
        ctx.fillText(("     "+(mx *fMul).toFixed(fDec)).slice(-5), 1, 10 +4);
        ctx.fillText(("     "+((mn + vertMax/2) *fMul).toFixed(fDec)).slice(-5), 1, 45 +4);      
    }
    
   
    if(single || ofset === 0) {
      
      ctx.lineWidth= 1.0;
      ctx.strokeStyle= "black";
      ctx.beginPath();

      ctx.moveTo(38, 80); ctx.lineTo(555, 80);
      ctx.moveTo(45, 5); ctx.lineTo(45, 85);
      ctx.stroke();
     
      ctx.strokeStyle= "lightgrey";
      ctx.beginPath();
      
      ctx.moveTo(38, 10); ctx.lineTo(555, 10);
      ctx.moveTo(38, 45); ctx.lineTo(555, 45);
       
      ctx.stroke();
      var srtCH= sortColH; 
      if(sortColH === 7) srtCH= 8;
      var xa0= tHiFull[tHiFull.length-1][srtCH];
      var xa1= $("#hth>tr").children()[sortColH].innerText;
      if(revSort) xa1= "<- "+xa1; else xa1= xa1+" ->";
      
      var xa2= tHiFull[0][srtCH];

      ctx.fillText(xa0, 40, 97);
      ctx.fillText(xa1, 40 +220, 97);
      ctx.fillText(("              "+xa2).slice(-14), 40 +420, 97);
      
      if(!single) {
        ctx.fillText(("    low%").slice(-4), 4, 80 +4);
        ctx.fillText(("    top%").slice(-4), 4, 10 +4);
        ctx.fillText(("    mid%").slice(-4), 4, 45 +4);
      }
    }
   
    ctx.lineWidth= 2.0;
    ctx.fillStyle= lCol;
    ctx.strokeStyle= lCol;

    var wof= (single) ? 0 : (3-ofset) *10;
   
    if(!isBar) ctx.beginPath();
    ptList.forEach( function(pt, cnt) {

      if(cnt < 1) return;
      
      
      var cooY= pt - mn;
      var horX= 5+ Math.round(wof + cnt * horDist);
      var verY= (cooY < 1) ? 15 : (15+ Math.round(cooY/vertMax * 70));
      
      verY= 95 - verY;
      horX= 550 - horX;
       
      if(isBar) { horX+= 4;
        ctx.fillRect(horX-3.5, 83, 7, -(100- verY-14)); }
      else {
        
        if(cnt ===  0) 
          ctx.moveTo(horX, verY);
        else
          ctx.lineTo(horX, verY); 
      
        ctx.fillRect(horX-3.5, verY-3.5, 7, 7);
      }
    });
   
    if(!isBar) ctx.stroke();

   /*
    if(leg === "#ng") leg= "#np";
    if(leg === "name") leg= "1st id";
    if(ttl === "#ng") ttl= "#np";
    if(ttl === "name") ttl= "1st id";
    */
   
    leg= leg.substring(0, 6);
   
    ofset= Math.round(ofset*17);
   
    //ctx.font= "14px sans-serif";
    ctx.font= "bold 12px monospace";
    ctx.fillText(leg, 615, 41+ofset );
   
    ctx.beginPath();
    ctx.moveTo(585, 37+ofset);
    ctx.lineTo(605, 37+ofset);   
    ctx.stroke();
   
    ctx.fillRect(605-3.5, 37+ofset-3.5, 7, 7);
   
    if(!ttl) return;
    ctx.fillStyle= "grey";
    ctx.fillRect(570, 1, 100, 20);
   
    ctx.fillStyle= "white";
    ctx.fillText(ttl, 580, 15);
 }
  
  
 function freshCanvas() {
   
  // *** CANVAS GRAPHICS -------------------------------------------
  
  var canvas = document.getElementById('canvasA');
  if(!canvas.getContext) return;

  ctx= canvas.getContext('2d');
  ctx.clearRect(0, 0, 660, 100);
   
  var tmpCol= 0;
  var npMax= 0, npMin= 9999, npLine= [ 1, 2, 3 ]; npLine.length= 0;
  var bkMax= 0, bkMin= 9999, bkLine= [ 1, 2, 3 ]; bkLine.length= 0;
  var r1Max= 0, r1Min= 9999, r1Line= [ 1, 2, 3 ]; r1Line.length= 0;
  var r2Max= 0, r2Min= 9999, r2Line= [ 1, 2, 3 ]; r2Line.length= 0;
  
  var p1Id= tPl[0][0], p2Id= tPl[1][0], p3Id= tPl[2][0], p4Id= tPl[3][0];
   
  if(selected.length === 1)
    p2Id= p3Id= p4Id= p1Id= +selected[0].firstChild.innerText;
    
   npLine.push( 0 );
   bkLine.push( 1 );   
   r1Line.push( 1 );   
   r2Line.push( 1 );
   
  // *** tHiFull:  0:date  1:#nP  2:$bnk  3:$1  4:1name  5:$2  6:2name  7:m-tGm
  tHiFull.forEach(function(col) { 
    
    if(selected.length === 1) {
        
      
      var cx= 0;
      var miniGm= col[7].split(':');
      for(var i= 5; i < miniGm.length; i+= 5) {
        cx= i/5;
        if( +miniGm[i+0] === p1Id ) {

          tmpCol= +col[1]; npLine.push( tmpCol ); ///$nP
          if(tmpCol > npMax) npMax= tmpCol; if(tmpCol < npMin) npMin= tmpCol;

          tmpCol= +col[2]*10; bkLine.push( tmpCol ); //$bnk
          if(tmpCol > bkMax) bkMax= tmpCol; if(tmpCol < bkMin) bkMin= tmpCol;

          tmpCol= +col[3]; //+miniGm[i+1]*10;
          r1Line.push( tmpCol ); //buyGm
          if(tmpCol > r1Max) r1Max= tmpCol; if(tmpCol < r1Min) r1Min= tmpCol;

/*          tmpCol= 0; 
          if(cx === 1) tmpCol= col[3];
          if(cx === 2) tmpCol= col[5]; */
          
          tmpCol= +col[5];
          r2Line.push( tmpCol ); //wonGm
          if(tmpCol > r2Max) r2Max= tmpCol; if(tmpCol < r2Min) r2Min= tmpCol;
        }
      }
    }
    else {

      tmpCol= +col[1]; npLine.push( tmpCol );
      if(tmpCol > npMax) npMax= tmpCol; if(tmpCol < npMin) npMin= tmpCol;

      tmpCol= +col[2]*10; bkLine.push( tmpCol ); //$bnk
      if(tmpCol > bkMax) bkMax= tmpCol; if(tmpCol < bkMin) bkMin= tmpCol;

      tmpCol= +col[3]; r1Line.push( tmpCol ); //$1
      if(tmpCol > r1Max) r1Max= tmpCol; if(tmpCol < r1Min) r1Min= tmpCol;

      tmpCol= +col[5]; r2Line.push( tmpCol ); //$2
      if(tmpCol > r2Max) r2Max= tmpCol; if(tmpCol < r2Min) r2Min= tmpCol;
    }
    
  });
   
   /*
   alert('  npMax: '+ npMax +'  npMin: '+ npMin +'\n'
       + '  bkMax: '+ bkMax +'  bkMin: '+ bkMin );
  */
   
  curCanv= 1;
  isBar= false;
  var ts= $('#hth>tr')[0].cells;
     
  if(selected.length === 1) {
    
    isBar= true;
    if(cnvsAhow === 0 || cnvsAhow === 1)
      linGrap(0, npMax, npMin, npLine, "red", (ts[1].innerText).toLowerCase(), sortedPl[ p1Id-1 ]);
    if(cnvsAhow === 0 || cnvsAhow === 2)
      linGrap(1, bkMax, bkMin, bkLine, "green", (ts[2].innerText).toLowerCase(), sortedPl[ p1Id-1 ]);
    if(cnvsAhow === 0 || cnvsAhow === 3)
      linGrap(2, r1Max, r1Min, r1Line, "darkorange", (ts[3].innerText).toLowerCase(), sortedPl[ p1Id-1 ]);
    if(cnvsAhow === 0 || cnvsAhow === 4)
      linGrap(3, r2Max, r2Min, r2Line, "brown", (ts[5].innerText).toLowerCase(), sortedPl[ p1Id-1 ]);
  }
  else {

    var fts= "all games";
    if(cnvsAhow === 0 || cnvsAhow === 1)
      linGrap(0, npMax, npMin, npLine, "red", (ts[1].innerText).toLowerCase(), fts);
    if(cnvsAhow === 0 || cnvsAhow === 2)
      linGrap(1, bkMax, bkMin, bkLine, "green", (ts[2].innerText).toLowerCase(), fts);
    if(cnvsAhow === 0 || cnvsAhow === 3)
      linGrap(2, r1Max, r1Min, r1Line, "darkorange", (ts[3].innerText).toLowerCase(), fts);
    if(cnvsAhow === 0 || cnvsAhow === 4)
      linGrap(3, r2Max, r2Min, r2Line, "brown", (ts[5].innerText).toLowerCase(), fts);
  }
  
   
   
   
// *** CANVAS B ---------------------
   
  canvas = document.getElementById('canvasB');
  if(!canvas.getContext || tPl.length < 5) return;

  ctx= canvas.getContext('2d');
  ctx.clearRect(0, 0, 660, 100);
   
   
  var p1Max= 0, p1Min= 9999, p1Line= [ 1, 2, 3 ]; p1Line.length= 0;
  var p2Max= 0, p2Min= 9999, p2Line= [ 1, 2, 3 ]; p2Line.length= 0;
  var p3Max= 0, p3Min= 9999, p3Line= [ 1, 2, 3 ]; p3Line.length= 0;
  var p4Max= 0, p4Min= 9999, p4Line= [ 1, 2, 3 ]; p4Line.length= 0;
  p1Id= tPl[0][0], p2Id= tPl[1][0], p3Id= tPl[2][0], p4Id= tPl[3][0];
   
  //alert('selected.len: '+ selected.length +'\n'+ selected[0].firstChild.innerText);
  if(selected.length > 3) {
   
    p1Id= +selected[0].firstChild.innerText;
    p2Id= +selected[1].firstChild.innerText;
    p3Id= +selected[2].firstChild.innerText;
    p4Id= +selected[3].firstChild.innerText;
  }
  else
  if(selected.length === 1) {
   
    p2Id= p3Id= p4Id= p1Id= +selected[0].firstChild.innerText;
  }
  else
  if(selected.length === 2) {
   
    p3Id= p4Id= -9;
    p1Id= +selected[0].firstChild.innerText;
    p2Id= +selected[1].firstChild.innerText;
  }
  else
  if(selected.length === 3) {
   
    p4Id= -9;
    p1Id= +selected[0].firstChild.innerText;
    p2Id= +selected[1].firstChild.innerText;
    p3Id= +selected[2].firstChild.innerText;
  }
  
   
   if(selected.length === 1) {

       if(sortColP < 5) {
              p1Line.push(0); p2Line.push(0); p3Line.push(1); p4Line.push(1); }
       else {
              p1Line.push(1); p2Line.push(1); p3Line.push(1); p4Line.push(1); }
   }
   else
   if(selected.length !== 1) {
        
       if(sortColP < 3) { 
         p1Line.push(0); p2Line.push(0); p3Line.push(0); p4Line.push(0); }
       else {
         p1Line.push(1); p2Line.push(1); p3Line.push(1); p4Line.push(1); }
   }
   
   
  // *** tHiFull:  0:date  1:#nP  2:$bnk  3:$1  4:1name  5:$2  6:2name  7:m-tGm  8:gid
  tHiFull.forEach(function(col) {
    
    var cx= 0;
    var miniGm= col[7].split(':');
    for(var i= 5; i < miniGm.length; i+= 5) {
      
      cx= i/5;;
          
        var col0= +("    "+ col[0]).slice(-4); //id -> date?
        var col1= +miniGm[5]; //name -> 1st:id?
        
        var col2= +miniGm[i+2] //#nG         
        var col3= +miniGm[i+1] //buy
        
        var col4= 0; //won
        if(cx === 1) col4= +col[3];
        if(cx === 2) col4= +col[5];
            
        var ngmTi= +miniGm[i+2];
        var buyTi= +miniGm[i+3];
        var wonTi= +miniGm[i+4];
      
        var balTi= wonTi - buyTi*10; 
      
        var balGm= col4 - col3*10;
        var balTe= balTi + balGm;
      
        var col5= balTe; //bal
        var col6= balGm; //$(#)
        var col7= c7Avg(balGm, col3); //%($)
        var col8= col6 + col7; //tot

      if(selected.length === 1) {
        
        if( +miniGm[i] === p1Id ) {

            if(sortColP < 5) {

              tmpCol= col1; p1Line.push( tmpCol );
              if(tmpCol > p1Max) p1Max= tmpCol; if(tmpCol < p1Min) p1Min= tmpCol;

              tmpCol= col2; p2Line.push( tmpCol );
              if(tmpCol > p2Max) p2Max= tmpCol; if(tmpCol < p2Min) p2Min= tmpCol;

              tmpCol= col3*10; p3Line.push( tmpCol );
              if(tmpCol > p3Max) p3Max= tmpCol; if(tmpCol < p3Min) p3Min= tmpCol;

              tmpCol= col4; p4Line.push( tmpCol );
              if(tmpCol > p4Max) p4Max= tmpCol; if(tmpCol < p4Min) p4Min= tmpCol;
            }
            else {

              tmpCol= col5; p1Line.push( tmpCol );
              if(tmpCol > p1Max) p1Max= tmpCol; if(tmpCol < p1Min) p1Min= tmpCol;

              tmpCol= col6; p2Line.push( tmpCol );
              if(tmpCol > p2Max) p2Max= tmpCol; if(tmpCol < p2Min) p2Min= tmpCol;

              tmpCol= col7; p3Line.push( tmpCol );
              if(tmpCol > p3Max) p3Max= tmpCol; if(tmpCol < p3Min) p3Min= tmpCol;

              tmpCol= col8; p4Line.push( tmpCol );
              if(tmpCol > p4Max) p4Max= tmpCol; if(tmpCol < p4Min) p4Min= tmpCol;
            }
          
        }
      }
      else {
        
        switch(sortColP) {               
          case 0: tmpCol= col0; break;
          case 1: tmpCol= col1; break;
          case 2: tmpCol= col2; break;
          case 3: tmpCol= col3*10; break;
          case 4: tmpCol= col4; break;
          case 5: tmpCol= col5; break;
          case 6: tmpCol= col6; break;
          case 7: tmpCol= col7; break;
          case 8: tmpCol= col8; break;
        }
        
        if( +miniGm[i] === p1Id ) { p1Line.push( tmpCol );
          if(tmpCol > p1Max) p1Max= tmpCol; if(tmpCol < p1Min) p1Min= tmpCol; }

        if( +miniGm[i] === p2Id ) { p2Line.push( tmpCol );
          if(tmpCol > p2Max) p2Max= tmpCol; if(tmpCol < p2Min) p2Min= tmpCol; }

        if( +miniGm[i] === p3Id ) { p3Line.push( tmpCol );
          if(tmpCol > p3Max) p3Max= tmpCol; if(tmpCol < p3Min) p3Min= tmpCol; }

        if( +miniGm[i] === p4Id ) { p4Line.push( tmpCol );
          if(tmpCol > p4Max) p4Max= tmpCol; if(tmpCol < p4Min) p4Min= tmpCol; }
      }
     
    }
  });

  
  curCanv= 2;
  isBar= false; 
  if(sortColP < 5) isBar= true;
  var c1= "#238EB8", c2= "#82BDD4", c3= "#819A28", c4= "#ABCE2C";
   //c1= "#DA27B4", c2= "#0131B7", c3= "#9319F0", c4= "#7285E1";
   
  if(selected.length === 1) { //9A0794
       
    var ts= $('#pth>tr')[0].cells;
    var tn= (sortColP < 5) ? 1 : 5;
    
    if(p2Id > 0 && (cnvsBhow === 0 || cnvsBhow === 1))
      linGrap(0, p2Max, p2Min, p2Line, c1, (ts[tn +1].innerText).toLowerCase(), sortedPl[ p1Id-1 ]);
    
    if(p3Id > 0 && (cnvsBhow === 0 || cnvsBhow === 2))
      linGrap(1, p3Max, p3Min, p3Line, c2, (ts[tn +2].innerText).toLowerCase(), sortedPl[ p1Id-1 ]);
     
    if(p1Id > 0 && (cnvsBhow === 0 || cnvsBhow === 3))
      linGrap(2, p1Max, p1Min, p1Line, c3, (ts[tn +0].innerText).toLowerCase(), sortedPl[ p1Id-1 ]);
    
    if(p4Id > 0 && (cnvsBhow === 0 || cnvsBhow === 4))
      linGrap(3, p4Max, p4Min, p4Line, c4, (ts[tn +3].innerText).toLowerCase(), sortedPl[ p1Id-1 ]); 
  }
  else {
    
    if(selected.length && cnvsBhow > selected.length) cnvsBhow= 0;
   
    var ts= $('#pth>tr')[0].cells[sortColP].innerText; 
    
    if(p1Id > 0 && (cnvsBhow === 0 || cnvsBhow === 1))
      linGrap(0, p1Max, p1Min, p1Line, c1, sortedPl[ p1Id-1 ], ts.toLowerCase());
    if(p2Id > 0 && (cnvsBhow === 0 || cnvsBhow === 2))
      linGrap(1, p2Max, p2Min, p2Line, c2, sortedPl[ p2Id-1 ], ts.toLowerCase());
    if(p3Id > 0 && (cnvsBhow === 0 || cnvsBhow === 3))
      linGrap(2, p3Max, p3Min, p3Line, c3, sortedPl[ p3Id-1 ], ts.toLowerCase());
    if(p4Id > 0 && (cnvsBhow === 0 || cnvsBhow === 4))
      linGrap(3, p4Max, p4Min, p4Line, c4, sortedPl[ p4Id-1 ], ts.toLowerCase()); //blueviolet
  }

 }
  
 $('#canvasA').click( function() { if(++cnvsAhow > 4) cnvsAhow= 0; freshCanvas(); });
 $('#canvasB').click( function() { if(++cnvsBhow > 4) cnvsBhow= 0; freshCanvas(); });
  

  
  
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
     
     var dtStr= ''+col[0];
     //var mon= +dtStr.substring(4,5);
     $('#htb').append('<tr><td style="font:12px monospace; text-align:center; white-space:pre-line">'
                                      + dtStr.substring(0,8) +'\n'+ dtStr.substring(8) 
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
   $("#hth>tr").children().eq(sortColH).css({border:'2px solid grey'});
   
   if(editMode) {
     
     $('#dtEdit').val('');
     $('.initDis').prop("disabled", true);
   }
   
   freshCanvas();
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
                 tmpGm= tGm.slice(0);
               
                 prtGm();
             });
         }).catch(function(err) { 
              nBar.innerText+= "Save game state failure: "+ err.message+ endNotfChar; });
 }
  
  
  
// *** GAME OVER *** *** *** *** *** *** *** *** *** *** *** *** *** *** ***

 function c6Avg(balance, nG) {
   var retVal= balance / nG;
   if(isNaN(retVal)) retVal= -555; 
   return Math.round(retVal);
 }
  
 function c7Avg(balance, buyin) {
   var retVal= balance / buyin;
   if(isNaN(retVal)) retVal= -444; 
   return Math.round(retVal);
 }
  
/* old...  
 function rankAvg(nP, bank, rank, buyin) {
   // Math.round(Math.sqrt((bnk+i*2)*40))
   var retVal= Math.sqrt( (bank + nP*2) * 99 );
   for(var i= 2; i < rank; i++) retVal/= 2;
   if(isNaN(retVal)) retVal= 443;
   return Math.round(retVal/buyin);
 }  
*/
  
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
                      tPl[cnt][6]= c6Avg(tPl[cnt][5], tPl[cnt][2]); 
                     
                      tPl[cnt][7]= c7Avg(tPl[cnt][5], tPl[cnt][3]);
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
 var noSwitch= false;
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
   
   
   
   //tGm.forEach(function(col) {  col[0]= 'F'; });   
   for(var i= 0; i < selected.length; i++) {
     
      var pid= +(selected[i].firstChild.innerText) -1; 
     
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
   
      if(!editMode && useThisDate === 0 && iRnk > curRank+1) {
        
        var mny= $('.money')[rx];
        audQuack.currentTime= 0; audQuack.play();
           $(mny).finish().animate({width:'+=14px'}, "fast")
                 .animate({width:'-=14px'}, "fast", 'swing',
                      function() { if(+tGm[rx][2] > 0) $(mny).css({width:'50px'}); });
        return;
      }
   
      for(var i= 0; i < tGm.length; i++) {  
         if(tGm[i][0] === '<' || tGm[i][0] === '>') {
           alert('backAnim: What is wrong with you?!' +'  --: '+ tGm[rx][0]);
           return; }      
      }
       
   
       tGm[rx][0]= '>';     
       audCheng.currentTime= 0; audCheng.play();
   
                var cx= 0;
                tGm.forEach(function(col) {
                  
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
                    
                    col[0]= '<';

                      
                    $(tm).finish();
                    $(tm).animate({width:'70px', right:'400px'}, "fast",
                      function() {
                      
                        col[0]= 'r';
                        tm.parentNode.parentNode
                           .cells[3].innerText=  (col[2]= cr+1); 
             
                        if(col[2] === 3) 
                          tm.innerText= 'OUT';
                      }
                                  
                    ).animate({width:'50px', right:rp}, "fast", 'swing');
                  }
                  
                  cx++;
                });
         
   
   
       var mny= $('.money')[rx];
   
       $(mny).finish();    
       $(mny).animate({right:'90px', width:'340px'}, "fast", 'swing',

             function() { 
         
                curRank++;
                mny.parentNode.parentNode.cells[3].innerText= (tGm[rx][2]= '-');
          
                if(tGm[rx][0] !== '>') alert('uhB: '+ tGm[rx][0]);                   
                tGm[rx][0]= 'b';
             }
                      
       ).animate({right:'70px', width:'90px'}, "fast", 'swing',
                 
              function() {
         
                 rotStr= "rotate3d(0, 1, 0, "; 
                 $(mny).css({"transition":"transform 0.12s ease-out",//ease-in
                   "transform-style":"preserve-3d", "transform":rotStr +"90deg)"});
         
                 $(mny).css({font:'normal 15px monospace', 'z-index':'0',  
                             'color':'white', 'background':'darkgreen'});
                 mny.innerText= '  $  ';
         
                 if(vSpace > 10) $(mny).css({'bottom':'17px'});
                   else $(mny).css({'bottom':'7px'});
              }
                 
       ).animate({'font-size':'20px', height:'30px', right: '5px'}, "fast", 'swing',
                 
              function() {
         
                audClick.currentTime= 0; audClick.play();
                $(mny).css({font:'bold 24px monospace', height:'35px', width:''});         
                mny.innerText= '  $  ';         
              }
       ); 
 }
    
  
 function outAnim(rx, rc) {
            
     //if(tGm[rx][0] === '<') return;
     //for(var i= 0; i < tGm.length; i++) { if(tGm[i][0] === '>') return; }
      
     if(tGm[rx][0] === '<' || tGm[rx][0] === '>') return;   
       
     if(rc) { audCheng.currentTime= 0; audCheng.play(); }
     else    
      { audQuack.currentTime= 0; audQuack.play(); }
   
  
     tGm[rx][0]= '<'; 
     var mny= $('.money')[rx]; 
     
     $(mny).finish();
     $(mny).css({"transition":"none", "transform":"none", 'z-index':'7'});
          
     var rp= (tGm[rx][2] === 1 || tGm[rx][2] === 2) ? '380px' : '430px';
     $(mny).animate({width:'320px', right:'10px'}, "fast", "swing"          
        
        ,function() {
                    
            $(mny).css({'color':'white', 'background':'darkgreen'});
            $(mny).css({'z-index':'8', "transition":"transform 0.24s ease-in",
                      "transform":"rotate3d(0, 1, 0, +90deg) scale3d(1.5, 1.5, 1)", 
                      //"transform-origin":"left center",
                      "transform-style":"preserve-3d"});
         }

     ).animate({width:'70px', right:rp}, "fast", "swing"    
        
        ,function() {
       
           audClick.currentTime= 0; audClick.play();
       
           if(tGm[rx][0] !== '<') alert('uhO: '+ tGm[rx][0]);       
           tGm[rx][0]= 'o';
              
           if(!rc) return;
       
           if(curRank === 2) 
             rx2= rx;
           else
           if(curRank === 1)
             rx1= rx;
       
           rc.innerText= (tGm[rx][2]= curRank--);
              
       
           // *** GAME OVER
           if(curRank === 0)
             mnySplit();       
         } 
     );    
 }
  
  
 var aniSp= "fast";
 gmt.onclick= 
 function(e) { // async? 
      
   if(!e || e.defaultPrevented) return;  
   e.preventDefault(); 
   e.stopPropagation();
   e.stopImmediatePropagation();

   if(e.target.parentNode.rowIndex === 0) {
     // *** header click, sort game table?
     alert("thead.cellIndex: "+ e.target.cellIndex);  
     return;
   }
   
   if(!noSwitch) {
     clrNotif(); clearTimeout(clrST); ssPend= true;
     clrST= setTimeout(function(){ saveState(false); ssPend= false; }, 3000);
   }
   
   
   if(e.target.className === "money" || e.target.cellIndex > 5) {
   
     
     var mny= (e.target.className === "money" ) ? e.target : e.target.firstChild;         
     var rx= mny.parentNode.parentNode.rowIndex -1; 
     
     if(tGm[rx][0] === '<' || tGm[rx][0] === '>') return;   
          
     if(+tGm[rx][2] > 0) {
       
       if(noSwitch) return;
       
       if(e.target.className === "money") 
         backAnim(rx);
       else 
         outAnim(rx, false);
              
       return;     
     }
     
     
     audChang.currentTime= 0; audChang.play();    
     
     $(mny).finish();
     //$(mny).stop(true, false);         
     $(mny).animate({right: 
         ($(mny).closest("td").width()+15) +'px'}, "fast", "swing", 
         function() {
           mny.parentNode.previousSibling
             .innerText= fCash(1000* (tGm[rx][4]= +tGm[rx][4] +1));
       
           bankTotal++; 
           document.getElementById('lblBank').innerText= 'Bank: $'+ fCash(bankTotal*1000);
         }
        ).animate({right: '1px'}, aniSp).animate({right: '14px'}, "fast") 
         .animate({right: '2px'}, "fast").animate({right: '5px'}, "fast");   
     aniSp= "fast"; 
     
   }
   else
   if(!noSwitch && e.target.cellIndex < 2) {
     
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
   if(!noSwitch && e.target.cellIndex === 2) {
     
     var rx= e.target.parentNode.rowIndex-1;
      
     if(+tGm[rx][2] > 0) 
       backAnim(rx);
     else
       outAnim(rx, e.target.nextSibling);     
   }
   else
   if(!noSwitch && e.target.cellIndex === 5) {
 
         var rx= e.target.parentNode.rowIndex-1;
         if(tGm[rx][0] === '<' || tGm[rx][0] === '>') return;   
     
         var mny= e.target.nextSibling.firstChild;
    
         if(+tGm[rx][2] > 0 || e.target.innerText === "1,000") {
           audQuack.currentTime= 0; audQuack.play();
           $(mny).finish().animate({width:'+=14px'}, "fast")
                 .animate({width:'-=14px'}, "fast", 'swing',
                      function() { if(+tGm[rx][2] > 0) $(mny).css({width:'50px'}); });
           return;       
         }
     
         audCheng.currentTime= 0; audCheng.play();
                  
         $(mny).finish();    
         $(mny).animate({right: '30px'}, "fast").animate({right: '1px'}, "fast") 
           .animate({right: '10px'}, "fast").animate({right: '5px'}, "fast"); 
           
         //window.requestAnimationFrame(function() { });
           
         rotStr= "rotate3d(0, 1, 0, "; 
         $(mny).css({"transition":"transform 0.2s linear",//ease-in
                   "transform-style":"preserve-3d",
                   //"backface-visibility":"hidden",
                   "transform":rotStr +"90deg)"});
        
         bankTotal-= tGm[rx][4] -1;
         document.getElementById('lblBank').innerText= 'Bank: $'+ fCash(bankTotal*1000);
         e.target.innerText= fCash(1000* (tGm[rx][4]= 1));      
   }
   //else
     //alert("row: "+ e.target.parentNode.rowIndex +"  col: "+ e.target.cellIndex);
   
 }
   
  
  
 
 tb.onclick= 
 function(e) {   // async? 
   
   
   if(!e || e.defaultPrevented) return;        
   e.preventDefault(); e.stopPropagation();     
   e.stopImmediatePropagation();
     
   
   if(!gameOver && nBar.innerText.length > 1) clrNotif();
   
   
   audClick.currentTime= 0;
   audClick.play();
   
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
         rowAnim(e.target.parentNode, 0);       
     }
     else {
              
     
       if(editMode) resetEdit(false);          
       rowAnim(e.target.parentNode, 1);
       
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
 
 }
 
 
 
 
 // *** $('#historyTable') ****************************
 
 // ☆☆☆ subRow-content - REMOVE
 function subrowDelete(etpn) {
   
   if(editMode) $('#dtEdit').val('');
     
   $(etpn.firstChild.firstChild).finish()
     .animate({height:'10px'}, 'fast', 'swing',
     function() {

       //$(etpn.previousSibling).removeClass('selected'); 
       //if(listMode > 1) $(etpn.previousSibling).addClass('clean');
       //if(editMode) $(etpn.previousSibling).css({display:'table-row'});

       rowAnim(etpn.previousSibling, 0);
       audClick.currentTime= 0; audClick.play();  
     
       if(editMode) { editRow= -1;
         $('.initDis').prop("disabled", true);
       }
     
       etpn.remove();
   });
 }
  
 hit.onclick= 
 function(e) {   // async? 

   
   //alert(JSON.stringify(e.target));
   
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
  
     var selRows= hit.getElementsByClassName('selected');
     if(editMode) { //        rowAnim($(selRows)[0], false);
       $(selRows).children().eq(3).click();
       $('#dtEdit').val( tHiFull[ri][0] );
     }

     $(etpn).addClass('already');
   
   
// ***                 0     1     2     3     4    5     6     7       8
// *** tPl:           id    name  gms  $buy  $won  $bal  csh%  rnk%  total
// *** tHiFull:       date  np    bnk  $1    1st   $2    2nd   m-tGm  gid
// *** tGm:           isIn  pid   rnk  $won  $buy
   
     var scd= ''; //'BANK: $'+ fCash(...                                      ---|
     //    ' 99.|NAME______| 99k| 999,9xx|   +-999.9xx| +-99,9xx|+-99,9xx|+-99.99 \n';
     scd+= 'RNK  NAME       $BUY     $WON       $BAL ∑    ± $(#)   ± %($)    ± ∑  \n'
        +  '----------------------------------------------------------------------\n';
      
   
     var miniGm= tHiFull[ri][7].split(':');
   
     for(var i= 5; i < miniGm.length; i+= 5) {
       
         cx= i/5;
         
         var mnyw= 0;
         if(cx === 1)
           mnyw= +tHiFull[ri][3]; // $:1
         else
         if(cx === 2)
           mnyw= +tHiFull[ri][5]; // $:2 
         else if(cx === 3) scd+= '\n';
       
         var wons= (mnyw === 0) ? '   ' : fCash(+mnyw*100);
       
         var pid= +miniGm[i+0]-1;
         var buy= +miniGm[i+1];
        
         var ngTI= +miniGm[i+2];
         var byTI= +miniGm[i+3];
         var wnTI= +miniGm[i+4];
         var blTI= wnTI - byTI*10;
         
         var balnG= mnyw - buy*10;
         var balnT= blTI + balnG;
         //var bals= (baln < 0) ? '-'+ fCash(-baln*100) : '+'+ fCash(baln*100);
         var bals= fCash(balnT*100);
         
         var col6= balnG; //c6Avg(baln, 1);
         var col6s= (col6 < 0) ? '-'+ fCash(-col6*100) : '+'+ fCash(col6*100);
       
         var col7= c7Avg(balnG, buy);
         var col7s= (col7 < 0) ? '-'+ fCash(-col7*100) : '+'+ fCash(col7*100);
       
         var totl= col6 + col7;
         var tots= (totl < 0) ? '-'+ (-totl/10).toFixed(1) : '+'+ (totl/10).toFixed(1);
       
         scd+= ('   ' + cx).slice(-2) +'.  '
             + (sortedPl[ pid ] +'          ').substring(0, 10)
             + ('     '+ (buy+'k')).slice(-5) 
             + ('         '+ wons).slice(-9)
             + ('           '+ bals).slice(-11)              
             + ('            '+ col6s).slice(-12)
             + ('        '+ col7s).slice(-9) 
             + ('       '+ tots).slice(-8)
             + ' \n';
//                0    1    2     3     4 
// *** mini-Gm:  pid  buy  ∑nG  ∑buy  ∑won   
       
/*
         tPl[pid][6]= c6Avg(tPl[pid][5], tPl[pid][2]);                   
         tPl[pid][7]= c7Avg(tPl[pid][5], tPl[pid][3]);
         tPl[pid][8]= tPl[pid][6] + tPl[pid][7]; //tot 
       */
/*
       alert('( '+ pid + ' ) name: '+ sortedPl[ pid ] +'\n'
             + '#nG: '+ tPl[pid][2] +'\n'
             + 'bal: '+ tPl[pid][5] +'\n'
             + 'col6: '+ tPl[pid][6] +'\n'
             + 'col7: '+ tPl[pid][7] +'\n'
             + 'tot: '+ tPl[pid][8] );
*/
     }
     


     var ctes= 'style="color:white; background:black"';
     if(listMode === 2) ctes= 'style="color:black; background:white"';
       else if(listMode === 3) ctes= 'style="color:black; background:#f0f0f0"';
         else if(editMode && vSpace > 10) ctes= '';
   
     $(etpn).after('<tr tabindex="1" class="extra"'+ ctes +'><td colspan='
                   + (editMode?8:7) +'><pre style="height:1px; padding:5px 10px; '
                   + 'margin:0; text-align:left; font:bold 15px monospace">'+ scd +'</pre></td></tr>'); 
   
     $(etpn.nextSibling.firstChild.firstChild).finish().animate({
       height: (+tHiFull[ri][1] +3)*18+15+'px'}, 'normal', 'swing', 
       function() {

         if(editMode) {
           editRow= etpn.rowIndex -1;
           $('.initDis').prop("disabled", false);
         }
       
         $(etpn.nextSibling).focus(); 
     });
   
     rowAnim(etpn, 1);   
     audClick.currentTime= 0; audClick.play();  
 }

  
 var endNotfChar= '. #'; 
 
 // *** import... ************************************************************
 function importDB(data) { initOnceG= false;

// *** 1st part - players data
                          
     var gmHistory= data[1];
     data= data[0].split('|'); 
                          
                          
     if(!data) { nBar.innerText+=
              'No cache data X' +endNotfChar; return; }
                          
     let nCol= 6;              
     tPl.length = 0;
     for (var i = 0; i < data.length / nCol; i++) {
       
       var nbrs= [ parseInt(data[i*nCol +0], 10), 0, parseInt(data[i*nCol +2], 10), parseInt(data[i*nCol +3], 10), 
                         parseInt(data[i*nCol +4], 10), parseInt(data[i*nCol +5], 10) ];
       
       var bal= nbrs[4] - nbrs[3]*10;
       var col6= c6Avg(bal, nbrs[2]);
       var col7= c7Avg(bal, nbrs[3]);     
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
      
       navigator.storage.estimate()
       .then(({usage, quota}) => {                                    
          adminInfo.innerText+= "Usage: "+ (usage/1048576)
               .toFixed(2) +"MB out of "+ (quota/1048576).toFixed(2) +"MB. \n";                                      
       }); 
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
 
            let nCol= 6;
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
           //alert("got this: " + atob(response.☆data.content));    

           importDB(atob(response.content).split('@'));

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
      
      adminInfo.innerText= ">logged-in: "+ isLogged +"\n";
    
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
   noSwitch= true;   
   
   aniSp= "slow";
   if(plNo < 0) {
     plNo= -(plNo +100);
     
     audQuack.currentTime= 0; 
     audQuack.play();
     
     bankTotal+= tGm[plNo][4];
     document.getElementById('lblBank').innerText= 'Bank: $'+ fCash(bankTotal*1000);
     
     //if($(".money").eq(plNo).css('z-index') !== '0') return;
     
     rotStr= "rotate3d(1, 0, 0, -"; 
     $(".money").eq(plNo)
       .css({"transition":"transform 0.2s linear",//ease-in
             "transform-style":"preserve-3d",
             //"backface-visibility":"hidden",
             "transform":rotStr +"90deg)"});
   }
   else 
     $('.money').eq(plNo).click();   
   //alert("aa: "+ plNo);
   
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

   
     if(noSwitch) return;
   
     $(".mtb").removeClass("act dea").addClass("dea");
     $(this).removeClass("dea").addClass("act");
     
     $(".ptab").removeClass("pac pde").addClass("pde");   
     var tid= "#tab"+ (this.id).substring(3,4);      
     $(tid).removeClass("pde").addClass("pac");
   
   
     curTab= 0;
     if(editMode) { editMode= false;
       $('.adminEdit').css('display', 'none'); }
   
  
     audClick.currentTime= 0; 
     audClick.play();

     if(tid === "#tab2") { //curTab !== 2 && 
       
       curTab= 2;
       
       reInit= true;
       
       reFresh();
       
       reInit= false;
       gamePlayers= 0;
       sortedRnk.sort(function(a, b) { return b[0] - a[0] }); 
       
       
       var dt = new Date();
       document.getElementById("lblDate")
         .innerText= (useThisDate) ? useThisDate: dt.toDateString();
       
       curRank= 0;
       bankTotal= 0;
       document.getElementById('lblBank').innerText= 'Bank: $'+ fCash(bankTotal*1000);
      
       var tSpeed= 180;
       if(listMode === 2) tSpeed= 170;
         else if(listMode === 1) tSpeed= 190;                 
         
       tSpeed-= fastInit;
       
       var ix= -1;
       for(var i= 0; i < tGm.length; i++) {       
                  
           if(tGm[i][0] === "A") { ix++; curRank++;
             setTimeout( initBuyin, 400+ ix*(tSpeed-30), -(i+100)); }
       }
       
       var tmpTimeInt= 700+ ix*(tSpeed-30);
       for(var i= 0, ix= -1; i < tGm.length; i++) {   
                    
           if(tGm[i][0] === "T") { ix++; curRank++;
             setTimeout( initBuyin, tmpTimeInt+ ix*tSpeed, i); }         
       }    
  
       
       tmpTimeInt= 500+ tmpTimeInt+ ix*tSpeed;
       for(var i= 0, ix= 0; i < sortedRnk.length; i++) {
         ix++;
         setTimeout(function(trx) {           
           var rf= $('#gtb>tr')[trx].cells[3]; 
           //$(rf.cells[2]).click();
           
           outAnim(trx, rf);  
           
         }, tmpTimeInt+ ix*tSpeed, +sortedRnk[i][1] -1);     
       }    
       

       tmpTimeInt= 200 + tmpTimeInt+ ix*tSpeed;
       setTimeout( function() { noSwitch= false; fastInit= 0; }, tmpTimeInt);
       
       return;
       
     } // *** end tab-2
   
      
     if(tid === "#tab1") { //curTab !== 1 && 
       sortColP= 8; revSort= false; curTab= 1; }
     else   
     if(tid === "#tab3") { //curTab !== 3 && 
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
     if(curTab === 1) sortColP= 8;
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
     var col6= c6Avg(bal, col2);
     var col7= c7Avg(bal, col3);
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
// ... can delete last ID safely
$('#rli1But').click( //>Remove Last ID<
 function() { tPl.splice(nextID-1, 1); reFresh(); });
   
$("#rma1But").click(//>Remove All<
   function() { tPl.length= 0; reFresh(); });
  
$("#ssv1But").click( //>Server Save<
   function() { saveDB(); });
  

  
  
// *** TAB 2 : ADMIN BUTTONS ***************************************
// *** -------------------------------------------------------------
/*  
        <button class="ord" id="rng2But">Create Random Game</button>
*/  
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
       
         tPl[id][6]= c6Avg(tPl[id][5], tPl[id][2]);
         tPl[id][7]= c7Avg(tPl[id][5], tPl[id][3]);
         tPl[id][8]= tPl[id][6] + tPl[id][7]; //totl
     }
     disMini.push([ miniGm[i +2], miniGm[i +3], miniGm[i +4] ]);
   }
   
   // *** delete
   tHi.splice(+tHiFull[editRow][8], 1);
}
  
  
// *** TAB 3 : ADMIN BUTTONS ***************************************
// *** -------------------------------------------------------------
/*
        <button class="ord initDis" id="rdt3But" disabled>Re-Date</button>
        <button class="ord initDis" id="mdf3But" disabled>Modify</button>
        <button class="ord initDis" id="rmr3But" disabled>Remove</button>
*/
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
/*
        <button class="ord2" id="rcl3But">Recalculate All</button>
        <button class="ord2" id="rma3But">Remove All</button>
        <button class="ord2" id="ssv3But">Server Save</button>
*/
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
/*
        <input class="ord" id="log4But" type="button" value="Log In" >
        <input class="ord" id="mfx4But" type="button" value="Mute Audio FX" > 
        <input class="ord" id="wlk4But" type="button" value="Wake Lock" 
*/
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
/*
      <button class="ord2" id="gms4But">Game State</button>
      <button class="ord2" id="aps4But">Apply State</button>
      <button class="ord2" id="kps4But">Keep State</button>
      <button class="ord2" id="ems4But">Empty State</button>
      <br>      
      <button class="ord2" id="cad4But">Cache Data</button>
      <button class="ord2" id="imc4But">Import Cache</button>
      <button class="ord2" id="stc4But">Store Cache</button>
      <button class="ord2" id="gpc4But">Grant Persistance</button>
*/
  
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
 
 
  
/*
      <button class="ord2" id="med4But">Memory Data</button>
      <button class="ord2" id="sld4But">Server Load</button>
      <button class="ord2" id="ssv4But">Server Save</button>
      <button class="ord2" id="rpd4But">Ranking Points Distribution</button>
*/
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
  
  
  
 $("#rpd4But").click( //>Ranking Points Distribution<
 function() {
   //alert('Please wait... ');
   
   adminInfo.innerText= ' #nP  $bnk   pts: $1k  $2k  $3k  $4k  $5k \n'
                      + '------------------------------------------ ';
   
   var i, j, srn, bnk, cnt= 0;
   for(i= 2; i < 20; i++) {
     adminInfo.innerText+= '\n';
     for(j= i; j < i+5; j++) {
       
       bnk= Math.floor(i*(1 + 0.5*cnt));       
       srn= Math.sqrt( (bnk + i*2) * 99 );
       adminInfo.innerText+= ('   '+i).slice(-3) +' '
                           + ('     '+ bnk ).slice(-5) +'k      '       
                           + ('     '+ Math.round( srn/1 )).slice(-5)
                           + ('     '+ Math.round( srn/2 )).slice(-5)
                           + ('     '+ Math.round( srn/3 )).slice(-5)
                           + ('     '+ Math.round( srn/4 )).slice(-5)
                           + ('     '+ Math.round( srn/5 )).slice(-5) +'\n';
       cnt++;
     }
   }
   // var retVal= Math.sqrt( (bank + nP*2) * 99 )
   
 });
  
  
  
  
// THE END : $(document).ready  
});

