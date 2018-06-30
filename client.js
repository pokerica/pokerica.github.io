$(document).ready(function()
{
  var versionCode= "v2.0r12b \n";
  var appPath= 'https://pok.glitch.me';
  $.ajaxSetup({async:true, cache:false, timeout:5000,
               dataType:'text', contentType:'text/plain', processData:false});

  // ☆☆☆ load from cache blob?
  var audQuack= document.getElementById("audQuack"); //var audQuack= new Audio('');
  
  var adminInfo= document.getElementById("dbFrame");
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
  var bankTotal= 0;
  
  // ***         id1.rx, id2.rx, id3.rx...
  var rvsPLindex= [ 0, 1, 2, 3 ];
  var sortedPl= [ 'name1', 'name2', 'name3' ];

  /*                                          v-1st..       v-2nd..
  *** tHi:       date | #nP | $bank | $1st | plid : $buy : plid...    */
  var tHi= [ [ '20010101005959', '2', '0', '0', '0:0:1:1:2:1' ] ];

  // ***                 0     1     2     3     4    5     6     7       8
  // *** tPl:           id    name  gms  $buy  $won  $bal  csh%  rnk%  total
  // *** tHiFull:       date  np    bnk  $1    1st   $2    2nd   m-tGm   gid
  // *** tGm:           isIn  pid   rnk  $won  $buy
  var tPl = [ ["0", "declaration-init", "0", "0", "0", "0", "0", "0", "0"] ];
  var tHiFull= [ [ 20180101005959, 0, 0, 0, 'name1', 0, 'name2', '0:0:1:1', 0 ] ];
  var tGm = [ ['F', 0, '-', '-', 0] ];

  function fCash(num)
  { // *** clear commas: .replace(/,/g, '');
    if(isNaN(num)) return '-';
    
    var x= (num < 0);
    num= Math.abs(num).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    
    if(x) num= '−'+ num;
    return num;
  }
  
  function numCTD()
  {
    var dt= new Date(); 
    var retStr= dt.getFullYear()
               + ("00"+(dt.getMonth()+1)).slice(-2)
               + ("00"+dt.getDate()).slice(-2)
               + ("00"+dt.getHours()).slice(-2)
               + ("00"+dt.getMinutes()).slice(-2)
               + ("00"+dt.getSeconds()).slice(-2);
    return parseInt(retStr, 10);
  }

  // *** recalc. selected history-table rows
  function reclcSelHrows()
  {
    var tSelSum = JSON.parse(JSON.stringify(tPl));
    tSelSum.sort(function(a, b) { return a[0] - b[0] });
    tSelSum.forEach(function(row) {
      row[2]= row[3]= row[4]= row[5]= row[6]= row[7]= row[8]= 0; });

    var selHgm= $('#htb')[0].getElementsByClassName('selected');

    for(var j= 0; j < selHgm.length; j++)
    {
      var fSiz= 5, ri= +$(selHgm[j]).children()[8].innerText;
      var miniGm= tHiFull[ri][7].split(':');

      for(var i= fSiz; i < miniGm.length; i+= fSiz)
      {
        var pid= +miniGm[i+0]-1;
        var buy= +miniGm[i+1];
       
        var won= 0;
        if(i/fSiz === 1) won= +tHiFull[ri][3]; // $:1
        else if(i/fSiz === 2) won= +tHiFull[ri][5]; // $:2
        
        tSelSum[pid][2]++;
        tSelSum[pid][3]+= buy;
        tSelSum[pid][4]+= won;
      } //end for i
    } //end for j

    var stb= '';
    stb+= '  NAME    $BUY     $WON      >$BAL<           #(gms)  %(buy)   %(won) \n'
        + '––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––\n';

    tSelSum.forEach(function(row)
    {
      row[5]= row[4] - row[3]*10;
      row[6]= c6Avg(row[3], row[2]);
      row[7]= c6Avg(row[4], row[2]);
    });

    tSelSum.sort(function(a, b) { return b[5] - a[5] });

    var pl= 0;
    for(var pid= 0; pid < tSelSum.length; pid++)
    {
      if(tSelSum[pid][2] > 0)
      {
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
             + '             '+ ('    '+ gms).slice(-4)
             + ('         '+ fCash(av6 *100)).slice(-9)
             + ('         '+ fCash(av7 *10)).slice(-9) +' \n';
      }
    }

    if(selHgm.length < 1)
      stb= "  [selected games balance]";

    document.getElementById('sumSg')
      .innerHTML= ('<pre id="selSum" style="font-size:15px; '
                   + 'padding:1px 12px">'+ stb +'</pre>');
   
    pl= 7+ (pl +1)*15;
    $('#selSum').css({height:pl+'px'});
  }

  var keepMsgBar= false;
  function rowAnim(tbrow, turnOn)
  {
    if(!turnOn)
    {
      $(tbrow).removeClass('already').removeClass('clean');
      if(listMode <= 1) $(tbrow).removeClass('selected');
      else $(tbrow).addClass('clean').removeClass('selected');
      
      if(curTab === 3) reclcSelHrows();
    }
    else
    {
      $(tbrow).removeClass('clean').addClass('selected');
      if(curTab === 3) reclcSelHrows();
    }
  }

  function resetEdit(formToo)
  {
    var selRows= $('#ptb')[0].getElementsByClassName('selected');
    $(selRows).removeClass('already').removeClass('clean');

    if(listMode > 1)
      $(selRows).addClass('clean').removeClass('selected');
    else
      $(selRows).removeClass('selected');

    if(!formToo) return;

    editRow= -1;
    document.getElementById("subBut").value= "New";
    $('input#in0').val(nextID+1);
    $('input#in1').val('');
    $('input#in2').val('');
    $('input#in3').val('');
    $('input#in4').val('');
    $('input#in5').val('');
  }


  // *** ---------- T I M E R  1st part----------------
  var btSec= 0;
  var btMin= 0;
  var ttMin= 0;
  var btState= 8;
  var sirenState= 0;

  function timeText(istt)
  {
    if(gameOver && !istt) return "ENTER";
 
    if(!istt)
    {
      var m= btMin, s= btSec;
      if(btSec >= 60) { m++; s= 0; }
      return ("00" +m).slice(-2) +":"+ ("00" +s).slice(-2);
    }
    else
    {
      var m= ttMin % 60, h= (ttMin -m) / 60;
      return ("00"+h).slice(-2) +":"+ ("00"+m).slice(-2);
    }

    return "??:!!";
  }

  function timerPaint(isBlack, inf)
  {
    var bt= document.getElementById("blindTimer");
    if(sirenState > 0 && inf === "!!!")
    {
      if( (sirenState === 1 && listMode !== 3)
         ||(sirenState === 2 && listMode === 3) )
      {
        inf= 'Alarm !!!';
        document.body.style.backgroundColor= "white";
      }
      else
      {
        inf= '!!! Alarm';
        document.body.style.backgroundColor = "black";
      }
      isBlack= (sirenState === 2);
    }

    if(listMode === 3)
      isBlack= !isBlack;

    switch(isBlack)
    {
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
      bt.innerHTML= timeText(false) +'<b id="timeTxt">'
                  + inf +'<br>'+ 'Game time '+ timeText(true) +'</b>';
 }

  var revSort= false;
  var initGanim= false;

  // *** tabs# redraw... *********************************************************
 
  function freshTab1()
  {
    var tscp= sortColP;

    if(tscp === 5) tscp= 2;
    else if(tscp > 1 && tscp < 5) tscp++;
     
    if(revSort)
      tPl.reverse();
    else
    if(tscp !== 1)
    {
      tPl.sort(function(a, b) { 
        if(tscp === 0) return a[tscp] - b[tscp]; else return b[tscp] - a[tscp]; });
    }
    else
    {
      tPl.sort(function(a, b)
      {
        if(b[tscp] > a[tscp]) return -1;
        else if(b[tscp] < a[tscp]) return 1; else return 0;
      });
    }

    rvsPLindex.length= tPl.length;

    var vpd= '15px 5px 12px 5px';
    if(vSpace > 10) vpd= '25px 5px 22px 5px';

    var cx= 0;
    nextID= 0;
    $("#ptb").empty();
    tPl.forEach(function(col)
    {
      rvsPLindex[ (+col[0]) ]= cx++;
      // ***  id  name  gms  $buy  $won  $bal  csh%  rnk%  total
      if(+col[0] > nextID) nextID= +col[0];
      $('#ptb').append(
         '<tr tabindex="1"><td class="admin">'+ col[0]
        +'</td><td style="padding:' + vpd
        +'; text-align:left">'+ col[1]
        +'</td><td>'+ ((col[2] === 0) ? ' ' : fCash(col[3]*1000))
        +'</td><td>'+ ((col[2] === 0) ? ' ' : fCash(col[4]*100))
        +'</td><td>'+ ((col[2] === 0) ? ' ' : fCash(col[5]*100))
        +'</td><td>'+ ((col[2] === 0) ? ' ' : col[2])
        +'</td><td>'+ ((col[2] === 0) ? ' ' : fCash(col[6]*100))
        +'</td><td>'+ ((col[2] === 0) ? ' ' : fCash(col[7]*100))
        +'</td></tr>');
    });

    $('#ptb>tr').addClass("clean");
    switch(listMode)
    {
      case 1: $('#ptb>tr').removeClass('clean');
        break; 
      case 2: $('#ptb>tr').css("border-top", "1px solid lightgrey");
        break;
      case 3: // plain, besic set in css '.clean'
    }

    // *** header
    $('#pth>tr').children().css({border:'none'});
    $("#pth>tr").children().eq(sortColP).css({border:'2px solid grey'});

    for(var i= 0; i < tPl.length; i++)
    {
      var pid= (+tPl[i][0]) - 1;
      if(tGm[pid][0] !== 'F')
        $('#ptb>tr').eq(i).removeClass('clean').addClass('selected'); 
     
      if(tGm[pid][0] === 'A')
        $('#ptb>tr').eq(i).addClass('already');
    }

    var dt = new Date();
    document.getElementById("lblDate1")
      .innerText= dt.toLocaleDateString('en-NZ',
                    {weekday:'long', year:'numeric', month:'long', day:'numeric'});
  }

  function yeMny(cnt)
  {   
    var mny= $('.money')[cnt];
    var nc=$('#gtb>tr').eq(cnt).children()[2];
    
    $(mny).css({border:'', background:'darkgreen', color:'',
                height:'', width:'', 'font-size':'', padding:''});

    nc.innerText= sortedPl[ +tGm[cnt][1] -1 ];
    $(nc).css({'text-align':'left', 'font-size':'', 'color':''});
    
    mny.parentNode.parentNode.cells[3].innerText= (tGm[cnt][2]= '-');
    mny.parentNode.parentNode.cells[4].innerText= (tGm[cnt][3]= '-');
  }
  
  function naMny(cnt)
  {
    var dd= '[OUT]';
    var mny= $('.money')[cnt];
    var nc=$('#gtb>tr').eq(cnt).children()[2];

    $(mny).css({border:'1px dashed grey',
                height:'24px', width:'50px',
                'font-size':'15px', 'padding-top':'4px',
                background:'none', color:'#909090'});

    if(+tGm[cnt][2] === 1) dd= '[1st]';
    else if(+tGm[cnt][2] === 2) dd= '[2nd]';

    nc.innerText+= ' ' +dd;
    if(+tGm[cnt][2] > 2)
      $(nc).css({'text-align':'center', 'font-size':'17px', 'color':'#909090'});
    else
      $(nc).css({'text-align':'right', 'font-size':'', 'color':''});
    
  }


  var curRank= 0;
  var reInit= false;
  function freshTab2()
  {
    var vpd= (vSpace > 10)? '25px 5px 22px 5px':'15px 5px 12px 5px';
    var cnt= 0;
    $('#gtb').empty();
    tGm.forEach(function(col)
    {
      var showStr= 'style="display:none"';
      if(reInit) { col[2]= '-'; col[3]= '-'; }
      if(editMode || col[0] === "T" || col[0] === "A") showStr= '';
      $('#gtb').append(
         '<tr '+ showStr +'><td class="admin" style="text-align:center">'+ col[0]
        +'</td><td class="admin" style="padding-right:20px">'+ col[1]
        +'</td><td tabindex="1" style="text-align:left; padding:'+ vpd + '">'+ sortedPl[ +col[1] -1 ]   
        +'</td><td style="text-align:center">'+ col[2]
        +'</td><td>'+ fCash(+col[3])
        +'</td><td tabindex="1" style="text-align:right">'+ fCash(+col[4] *1000)
        +'</td><td tabindex="1" style="padding:0; overflow:visible">'
        +'<pre class="mnyInfo"' +'> </pre>'
        +'<pre class="money">  $  </pre></td></tr>' );

      if(!reInit && +col[2] > 0) naMny(cnt);
      cnt++;
    });

    $('#timeSelect, #blindSelect')
      .css({filter:'', color:'black', 'background-color':'white'});
    $('#lblBank, #timeSelect, #blindSelect').css({'border-color':'black'});

    switch(listMode)
    {
      case 1: // empty, default defined in .css
      break;

      case 2:
        $('#gtb>tr').css("border-top", "1px solid lightgrey");
      break;

      case 3:
        $('#lblBank').css({'border-color':'white'});
        $('#gtb>tr').css("border-top", "1px solid grey");
        $('#timeSelect, #blindSelect').css({"filter":"invert(100%)"});
        $('#appFrame, #tab2').css({"color":"white", "background":"black"});
      break;
    }
  }


  var monthStr= ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  function freshTab3()
  {
    var srtCH= sortColH;
    if(sortColH === 7) srtCH= 8;

    if(revSort)
      tHiFull.reverse();
    else
    if(srtCH !== 4 && srtCH !== 6)
    {
      tHiFull.sort(function(a, b) {
        return b[srtCH] - a[srtCH]; });
    }
    else
    {
      tHiFull.sort(function(a, b)
      {
        if(b[srtCH] > a[srtCH]) return -1;
        else
          if(b[srtCH] < a[srtCH]) return 1;
        else
          return 0;
      });
    }


    var vpd= '15px 5px 12px 5px';
    if(vSpace > 10) vpd= '25px 5px 22px 5px';

    var cnt= 0;
    $('#htb').empty();
    tHiFull.forEach(function(col)
    {
      var showAdmin= '';
      if(!editMode) showAdmin= 'style="display:none"';
    
      var mon= +(''+col[0]).substring(4,6);
      var dtStr= (''+col[0]).substring(6,8)+" " 
               + monthStr[mon-1] + "`"+(''+col[0]).substring(2,4);

      $('#htb').append(
         '<tr tabindex="1"><td style="font-size:17px; text-align:center">'+ dtStr
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
    switch(listMode)
    {
      case 1: $('#htb>tr').removeClass('clean'); break;
      case 2: $('#htb>tr').css("border-top", "1px solid lightgrey"); break;
      case 3: break;
    }

    // *** header
    $('#hth>tr').children().css({border:'none'});
    $('#hth>tr').children().eq(sortColH).css({'border':'2px solid grey'});

    if(editMode)
    {
      $('#dtEdit').val('');
      $('.initDis').prop("disabled", true);
    }

    //freshCanvas();
    reclcSelHrows();
  }


  // *** clear state timeout
  var clrST, ssPend= false;

  // ***  SAVE STATE - - - - - - - - - -  
  function prtGm()
  {
    adminInfo.innerText+= '\n'
      + '[tGm]: 0    1   2      3      4 \n'
      + '      in?  id  rnk   $won   $buy \n'
      + '--------------------------------- \n';
   
    tGm.forEach(function(col)
    {
      adminInfo.innerText+=
          ('        '+ col[0]).slice(-8)
        + ('     '+ col[1]).slice(-5)
        + ('     '+ col[2]).slice(-5)
        + ('        '+ col[3]).slice(-7)
        + ('        '+ col[4]).slice(-7) +' \n';
    });
  }


  function loadState(isImport)
  { 
    if(!window.localStorage) {
      adminInfo.innerText+= 'FAIL:window.localStorage \n'; return; }
   
    //nBar.innerText= ''; clrNotif();
    var loDat= localStorage.getItem('gameState');
    
    if(!loDat)
    {
      adminInfo.innerText+= 'Game state empty, skip import \n';
      return;
    }
    else
      adminInfo.innerText+= 'Game state acquired: '+ loDat +'\n';

    if(isImport)
    {
      tGm.length= 0;
      loDat= loDat.split('|');
      loDat.forEach(function(row) {
        tGm.push( row.split(':') ); });

      tGm.forEach(function(col)
      {
        col[1]= +col[1]; col[4]= +col[4];
        col[2]= +col[2]; col[3]= +col[3];
      });

      nBar.innerText+= ' #game state imported';
      adminInfo.innerText+= 'Imported rows#: '+ tGm.length +'\n';
      prtGm();

      resetEdit(false);
      keepMsgBar= true;
      $('#mtb1').click();
    }
  }

  function saveState(isClear)
  {
    if(!window.localStorage) {
      adminInfo.innerText+= 'FAIL:window.localStorage \n'; return; }

    // nBar.innerText= ''; clrNotif();
    if(isClear)
    {
      localStorage.removeItem('gameState');
      adminInfo.innerText= "Game state cleared! \n";
      return;
    }

    var upDat= [];
//    upDat.length= 0;
    tGm.forEach(function(row)
    {
      if(row[0] !== 'F') row[0]= 'A';
      upDat.push( row.join(':') );
    });

    localStorage.setItem('gameState', upDat.join('|'));

    nBar.innerText+= ' #game state recorded';           
    adminInfo.innerText= "Game state recorded, rows#: "+ tGm.length +'\n';
    prtGm();
  }


  // *** GAME OVER *** *** *** *** *** *** *** *** *** *** *** *** ***
  function c6Avg(buy, nG)
  {
    var retVal= buy*10 / nG;
    if(isNaN(retVal)) retVal= -555;
    return Math.round(retVal);
  }

  function c7Avg(won, nG)
  {
    var retVal= won / nG;
    if(isNaN(retVal)) retVal= -444;
    return Math.round(retVal);
  }


  var useThisDate= 0;
  var gamePlayers= 0;
  var sortedRnk= [ [1, 2] ];

  var disMini= [ [ 0, 0, 0 ] ];
  var rx1= 0, rx2= 0; // table row for 1st & 2nd place

  function actSavG()
  {
    var cf1= +tGm[rx1][3], cf2= +tGm[rx2][3];
    $('#gtb>tr')[rx1].cells[4].innerText= fCash(cf1*100);

    var gdat= numCTD();
    if(useThisDate > 0) gdat= useThisDate;

    tPl.sort(function(a, b) { return a[0] - b[0] });
    var sortedMini= [ [0, 0, 0, 0, 0, 0] ]; 
    sortedMini.length= 0;

    var cnt= 0;
    tGm.forEach(function(col)
    {
      if(tPl[cnt][2] <= 0) {
        tPl[cnt][2]= tPl[cnt][3]= tPl[cnt][4]=
          tPl[cnt][5]= tPl[cnt][6]= tPl[cnt][7]= tPl[cnt][8]= 0; }

      if(+col[4] > 0)
      {
        sortedMini.push([ +col[2], +col[1], +col[4],
                         tPl[cnt][2], tPl[cnt][3], tPl[cnt][4] ]);

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

    sortedMini.sort(function(a, b) { return a[0] - b[0] });

    cnt= 0;
    var upGm= "0:0:0:0:0";
    sortedMini.forEach(function(col)
    {
      if(useThisDate > 0)
        upGm+= ':'+ col[1] +':'+ col[2] +':'
          + disMini[cnt][0]+':'+ disMini[cnt][1] +':'+ disMini[cnt][2];
      else
         upGm+= ':'+ col[1] +':'+ col[2] +':'+ col[3] +':'+ col[4] +':'+ col[5];

      cnt++;
    });

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
  }

  function finalSave()
  {
    var cf1= +tGm[rx1][3], cf2= +tGm[rx2][3];

    if(isNaN(cf1) || isNaN(cf2) || cf2 < 0 
       || cf1 < cf2 || cf1 < bankTotal*5 || cf1 > bankTotal*10)
    {
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
    wfT.innerHTML= '<input type="tel" autocomplete="off" '
      +'style="text-align:right; padding:2px 9px; margin:-5px">';       
  
    var wf= wfT.firstChild;

    $(wf).css({border:'1px solid gold', width:'90%'});
    
    $(wf).off();
    $(wf).on('focus', function(e)
    {
      if(!e || e.defaultPrevented) return;
      e.preventDefault();e.stopPropagation();
  
      tGm[rx1][3]= 0;
      tGm[rx2][3]= 0;

      this.value= "00";
      this.setSelectionRange(0, 0);
      $('#gtb>tr')[rx2].cells[4].innerText= "???";
    });

    $(wf).on("keydown", function(e)
    {
      if(!e || !e.which || e.defaultPrevented) return;
      e.stopPropagation();

      if(e.which === 13 || e.which === 9)
      {
        e.preventDefault();
        finalSave();
      }
    });

    $(wf).on("keyup", function(e)
    {
      if(!e || !e.which || e.defaultPrevented) return;
      e.preventDefault(); e.stopPropagation();

      var w1Typ= e.target;
      var w2Typ= $('#gtb>tr')[rx2].cells[4];

      var wf1, wf2;
      var nsf= (w1Typ.value.replace(/,/g, ''));

      if(e.which === 8 || isNaN(nsf)
         || +nsf <= 0 || nsf === "00")
      {
        tGm[rx1][3]= 0;
        tGm[rx2][3]= 0;

        this.value= "00";
        this.setSelectionRange(0, 0);
        w2Typ.innerText= "???";

        return;
      }

      if(nsf > 99) nsf/= 100;

      wf1= parseInt(nsf, 10);
      wf2= bankTotal*10 - wf1;

      tGm[rx1][3]= wf1;
      tGm[rx2][3]= wf2;
      w1Typ.value= fCash(wf1*100);
      w2Typ.innerText= fCash(wf2*100);
      w1Typ.setSelectionRange(w1Typ.value.length-2,
                              w1Typ.value.length-2);
    });

    gameOver= true;

    btState= 0; sirenState= 0;
    timerPaint(false, 'Click to SAVE');

    wf.focus();
  }


  var lastNotif= '';
  function clrNotif() {
    lastNotif= nBar.innerText; nBar.innerText= ""; }

  // *** main redraw function ***************************************
  var lastTab= 0;
  var dontInit= false;
  var initOnceG= false;
  
  function reFresh()
  {
    var ttxt= "Party Mix";
    if(!navigator.onLine) ttxt= "OFFLINE";
    document.getElementById("mtb1").value = ttxt;

 
    if(!initOnceG || (!dontInit && editMode && curTab !== 2))
    {
      initGanim= !initOnceG && !editMode;
      initOnceG= true; resetEdit( false );

      tGm.length= 0;
      sortedPl.length= 0;

      tPl.sort(function(a, b) { return a[0] - b[0] }); 
      tPl.forEach(function(col)
      {
        if(col[2] < 1) {
          col[5]= col[6]= col[7]= col[8]= -900 - col[0]; }

        tGm.push([ 'F', +col[0], '-', '-', 0 ]);
        sortedPl.push( col[1] );
      });

      var cnt= 0;
      tHiFull.length= 0;
      tHi.sort(function(a, b) { return b[0] - a[0] });

      tHi.forEach(function(col)
      {
        var miniGm= col[4].split(':');
        tHiFull.push([
          +col[0], +col[1], +col[2],
          +col[3],
          sortedPl[ +miniGm[5]-1 ],
          (+col[2]*10) - (+col[3]),
          sortedPl[ +miniGm[10]-1 ],
          col[4], cnt++
        ]);
      });
    }
    else
    if(!keepMsgBar && useThisDate < 1 && nBar.innerText.length > 1) {
      setTimeout( function() { clrNotif(); }, 350); }

    var selRows= $('#ptb')[0].getElementsByClassName('selected');

    for(var i= 0; i < selRows.length; i++)
    {
      var pid= +(selRows[i].firstChild.innerText) -1;
      if(parseInt(tGm[pid][4], 10) < 1) {
        tGm[pid][4]= 0; tGm[pid][0]= "T"; }
      else
        tGm[pid][0]= "A";
    }

    sortedRnk.length= 0;
    tGm.forEach(function(col)
    {
      if(col[0] !== "T" && col[0] !== "A") {
        col[0]= "F"; col[2]= '-'; col[3]= '-'; col[4]= 0; }
      else
      if(!isNaN(col[2]))
        sortedRnk.push([ +col[2], +col[1] ]);
    });


    // ☆☆☆ this all over the place, sort out later
    $('#appFrame, #tab2') //, #gameTable tr
      .css({"color":"black", "background":"white"});

    if(lastTab === 2 && curTab !== 2) {
      if(--listMode < 1) listMode= 3; }
    else
    if(lastTab !== 2 && curTab === 2) {
      if(++listMode > 3) listMode= 1; }

    if(curTab === 2)
      timerPaint((btState === 1), '***');

    // *** tab switch
    switch(curTab)
    {
      case 1: freshTab1(); break;
      case 2: freshTab2(); break;
      case 3: freshTab3(); break;
    }

    if(editMode)
    {
      if(curTab === 1) resetEdit(true);
      $(".admin").css("display", "table-cell");
    }
    else
      $(".admin").css("display", "none");

    if(useThisDate < 1) editRow= -1;

    if(reInit) gameOver= false;
    if(curTab === 2 && gameOver) mnySplit();

    dontInit= keepMsgBar= false;
   
    if(lastTab === 2 && ssPend) {
      clearTimeout(clrST); saveState(false); ssPend= false; }

    lastTab= curTab;
  }

  // *** END REFRESH *****************************************


  function backAnim(rx)
  {
    var iRnk= +tGm[rx][2];
    if(!editMode && useThisDate === 0 && iRnk > curRank+1)
    {
      audQuack.currentTime= 0; audQuack.play();
      return;
    }
    
    if(gameOver)
    {
      gameOver= false;
      timerPaint(false, 'Click to START');
      
      var wf= $('#gtb>tr')[rx].cells[4];
      $(wf.firstChild).off();
    }
   
    curRank++;
    yeMny(rx);
  }

  function outAnim(rx)
  {
    if(curRank === 2) rx2= rx;
    else if(curRank === 1) rx1= rx;

    var mny= $('.money')[rx];
//    mny.previousSibling.innerText= '';
    mny.parentNode.parentNode.cells[3].innerText= (tGm[rx][2]= curRank--);
    
    naMny(rx);
   
    // *** GAME OVER
    if(curRank === 0)
      mnySplit();
  }

  $('#gameTable').click(function(e)
  {
    if(!e || e.defaultPrevented) return;
    e.preventDefault(); e.stopPropagation();

    if(e.target.parentNode.rowIndex === 0) return;

    clrNotif();
    var lmy= document.getElementsByClassName('money');

    ssPend= true;
    clearTimeout(clrST);
    clrST= setTimeout(function()
    {
      saveState(false); ssPend= false;
      for(var i= 0; i < lmy.length; i++) {
        $(lmy[i].previousSibling).css({'font-size':'15px'}); } 
    }, 4000);

    if(e.target.className === "money" || e.target.cellIndex > 5)
    {
      var mny= (e.target.className === "money" ) ?
          e.target : e.target.firstChild.nextSibling;
      
      var rx= mny.parentNode.parentNode.rowIndex -1; 

      if(e.target.className === "money"
        && +tGm[rx][2] > 0) { backAnim(rx); return; }

      for(var i= 0; i < lmy.length; i++)
      {
        if(i !== rx)
        {
          //lmy[i].previousSibling.innerText= '';
          $(lmy[i].previousSibling).css({'font-size':'15px', color:'grey'});
        }
      }

      var mif= mny.previousSibling;
      var nim= +(mif.innerText.substring(1, mif.innerText.length-1));

      if($(mif).css('font-size') !== '19px')
        mif.innerText= '+1k';
      else
      if(mif.innerText[0] === '+')
        mif.innerText= '+'+ (nim+1) +'k';

      if(listMode !== 3)
        $(mif).css({'font-size':'19px', color:'black'});
      else
        $(mif).css({'font-size':'19px', color:'white'});

      mny.parentNode.previousSibling
        .innerText= fCash(1000* (tGm[rx][4]= +tGm[rx][4] +1));

      bankTotal++;
      document.getElementById('lblBank')
        .innerText= 'Bank: $'+ fCash(bankTotal*1000);
    }
    else
    if(e.target.cellIndex < 2)
    {
      var rx= e.target.parentNode.rowIndex-1;
      if(tGm[rx][0] !== 'F')
      {
        e.target.parentNode.firstChild.innerText= tGm[rx][0]= 'F';
        $(e.target.parentNode).children()[5].innerText= tGm[rx][4]= 0;
      }
      else
      {
        $('.money').eq(rx).click();
        e.target.parentNode.firstChild.innerText= tGm[rx][0]= 'T';
      }
    }
    else
    if(e.target.cellIndex === 2 || e.target.cellIndex === 3)
    {
      var rx= e.target.parentNode.rowIndex-1;

      if(+tGm[rx][2] > 0)
        backAnim(rx);
      else
      {
        if(e.target.cellIndex === 3)
          outAnim(rx, e.target);
        else
          outAnim(rx, e.target.nextSibling);
      }
    }
    else
    if(e.target.cellIndex === 5)
    {
      if(e.target.innerText === "1,000") {
        audQuack.currentTime= 0; audQuack.play(); return; }

      var rx= e.target.parentNode.rowIndex-1;
      var mny= e.target.nextSibling.firstChild.nextSibling;

      for(var i= 0; i < lmy.length; i++)
      {
        if(i !== rx)
        {
          //lmy[i].previousSibling.innerText= '';
          $(lmy[i].previousSibling).css({'font-size':'15px', color:'grey'});
        }
      }

      mny.previousSibling.innerText=  '-'+ (tGm[rx][4] -1) +'k';

      if(listMode !== 3)
        $(mny.previousSibling).css({'font-size':'18px', color:'black'});
      else
        $(mny.previousSibling).css({'font-size':'18px', color:'white'});

      bankTotal-= tGm[rx][4] -1;
      document.getElementById('lblBank')
        .innerText= 'Bank: $'+ fCash(bankTotal*1000);
      
      e.target.innerText= fCash(1000* (tGm[rx][4]= 1));
    }
    else {
/*     
    alert("v.0.3" 
          + "\n this: " + this
          + "\n this.className: " + this.className
          + "\n e.type: " + e.type
          + "\n e.eventPhase: " + e.eventPhase
          + "\n e.bubbles: " + e.bubbles
          + "\n e.defaultPrevented: " + e.defaultPrevented
          + "\n e.target: " + e.target
          + "\n e.currentTarget: " + e.currentTarget
          );
*/
    }
  });

  $('#playerTable').click(function(e)
  {
    if(!e || e.defaultPrevented) return;
    e.preventDefault(); e.stopPropagation();

    if(!gameOver && nBar.innerText.length > 1) clrNotif();

    var trx= e.target.parentNode.rowIndex;

    if(trx === 0)
    {
      if(sortColP === e.target.cellIndex)
        revSort= !revSort;
      else 
        revSort= false;

      sortColP= e.target.cellIndex;
      dontInit= true;
      reFresh();
    }
    else
    {
      var rtg= e.target.parentNode;
      if(trx === undefined) rtg= e.target;

      trx= rtg.rowIndex;
      var pid= parseInt($('#ptb>tr')[trx-1].firstChild.innerText, 10) -1;

      if($(rtg).hasClass('selected'))
      {
        if(tGm[pid][0] === 'A' || tGm[pid][0] === 'B')
          tGm[pid][0]= 'B'; else tGm[pid][0]= 'F';

        if(editMode)
          resetEdit(true);
        else
          rowAnim(rtg, false);
      }
      else
      {
        if(editMode)
        {
          resetEdit(false);
          document.getElementById("subBut").value= "Edit";

          editRow= trx -1;
          $('input#in0').val( tPl[editRow][0] );
          $('input#in1').val( tPl[editRow][1] );
          $('input#in2').val( tPl[editRow][3] );
          $('input#in3').val( tPl[editRow][4] );
          $('input#in4').val( tPl[editRow][2] );
        }
        rowAnim(rtg, true);
        if(tGm[pid][0] === 'B')
          $(rtg).addClass('already');
      }
    }
  });


  // *** $('#historyTable') ****************************

  //firefox fix
  function firefoxFix()
  {
    if($('#hth>tr').children()[sortColH].style.borderColor === 'grey')
      $('#hth>tr').children().eq(sortColH).css({'border-color':'rgb(128, 128, 127)'});
    else
      $('#hth>tr').children().eq(sortColH).css({'border-color':'grey'});
  }

  // ☆☆☆ subRow-content - REMOVE
  function subrowDelete(etpn)
  {
    if(editMode)
    {
      editRow= -1; $('#dtEdit').val('');
      $('.initDis').prop("disabled", true);
    }    
    rowAnim(etpn.previousSibling, false);
    $(etpn).remove(); firefoxFix();
  }

  //hit.onclick= 
  $('#historyTable').click(function(e)
  {
    if(!e || e.defaultPrevented) return;
    e.preventDefault(); e.stopPropagation();

    if(!gameOver && nBar.innerText.length > 1) clrNotif();

    var etpn= e.target.parentNode;
    if(etpn.rowIndex === 0)
    {
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

    if($(etpn).hasClass('already')
       && !($(etpn).hasClass('selected'))) return;
    
    if($(etpn).hasClass('extra')) {
      subrowDelete( etpn ); return; }
    
    if($(etpn.parentNode).hasClass('extra')) {
      subrowDelete(etpn.parentNode); return; }
    
    if($(etpn).hasClass('selected')) {
      subrowDelete(etpn.nextSibling); return; }

    if(etpn.rowIndex === undefined)
      etpn= e.target;


    // ☆☆☆ subRow-content - CREATE ***********************   
    var cx, ri= +$(etpn).children()[8].innerText;
    var selRows= $('#htb')[0].getElementsByClassName('selected');

    if(editMode)
    {
      $(selRows).children().eq(3).click();
      $('#dtEdit').val( tHiFull[ri][0] );
    }

    $(etpn).addClass('already');

    var dtCode= tHiFull[ri][0].toString();
    var mon= +dtCode.substring(4,6);
    var dtStr= dtCode.substring(6,8)
              +' '+ monthStr[mon-1]
              +' '+ dtCode.substring(0,4)
              +' @ '+ dtCode.substring(8,10)
              +':'+ dtCode.substring(10,12);

    var scd= '';
    scd+= ' RANK  NAME       $BUY     $WON \n'
        + '––––––––––––––––––––––––––––––––                  '+ dtStr +'\n';
   
    var miniGm= tHiFull[ri][7].split(':');
    for(var i= 5; i < miniGm.length; i+= 5)
    {
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
          + ('       '+ (buy+'k')).slice(-7) 
          + ('          '+ wons).slice(-9) +' \n';
    } //end for

    var ctes= 'style="color:white; background:black"';
    if(listMode === 2)
      ctes= 'style="color:black; background:white"';
    else
    if(listMode === 3)
      ctes= 'style="color:black; background:#f0f0f0"';
    else
    if(editMode && vSpace > 10)
      ctes= '';

    $(etpn).after('<tr class="extra"'+ ctes +'><td colspan='
                  + (editMode?8:7) +'><pre style="height:'
                  + ((+tHiFull[ri][1] +4)*15) +'px; '
                  + 'padding:9px 10px; margin:0; '
                  + 'text-align:left; font-size:14px">'
                  + scd +'</pre></td></tr>');

    rowAnim(etpn, true);
    firefoxFix();
   
    if(editMode)
    {
      editRow= etpn.rowIndex -1;
      $('.initDis').prop("disabled", false);
    }
//    $(etpn.nextSibling).focus();
  });

  
  function zipN(s)
  {
    var i, t, r= '', a= s.toString(10);
    for(i= 0; i < a.length-2; i+= 2) {
      t= +a.substr(i, 2); r+= (t).toString(36); }
    t= ~~(+a.substr(i, 2) /2); r+= (t).toString(36);
//    t= ~~(+a.substr(i +2, 2) /2); r+= (t).toString(36);
    return r;
  }

  function uzpN(a)
  {
    var i, r= '';
    for(i= 0; i < a.length-1; i++) {
      r+= ('00'+ parseInt(a.charAt(i), 36)).slice(-2); }
    r+= ('00'+ (2*parseInt(a.charAt(i +0), 36))).slice(-2);
//    r+= ('00'+ (2*parseInt(a.charAt(i +1), 36))).slice(-2);
    return +r;
  }
  
  // *** import... **************************************************
  function importDB(data)
  {
    initOnceG= false;

    // *** 1st part - players data
    var gmHistory= data[1];
    data= data[0].split('|');

    if(!data) {
      nBar.innerText+= ' #no cache data X'; return; }

    var nCol= 6;
//    tPl.length = 0;
    tPl= [];
    for(var i = 0; i < data.length / nCol; i++)
    {
      var nbrs= [ parseInt(data[i*nCol +0], 10), 0,
                 parseInt(data[i*nCol +2], 10), parseInt(data[i*nCol +3], 10),
                 parseInt(data[i*nCol +4], 10), parseInt(data[i*nCol +5], 10) ];
       
      var bal= nbrs[4] - nbrs[3]*10;
      var col6= c6Avg(nbrs[3], nbrs[2]);
      var col7= c7Avg(nbrs[4], nbrs[2]);     
      var totl= col6 + col7;

      if(parseInt(data[i*nCol +0], 10) > 0)
      {
        if(nbrs[2] === 0) 
          bal= col6= col7= totl= -900 -nbrs[0];

        tPl.push( [ +data[i*nCol +0], data[i*nCol +1], nbrs[2], 
                     nbrs[3], nbrs[4], bal, col6, col7, totl ] );
      }
    }
          

    // *** 2nd part - games history data

    if(!gmHistory) {
      nBar.innerText+= ' #no cache data Y'; return; }

    nCol= 5;
    data= gmHistory.split('|');

    tHi.length= 0;
    for(var i = 0; i < data.length / nCol; i++)
    {
      if(+data[i*nCol +2] > 0)
      {
        var x= uzpN(data[i*nCol +0]);
//        var x= parseInt(data[i*nCol +0], 36);
        
        tHi.push([
          x, +data[i*nCol +1], +data[i*nCol +2], 
          +data[i*nCol +3], data[i*nCol +4] ]);
      }
    }

    var d= localStorage.getItem('dataBase');
    if(!d || d.length < 9)
      saveDB(true);
    
    reFresh();
    loadState(true);
  }

  function cchInfo()
  {
    adminInfo.innerText+= "Cache info.v9 -- \n";
    
    var t= ':window.caches \n';
    if(window.caches)
    {
      adminInfo.innerText+= 'PASS' +t;
      caches.keys().then(function(cacheNames)
      {
        cacheNames.forEach(function(cacheName)
        {
          caches.open(cacheName).then(function(cache)
          {
            return cache.keys(); 
          }).then(function(reqs)
          {
              var strOut= "Cache data files: \n";
              reqs.forEach(function(rs, i)
              {
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
      adminInfo.innerText+= 'FAIL' +t;
    
    t= ':navigator.storage \n';
    if(navigator.storage)
    {
      adminInfo.innerText+= 'PASS' +t;
      
      t= ':navigator.storage.estimate \n';
      if(navigator.storage.estimate)
      {
        adminInfo.innerText+= 'PASS' +t;
  /*
        not suported in a way to break the code, why?
        navigator.storage.estimate()
        .then(({usage, quota}) => {
        adminInfo.innerText+= "Usage: "+ (usage/1048576)
        .toFixed(2) +"MB out of "+ (quota/1048576).toFixed(2) +"MB. \n";
        });     
  */
      }
      else
        adminInfo.innerText+= 'FAIL' +t;

      t= ':navigator.storage.persist \n';
      if(navigator.storage.persist)
      {
        adminInfo.innerText+= 'PASS' +t;
        
        navigator.storage.persisted().then(function(getP) {
          adminInfo.innerText+= "Persistence: "+ getP +'\n'; });
      }
      else
        adminInfo.innerText+= 'FAIL' +t;
    }
    else
      adminInfo.innerText+= 'FAIL' +t;


    t= ':navigator.serviceWorker \n';
    if(navigator.serviceWorker)
      adminInfo.innerText+= 'PASS' +t;
    else
      adminInfo.innerText+= 'FAIL' +t;

    t= ':navigator.webkitPersistentStorage \n';
    if(navigator.webkitPersistentStorage)
      adminInfo.innerText+= 'PASS' +t;
    else
      adminInfo.innerText+= 'FAIL' +t;

    adminInfo.innerText+= '\n';
  }

  function loadCache(isImport)
  {
    nBar.innerText= ''; clrNotif();
    adminInfo.innerText= versionCode;
    
    cchInfo();
    if(!window.localStorage) {
      adminInfo.innerText+= 'FAIL:window.localStorage \n'; return; }
    else
      adminInfo.innerText+= 'USING:window.localStorage \n';
   
    var t, d= localStorage.getItem('dataBase');

    if(!d) {
      nBar.innerText+= ' #no cache data '; return; }

    if(isImport)
    {
      importDB(d.split('@'));
      adminInfo.innerText+=  'import@loadCache: \n';
    }
    else
      adminInfo.innerText+=  'show@loadCache: \n';

    d= d.split('@');
    t= d[1];
    if(!(d= d[0])) {
      nBar.innerText+= ' #no cache data B'; return; }

    d= d.split('|');
    if(!t) { nBar.innerText+= ' #no cache data C'; return; }

    d= t.split('|');
    adminInfo.innerText+=
        'TIMESTAMP     NAME         $BUY     $WON \n'
      + '––––––––––––––––––––––––––––––––––––––––––\n';

    var n= 5;
    for(var i = 0; i < d.length/5; i++)
    {
      var x= uzpN(d[i*n +0]);
      var r= [ x, +d[i*n +1], +d[i*n +2], +d[i*n +3], d[i*n +4] ];
//      adminInfo.innerText+= i+'. >'+r.toString()+'<\n';
      if(r[2] <= 0) continue;

      var g= '';
      var dat= r[0];
      var miniGm= r[4].split(':');

      for(var j= 5; j < miniGm.length; j+= 5)
      {
        var nam= sortedPl[+miniGm[j +0]-1];
        var buy= +miniGm[j +1];

        var won= 0;
        if(j/5 === 1) won= r[3]; // $:1
        else if(j/5 === 2) won= r[2]*10 - r[3]; // $:2


        g+= (dat +'               ').substring(0, 14) +' '
          + (nam +'            ').substring(0, 9)
          + ('         '+ buy*1000 ).slice(-8)
          + ('         '+ won*100 ).slice(-9) +'\n';
      }

      adminInfo.innerText+= g +'\n';
    }
  }


  function loadServer()
  {
        adminInfo.innerText+= 'SERVER:load & import \n';
        
        tHi.length= 0;
        tHiFull.length= 0;
        
        $.ajax(
        {
          url:appPath +'/lod', type:'GET',
          error:function(e, f)
          {
            adminInfo.innerText+= '*** FAIL: '+ f +'\nLoading cache then... \n';
            nBar.innerText+= ' #server load fail: '+ f;
            
            loadCache(true);
            $("#mtb4").click();
          },
          success:function(r, s, x)
          {
            var d= r;//r.replace(/\n|\r/g, '');
            nBar.innerText+= ' #server load done';
            adminInfo.innerText+= 'DONE:server load '+ (d.length/1024).toFixed(2) +' KB \n';
            adminInfo.innerText+= x.getAllResponseHeaders() +'\n';

            importDB(d.split('@'));
          }
        });
  }

  
  function logMe()
  {
    nBar.innerText= ''; clrNotif();
    adminInfo.innerText= versionCode;
    
    $.ajax(
    {
      url:appPath +'/lgn', type:'GET',
      headers:{'secret':dbPass},
      error:function(e)
      {
        nBar.innerText+= ' #server logme fail: '+ e.statusText;
      },
      success:function(r, s, x)
      {
        if(r !== 'pOkk') {
          nBar.innerText+= ' #server says '+ r; return; }

        nBar.innerText+= ' #server logme done';
        adminInfo.innerText+= 'SERVER:logme \n';               
        adminInfo.innerText+= x.getAllResponseHeaders() +'\n';
        
        isLogged= true;
        $('#log4But').css({background:'none', 'box-shadow':'none'});
        $('#log4But').val("Logged"); $('#pasIn').css({display:'none'});
      }
    });
  }

  
  function saveDB(cchOnly)
  {
    initOnceG= false;
//    nBar.innerText= ''; clrNotif();
    adminInfo.innerText= versionCode;

    var upData= "0|export-init|0|0|0|0";
    var upHistory= "@99|2|0|0|0:0:0:0:0:1:1:1:1:1:2:2:2:2:2";

    tPl.forEach(function(col) {
        upData+= '|'+ col[0] +'|'+ col[1]+'|'+ col[2]+'|'+ col[3] +'|'+ col[4] +'|'+ '#'; });

    tHi.forEach(function(col) {
      var x= zipN(+col[0]);
      upHistory+= '|'+ x +'|'+ col[1] +'|'+ col[2] +'|'+ col[3] +'|'+ col[4]; });

    upData+= upHistory;

    // *** CACHE SAVE
    adminInfo.innerText+= 'CACHE:save \n';

    if(!window.localStorage) {
      adminInfo.innerText+= 'FAIL:window.localStorage \n'; return; }
    else
      adminInfo.innerText+= 'USING:window.localStorage \n';

    localStorage.setItem('dataBase', upData);

    nBar.innerText+= ' #cache save done';
    adminInfo.innerText+= 'DONE:cache save '+ (upData.length/1024).toFixed(2) +' KB \n';


    if(cchOnly) return;
      
    if(!navigator.onLine) {
      nBar.innerText+= ' #navigator offline, save cache only'; return; }
    else
    if(!isLogged) {
      nBar.innerText= ' #must be logged to update server database'; return; }
    

    // *** SERVER SAVE
    adminInfo.innerText+= 'SERVER:export & save \n';

    $.ajax(
    {
      url:appPath +'/sav', data:upData, type:'POST',
      headers:{'secret':dbPass},
      error:function(e, f)
      {
        nBar.innerText+= ' #server save fail: '+ f;
      },
      success:function(r, s, x)
      {
        if(r.substring(0,4) !== 'size')
        {
          nBar.innerText+= ' #server says '+ r;
          return;
        }

        adminInfo.innerText+= x.getAllResponseHeaders() +'\n';
        nBar.innerText+= ' #server save done '+ r.substring(5);
      }
    });
  }

  function loadDB()
  {
    nBar.innerText= ''; clrNotif();
    adminInfo.innerText= versionCode;
/*
    var br= 20180628011633;
    adminInfo.innerText+= br+'\n';
    
    var q1= zipN(br);
    adminInfo.innerText+= q1+'\n';
    
    var q2= uzpN(q1);
    adminInfo.innerText+= q2+'\n';
  
    return;
*/    

    if(!navigator.onLine)
    {
      nBar.innerTex+= ' #navigator offline, load cache';
      loadCache(true);
      $("#mtb4").click();
      return;
    }

    loadServer();
  }



  // *** action starts here *********************************
  loadDB();
  
                            
  if(navigator.storage)
  {
    navigator.storage.persisted().then(function(getP)
    {
      if(getP)
      {
        $('#gpc4But').val("Persistance Granted");
        $('#gpc4But').css({background:'none',
                           color:'black', 'box-shadow':'none'});
      }
    });
  }


  function initBuyin(plNo)
  {
    gamePlayers++;
    if(plNo < 0)
    {
      plNo= -(plNo +100);
      bankTotal+= tGm[plNo][4];
      document.getElementById('lblBank')
        .innerText= 'Bank: $'+ fCash(bankTotal*1000);
    }
    else
      $('.money').eq(plNo).click();
    
    tGm[plNo][0]= 'r';
  }


  // *** tab buttons listener ********************************
  var initOnceA= false;
  $(".mtb").click(function(e)
  {
    e.stopPropagation();
    if(!initOnceA) { //audQuack.load();
      initOnceA= true; audQuack.play(); }

    $(".mtb").removeClass("act dea").addClass("dea");
    $(this).removeClass("dea").addClass("act");

    $(".ptab").removeClass("pac pde").addClass("pde");
    var tid= "#tab"+ (this.id).substring(3,4);
    $(tid).removeClass("pde").addClass("pac");

    curTab= 0;
    if(editMode) {
      editMode= false; $('.adminEdit').css('display', 'none'); }

    if(tid === "#tab2")
    {
      curTab= 2;
       
      reInit= true;
        reFresh(); reInit= false;

      gamePlayers= 0;
      sortedRnk.sort(function(a, b) { return b[0] - a[0] });

      var dt = new Date();
      document.getElementById("lblDate")
        .innerText= (useThisDate) ? useThisDate :
        dt.toLocaleDateString('en-NZ', {weekday:'long', year:'numeric',
                                        month:'long', day:'numeric'});

      curRank= 0; bankTotal= 0;
      document.getElementById('lblBank').innerText= 'Bank: $'+ fCash(bankTotal*1000);

      for(var i= 0; i < tGm.length; i++)
      {
        if(tGm[i][0] === "T") { curRank++; initBuyin(i); }
        if(tGm[i][0] === "A") { curRank++; initBuyin(-(i+100)); }
      }

      for(var i= 0; i < sortedRnk.length; i++)
      {
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


  // *** ---------- T I M E R  2nd part ----------------
  var tsAdmin= 1000;  
  function minuteUp()
  {
    if(btState !== 1) return;
   
    // *** bigger step to save battery, update every 5sec?
    if(--btSec <= 0) {
      btSec= 60; btMin--; ttMin++; }
    
    if(editMode)
    {
      if((curTab === 2 && listMode === 3) || (curTab !== 2 && listMode === 2))
      {
        btSec= 60; ttMin++; btMin--; 
      }
      else
      if((curTab === 2 && listMode === 1) || (curTab !== 2 && listMode === 3))
      {
        btSec= 60; if(ttMin > 0)ttMin--; btMin--;
      }
    }

    if(btMin < 0)
    {
      //btMin= 0;
      var cn= 1+ parseInt($('#blindSelect').val(), 10);

      if(cn > 15) cn= 15;
      $('#blindSelect').val(cn);
      btState= 2; $('#blindTimer').click();
    }
    else
      setTimeout( minuteUp, editMode ? tsAdmin:1000);

    timerPaint(true, 'Click to PAUSE');
  }

  function bkgSiren()
  {
    if(sirenState === 0) return;
    audQuack.currentTime= 0; audQuack.play();   
  
    timerPaint(true, '!!!');
    setTimeout(bkgSiren, 700);
    sirenState= (sirenState === 1) ? 2:1;
  }
  
  function btInit()
  {
    var ni= ($('#timeSelect :selected').text()).indexOf('min');
    var ts= ($('#timeSelect :selected').text()).substring(0, ni);
    btSec= 60; btMin= parseInt(ts, 10) -1;
  }

  $('#blindTimer').click(function(e)
  {
    if(gameOver) {
      finalSave(); return; }
         
    if(btState === 0) btState= 1;
    else if(btState === 1) btState= 0;

    switch(btState)
    {
      case 0:
      case 9:
        if(btState === 9)
        {
          btState= 0; sirenState= 0; btInit();
          if($('#wlBut').val() === "WL enabled")
            document.body.style.backgroundColor = "#333333";
          else
            document.body.style.backgroundColor = "#777777";
        }
        timerPaint(false, 'Click to START');
      break;
       
      case 8:
      case 1:
        if(btState === 8) { btState= 1; btInit(); }
        tsAdmin= (listMode === 2) ? 90:700;
        timerPaint(true, 'Click to PAUSE');
        setTimeout( minuteUp, editMode ? tsAdmin:1000);
      break;
       
      case 2:
        btState= 9; sirenState= 1;
        if(curTab != 2) $('#mtb2').click();
        setTimeout(bkgSiren, 950);
      break;
    }
  });
  
  $('#timeSelect').on('focus change',function()
  {
    if(btState !== 0) return;
    var ni= (this.options[this.selectedIndex].text).indexOf('min');
    var ts= (this.options[this.selectedIndex].text).substring(0, ni);

    timerPaint(false, 'Click to START');
    btSec= 60; btMin= parseInt(ts, 10) -1;
  });


  // *** BUTTONS #################################################
  // *** .........................................................
  $("#mnu1").click(function(e)
  { // star A.
    e.stopPropagation();
    if(useThisDate > 0)
     alert('Game modification in progress, sooo?');

    revSort= false;
    if(editMode= !editMode)
    {
      if(curTab === 1) sortColP= 0;
      else if(curTab === 3) sortColH= 7;     
      $('.adminEdit').css('display', 'block');
    }
    else
    {
      //initOnceG= false;
      if(curTab === 1) sortColP= 4;
      else if(curTab === 3) sortColH= 0;
      $('.adminEdit').css('display', 'none');
    }
    reFresh();
  });
  
  $("#mnu2").click(function(e)
  { // arrow B.
    e.stopPropagation();
    vSpace= (vSpace > 10) ? 10:20;    
    dontInit= true; reFresh();
  });
   
  $("#mnu3").click(function(e)
  { // line C.
    e.stopPropagation();   
    if(++listMode > 3) listMode= 1;    
    dontInit= true; reFresh();
  });

  $("#headbar").click(function() {
    nBar.innerText= lastNotif; });


  // *** INPUT TEXT FIELD ...............................
  $(".finf").on('focus', function(e)
  {
    e.preventDefault();
    e.stopPropagation();

    this.select();
  });

  $(".finf").on('keydown', function(e)
  {
    if(!e || !e.which || e.defaultPrevented) return;
    e.stopPropagation(); // move to bottom?
    
    if(e.which === 9 || e.which === 13)
    {
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
    }
  });
  
  $("#frmInput").submit(function(e)
  {
    if(e.defaultPrevented) return;
    e.preventDefault(); e.stopPropagation();
   
    if(editRow >= 0)
      tPl.splice(editRow, 1); //delete, then add normaly = edit

    var col0 = $('input#in0').val();
    var col1 = $('input#in1').val();
   
    var col3 = +$('input#in2').val();
    var col4 = +$('input#in3').val();
    var col2 = +$('input#in4').val();
   
    var bal= col4 - col3*10;
    var col6= c6Avg(col3, col2);
    var col7= c7Avg(col4, col2);
    var totl= col6 + col6;

    if(col2 < 1) bal= col6= col7= totl= -900 -col0;
    tPl.push([ col0, col1, col2, col3, col4, bal, col6, col7, totl ]);
    reFresh();
  });


  // *** TAB 1 : ADMIN BUTTONS ***************************************
  // *** -------------------------------------------------------------
  
  // *** tab1-class="ord2" : DARK BOTTOM BUTTON
  $("#raz1But").click(function()
  { //>Reset All to Zero<
    tPl.forEach(function(col)
    {
      col[2]= col[3]= col[4]=
        col[5]= col[6]= col[7]= col[8]= 0;
    });
    
    tHi.length= 0;
    reFresh();
  });
  
  // *** To be, or no delete (for tPl at least)...
  // instead, just set inactive by #nG= -1, hmm?
  // ... can delete last ID safely, sort of
  $('#rli1But').click( //>Remove Last ID<
    function() { tPl.splice(nextID-1, 1); reFresh(); });
  
  $("#rma1But").click(//>Remove All<
    function() { tPl.length= 0; tHi.length= 0; reFresh(); });


  // *** TAB 2 : ADMIN BUTTONS ***************************************
  // *** -------------------------------------------------------------
  $("#rng2But").click(function()
  { //>Create Random Game<
    if(tGm.length < 4)
    {
      nBar.innerText= ' #need 4 players min.';
      return;
    }

    gameOver= false;
   
    var unq, plst= [ 1, 2, 3 ];
    var npx= Math.min(5,tGm.length-3);
    var nP= 4+ Math.floor( Math.random()*npx );
   
    plst.length= 0;
    for(var i= 0; i < nP; i++)
    {
      unq= false;
      while(!unq)
      {
        unq= true;
        npx= Math.floor( Math.random()*tGm.length );
        plst.forEach(function(id) { if(npx === +id) unq= false; });
      }

      plst.push([ npx ]);
    }

    npx= 0; resetEdit(false);
    plst.forEach(function(id)
    {
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

  function delHrow()
  {
    //Need this?, having rvsPLindex??
    tPl.sort(function(a, b) { return a[0] - b[0] });

    disMini.length= 0;
    var miniGm= (tHiFull[editRow][7]).split(':');
   
    var id, cx;
    for(var i= 5; i < miniGm.length; i+= 5)
    {
      cx= i/5;
      id= +miniGm[i +0] - 1;
      
      tPl[id][2]-= 1;
      if(tPl[id][2] < 0)
      {
        tPl[id][2]= 0;
        alert('err:mod2');
      } //nG
     
      if(tPl[id][2] === 0)
      {
        tPl[id][2]= tPl[id][3]= tPl[id][4]=
          tPl[id][5]= tPl[id][6]= tPl[id][7]= tPl[id][8]= 0;
      }
      else
      {
        var won= 0;
        if(cx === 1) won= +tHiFull[editRow][3];
        if(cx === 2) won= +tHiFull[editRow][5];

        var buy= +miniGm[i +1]; //buy

        tPl[id][3]-= buy; 
        if(tPl[id][3] < 0) {
          tPl[id][3]= 0; alert('err:mod3'); } //buy;
        
        tPl[id][4]-= won;
        if(tPl[id][4] < 0) {
          tPl[id][4]= 0; alert('err:mod4'); }  //won

        tPl[id][5]= tPl[id][4] - tPl[id][3]*10; //bal
       
        tPl[id][6]= c6Avg(tPl[id][3], tPl[id][2]);
        tPl[id][7]= c7Avg(tPl[id][4], tPl[id][2]);
        tPl[id][8]= tPl[id][6] + tPl[id][7]; //tot
      }
      disMini.push([ miniGm[i +2], miniGm[i +3], miniGm[i +4] ]);
    }
    // *** delete
    tHi.splice(+tHiFull[editRow][8], 1);
  }


  // *** TAB 3 : ADMIN BUTTONS **********************************
  // *** --------------------------------------------------------
  $("#rdt3But").click(function()
  { //>Re-Date<
    tHi[ (+tHiFull[editRow][8]) ][0]= tHiFull[editRow][0]=
      $('#htb>tr')[editRow].cells[0].innerText= +$('input#dtEdit').val();
  });
  
  // *** modify game: so, after all...
  // recorded game stats must not be based on current player stats...
  // but, what about balance graph which needs absolute values?
  // solution A.: record current player stats: nG-sofar, buy-sofar, won-sofar
  $("#mdf3But").click(function()
  { //>Modify<
    if(editRow < 0)
    {
      alert("Row #: "+ editRow +"...Something's wrong!");
      return;
    }

    gameOver= false;
    var miniGm= (tHiFull[editRow][7]).split(':');
   
    var won, id, cx;
    for(var i= 5; i < miniGm.length; i+= 5)
    {
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

  $('#rmr3But').click(function()
  { //>Remove<
    if(editRow < 0)
    {
      alert("Row #: "+ editRow +"...Something's wrong!");
      return;
    }
    
    delHrow();
    reFresh();
  });

  
  // *** tab3 - class="ord2" : DARK BOTTOM BUTTON
  $("#rcl3But").click(function()
  { //>Recalculate All< 
    // ...for some resson?
  });

  $("#rma3But").click(function()
  { //>Remove All<
    tHi.length= 0;
    reFresh();
  });
  
  
  // *** TAB 4 : ADMIN BUTTONS ***************************************
  // *** -------------------------------------------------------------
  $("#log4But").click(function()
  { //>Log In<
    if(isLogged) return;
    
    dbPass= $('input#pasIn').val();
    logMe();
  });
  
  // *** class="ord2" : DARK BOTTOM BUTTON
  $("#gms4But").click( function() { // >Game State<
    //adminInfo.innerText= '';
    loadState(false); });
  $("#aps4But").click( function() { // >Apply State<
    //adminInfo.innerText= '';
    loadState(true); });
  $("#kps4But").click( function() { // >Keep State<
    //adminInfo.innerText= '';
    saveState(false); });
  $("#ems4But").click( function() { // >Empty State<
    //adminInfo.innerText= '';
    saveState(true); });   

  $("#cad4But").click( function() { // >Cache Data<
    //adminInfo.innerText= '';
    loadCache(false); });
  $("#imc4But").click( function() { // >Import Cache<
    //adminInfo.innerText= '';
    loadCache(true); });
  $("#stc4But").click( function() { // >Store Cache<
    //adminInfo.innerText= '';
    saveDB(); });

  $("#gpc4But").click(function()
  {    
/*
navigator.webkitPersistentStorage.requestQuota((1024*1024), function(grantedBytes)
{
  //window.requestFileSystem(PERSISTENT, grantedBytes, onInitFs, errorHandler);
  alert("Granted persistent storage: "+ (grantedBytes/1000000).toFixed(2)+"MB");         
}, function(err) { alert(err); });
*/
    adminInfo.innerText= versionCode;
    if(!navigator.storage) {
      adminInfo.innerText+= 'No navigator.storage! \n'; return; }
    
    if(!navigator.storage.persist) {
      adminInfo.innerText+= 'No navigator.storage.persist! \n'; return; }

    navigator.storage.persisted().then(function(getP)
    {
      if(getP)
        adminInfo.innerText+= "Storage persistence already granted! \n";
      else
      {
        navigator.storage.persist().then(function(setP)
        {
          if(setP)
          {
            adminInfo.innerText+= "Storage persistence is now granted! \n";
            $('#gpc4But').val("Persistance Granted");
            $('#gpc4But').css({background:'none', color:'black', 'box-shadow':'none'});
          }
          else
          {
            adminInfo.innerText+= 'Storage persistence denied, \n'
                                + 'try again after enabing notifications! \n';
            if(!Notification)
              adminInfo.innerText+= 'Desktop notifications not available, try Chromium! \n';
            else
              Notification.requestPermission();
          }
        });
      }
    });
  });

  $("#med4But").click(function()
  { //>Memory Data<'

    // ***                 0     1     2     3     4    5     6     7     8
    // *** tPl:           id    name  gms  $buy  $won  $bal  csh%  rnk%  total
    // *** tHiFull:       date  np    bnk  $1    1st   $2    2nd   m-tGm
    // *** tGm:           isIn  pid   rnk  $won  $buy
    adminInfo.innerText= '[tPl]: 1       2      3       4       5       6     7      8 \n'
                      + ' id  name     #nG   $buy    $won    $bal    $(#)  %($)  total \n'
                      + '-------------------------------------------------------------- \n';

    tPl.forEach(function(col)
    {
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

    tHiFull.forEach(function(col)
    {
      adminInfo.innerText+= (
          '               '+ col[0]).slice(-15) +' '
        + ('   '+ col[1]).slice(-3) +' '
        + ('     '+ col[2]).slice(-5) +' '
        + ('     '+ col[3]).slice(-5) +' '
        + (col[4] +'       ').substring(0, 7)
        + ('    '+ col[5]).slice(-4) +' '
        + (col[6] +'       ').substring(0, 7)
        + '|-x-| '+ ('    '+ col[8]).slice(-4) +' \n';
    });
  });

  $("#sld4But").click( function() { loadDB(); }); //>Server Load<
  $("#ssv4But").click( function() { saveDB(); }); //>Server Save<

}); // THE END : $(document).ready
