$(document).ready(function()
{
  var versionCode= 'v2.0r18c\ \n';
  var appPath= 'https://pok-d.glitch.me';
  $.ajaxSetup({async:true, cache:false, timeout:7000,
               dataType:'text', contentType:'text/plain', processData:false});

  // ☆☆☆ load from cache blob?
  var audQuack= document.getElementById('audQuack'); //var audQuack= new Audio('');
  
  var tEvt= document.getElementById('tev');
  var nBar= document.getElementById('notif');
  var adminInfo= document.getElementById('dbFrame');
  
  var dbPass= '*';
  var filesha= '#';
  var isLogged= false;

  var nextID= 0;
  var curTab= 1;
  var editRow= -1;
  var editMode= false;

  var tbSpc= [0, '45px','45px','45px','300px'];
  var tbLst= [0, 1,2,1,0];
//  var doTabs= [0, 1,1,1,1];
  
  var bankTotal= 0;
  var gameOver= false;
  
// *** PLAYER TAB   0    1    2    3    4    5    6    7
// ***             píd  nme  buy  won  bal  ngm  av6  av7
  var plTab= [];
// *** HISYORY TAB TABLE
// ***           0    1    2     3     4     5     6    7
// *** hiTab   datm  npl  bnk  $1st  nam1  $2nd  nam2  gid
  var hiTab= [];
  
// ***         id1.rx, id2.rx, id3.rx...
  var rvsPLindex= [ 0, 1, 2, 3 ];
  var sortedPl= [ 'name1', 'name2', 'name3' ];

// *** tGm:  0.in?  1.pid  2.rnk  3.won  4.buy
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
    var retStr=  dt.getFullYear()
               + ("00"+(dt.getMonth()+1)).slice(-2)
               + ("00"+dt.getDate()).slice(-2)
               + ("00"+dt.getHours()).slice(-2)
               + ("00"+dt.getMinutes()).slice(-2);
    return parseInt(retStr, 10);
  }

  var lastNotif= '';
  var keepMsgBar= false;
  function clrNotif()
  {
    lastNotif= nBar.innerText;
    nBar.innerText= "";
  }

  function clrAdmin()
  {
    nBar.innerText= ''; clrNotif();
    adminInfo.innerText= versionCode;
  }

  function setRowCol(ct)
  {
    if(!ct) ct= curTab;
    switch(ct)
    {
      case 1:
//        $('#ptb>tr').removeClass().addClass("clean");
  
        $('#ptb>tr').removeClass().addClass("clean");
        $('#ptb>tr').css({border:'none'});
        switch(tbLst[ct])
        {
          case 1: $('#ptb>tr').removeClass(); break; 
          case 2: $('#ptb>tr').css('border-top', '1px solid lightgrey');
        }

        for(var i= 0; i < plTab.length; i++)
        {
          var pid= +plTab[i][0] -1;
          if(tGm[pid][0] !== 'F')
            $('#ptb>tr').eq(i).removeClass().addClass('selected');

          if(tGm[pid][0] === 'A')
            $('#ptb>tr').eq(i).addClass('already');
        }
      break;

      case 2:
        $('#timeSelect, #blindSelect')
          .css({filter:'', color:'black', 'background-color':'white'});
        $('#lblBank, #timeSelect, #blindSelect').css({'border-color':'black'});
        $('#tab2').css({color:'black', background:'white'});
        switch(tbLst[ct])
        {
          case 2:
            $('#gtb>tr').css('border-top', '1px solid lightgrey');
          break;

          case 3:
            $('#lblBank').css({'border-color':'white'});
            $('#gtb>tr').css('border-top', '1px solid grey');
            $('#timeSelect, #blindSelect').css({filter:'invert(100%)'});
            $('#tab2').css({color:'white', background:'black'});
          break;
        }
      break;

      case 3:
//        $('#htb>tr.extra').remove();
        $('#htb>tr').not('.selected, .extra').removeClass().addClass("clean");
        $('#htb>tr').css({border:'none'});
        switch(tbLst[ct])
        {
          case 1:
            $('#htb>tr').not('.selected, .extra').removeClass('clean');
            $('#htb>tr.extra').css({color:'white', background:'black'});
          break;

          case 2:
            $('#htb>tr').css({'border-top':'1px solid lightgrey'});
            $('#htb>tr.extra').css({color:'black', background:'#f0f0f0'});
          break;

          case 3:
            $('#htb>tr.extra').css({color:'white', background:'#3f3f3f'});
          break;
        }
    }
  }

  function setRowSpc(ct)
  {
    if(!ct) ct= curTab;
    var tt;
    switch(ct)
    {
      case 1: tt= $('#ptb>tr'); break;
      case 2: tt= $('#gtb>tr'); break;
      case 3: tt= $('#htb>tr'); break;
      case 4: tt= $('#dbFrame'); break;
    }
    if(tt.css('height') !== tbSpc[ct])
      tt.css({height:tbSpc[ct]});
  }
  
  var oldSrt= [0, 4, 0, 0];
  function sortem(tab, col, forceRev)
  {
    var t= (tab === 1) ? plTab : hiTab;
    if(t.length < 1) return;
    
    if(isNaN(t[0][col]))
    {
      t.sort(function(a, b)
      {
        if(b[col] > a[col]) return -1;
        else if(b[col] < a[col]) return 1;
        else return 0;
      });
    }
    else
      t.sort(function(a, b) { return +b[col] - (+a[col]); });
    
    oldSrt[tab]= col;
    if(forceRev === 1) t.reverse();
    
    if(tab === 1)
    { // *** header
      $('#pth>tr').children().css({border:'none'});
      $("#pth>tr").children().eq(oldSrt[1]).css({border:'2px solid grey'});
    }
    else
    if(tab === 3)
    { // *** header
      $('#hth>tr').children().css({border:'none'});
      $('#hth>tr').children().eq(oldSrt[3]).css({'border':'2px solid grey'});
    }
  }

  function reclcAll()
  {
    plTab= [];
    sortedPl.forEach(function(x, c) {
      plTab.push( [c+1, x,     0,   0,   0,   0,   0,   0] ); });

    var as= '';
    hiTab.forEach(function(x,n)
    {
      var wn1= +x[3];
      var wn2= +x[5];
      var mg= x[8].split('#');
      mg.forEach(function(y,c)
      {
        var b= y.split('&');
        var pid= +b[0]
        var buy= +b[1];

        var won= 0;
        if(c === 0) won= wn1;
        else if(c === 1) won= wn2;
        
        var z= plTab[pid];
        z[2]= +z[2] + buy;
        z[3]= +z[3] + won;
        z[5]= +z[5] + 1;
        z[4]= z[3] - z[2]*10; // bal
        z[6]= c6Avg(z[2], z[5]);
        z[7]= c7Avg(z[3], z[5]);
      });
    });

    initOnceG= true;        
  }

  // *** recalc. selected history-table rows
  function reclcSelHrows()
  {
    var tSelSum = JSON.parse(JSON.stringify(plTab));
    tSelSum.sort(function(a, b) { return a[0] - b[0] });
    tSelSum.forEach(function(row) {
      row[2]= row[3]= row[4]= row[5]= row[6]= row[7]= 0; });

    var selHgm= $('#htb')[0].getElementsByClassName('selected');

    for(var j= 0; j < selHgm.length; j++)
    {
      var ri= +$(selHgm[j]).children()[7].innerText;
      var mg= hiTab[ri][8].split('#');

      mg.forEach(function(x, cx)
      {
        var a= x.split('&');
        var pid= +a[0];
        var buy= +a[1];

        var won= 0;
        if(++cx === 1)
          won= hiTab[ri][3]; // $:1
        else
        if(cx === 2)
          won= hiTab[ri][5]; // $:2
        
        tSelSum[pid][5]++;
        tSelSum[pid][2]+= buy;
        tSelSum[pid][3]+= won;
      });
    } //end for j
    
    var stb= '';
    stb+= '  NAME    $BUY     $WON      >$BAL<           #(gms)  %(buy)   %(won) \n'
        + '––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––\n';

    tSelSum.forEach(function(row)
    {
      row[4]= row[3] - row[2]*10;
      row[6]= c6Avg(row[2], row[5]);
      row[7]= c6Avg(row[3], row[5]);
    });

    tSelSum.sort(function(a, b) { return b[4] - a[4] });

    var pl= 0;
    for(var pid= 0; pid < tSelSum.length; pid++)
    {
      if(tSelSum[pid][5] > 0)
      {
        pl++;
        var buy= tSelSum[pid][2];
        var won= tSelSum[pid][3];
        var bal= tSelSum[pid][4];
        var gms= tSelSum[pid][5];
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

  function rowAnim(tbrow, turnOn)
  {
    if(!turnOn)
    {
      $(tbrow).removeClass();
      if(tbLst[curTab] !== 1) $(tbrow).addClass("clean");
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
    $('#ptb>tr').removeClass();
    if(tbLst[curTab] !== 1) $('#ptb>tr').addClass("clean");
   
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
    if(gameOver && !istt) return 'ENTER';
 
    if(!istt)
    {
      var m= btMin, s= btSec;
      if(btSec >= 60) { m++; s= 0; }
      return ('00' +m).slice(-2) +':'+ ('00' +s).slice(-2);
    }
    else
    {
      var m= ttMin % 60, h= (ttMin -m) / 60;
      return ('00'+h).slice(-2) +':'+ ('00'+m).slice(-2);
    }

    return '??:!!';
  }

  function timerPaint(isBlack, inf)
  {
    var bt= document.getElementById('blindTimer');
    if(sirenState > 0 && inf === "!!!")
    {
      if( (sirenState === 1 && tbLst[curTab] !== 3)
         ||(sirenState === 2 && tbLst[curTab] === 3) )
      {
        inf= 'Alarm !!!';
        document.body.style.backgroundColor= 'white';
      }
      else
      {
        inf= '!!! Alarm';
        document.body.style.backgroundColor = 'black';
      }
      isBlack= (sirenState === 2);
    }

    if(tbLst[curTab] === 3)
      isBlack= !isBlack;

    switch(isBlack)
    {
      case false:
        if(tbLst[curTab] === 3)
          $(bt).css({'border-color':'white'});
        else
          $(bt).css({'border-color':'lightgrey'});
        
        $(bt).css({background:'black', color:'white'});
        
        break;

      case true:
        if(tbLst[curTab] === 3) $(bt).css({'border-color':'white'});
        else
          $(bt).css({'border-color':'grey'});

         $(bt).css({background:'white', color:'black'});

        break;
    }

    if(inf !== "***")
      bt.innerHTML= timeText(false) +'<b id="timeTxt">'
                  + inf +'<br>'+ 'Game time '+ timeText(true) +'</b>';
  }


  // *** tabs# redraw... ************************************************
  function freshTab1()
  {
    rvsPLindex.length= plTab.length;

    nextID= 0;
    $("#ptb").empty();
    plTab.forEach(function(col, cx)
    {
      rvsPLindex[ (+col[0]) ]= cx;
      if(+col[0] > nextID) nextID= +col[0];
      $('#ptb').append(
         '<tr tabindex="1"><td class="admin">'+ col[0]
        +'</td><td style="text-align:left">'+ col[1]
        +'</td><td>'+ ((col[2] === 0) ? ' ' : fCash(col[2]*1000))
        +'</td><td>'+ ((col[2] === 0) ? ' ' : fCash(col[3]*100))
        +'</td><td>'+ ((col[2] === 0) ? ' ' : fCash(col[4]*100))
        +'</td><td>'+ ((col[2] === 0) ? ' ' : col[5])
        +'</td><td>'+ ((col[2] === 0) ? ' ' : fCash(col[6]*100))
        +'</td><td>'+ ((col[2] === 0) ? ' ' : fCash(col[7]*100))
        +'</td></tr>');
    });

    var dt= new Date();
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
  function freshTab2()
  {
    $('#gtb').empty();
    tGm.forEach(function(col, cnt)
    {
      var showStr= 'style="display:none"';
      if(editMode || col[0] === "T" || col[0] === "A") showStr= '';
      $('#gtb').append(
         '<tr '+ showStr +'><td class="admin" style="text-align:center">'+ col[0]
        +'</td><td class="admin" style="padding-right:20px">'+ col[1]
        +'</td><td tabindex="1" style="text-align:left">'+ sortedPl[ +col[1] -1 ]   
        +'</td><td style="text-align:center">'+ col[2]
        +'</td><td>'+ fCash(+col[3])
        +'</td><td tabindex="1" style="text-align:right">'+ fCash(+col[4] *1000)
        +'</td><td tabindex="1" style="padding:0; overflow:visible">'
        +'<pre class="mnyInfo"' +'> </pre>'
        +'<pre class="money">  $  </pre></td></tr>' );
    });

    timerPaint((btState === 1), '***');
  }


  var monthStr= ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  function freshTab3()
  {
//    var vpd= '15px 5px 12px 5px';
//    if(vSpace > 10) vpd= '25px 5px 22px 5px';

    $('#htb').empty();
    hiTab.forEach(function(col, cnt)
    {
      var showAdmin= '';
      if(true || !editMode) showAdmin= 'style="display:none"';
    
      var mon= +(''+col[0]).substring(4,6);
      var dtStr= (''+col[0]).substring(6,8)+" " 
               + monthStr[mon-1] + "`"+(''+col[0]).substring(2,4);

      $('#htb').append(
         '<tr tabindex="1"><td style="font-size:17px; text-align:center">'+ dtStr
        +'</td><td>'+ col[1]
        +'</td><td>'+ fCash(+col[2]*1000) // bank
        +'</td><td>'+ fCash(+col[3]*100) // $:1
        +'</td><td  style="text-align:left">'+ col[4]
        +'</td><td>'+ fCash(+col[5]*100) // $:2
        +'</td><td style="text-align:left">'+ col[6]
        +'</td><td '+ showAdmin+'>'+ (col[7]= cnt)
        +'</td></tr>');
    });

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
  function prtGm(x)
  {
    if(!x) x= tGm;
    adminInfo.innerText+= '\n'
      + '[tGm]: 0    1   2      3      4 \n'
      + '      in?  id  rnk   $won   $buy \n'
      + '--------------------------------- \n';
   
    x.forEach(function(col)
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
   
    var loDat= localStorage.getItem('gameState');
    
    if(!loDat)
    {
      adminInfo.innerText+= 'Game state empty, skip import \n';
      return;
    }

    adminInfo.innerText+= 'Game state acquired, ';
    
    if(!isImport)
    {

      var t= [];
      loDat= loDat.split('|');
      loDat.forEach(function(row) {
        t.push( row.split(':') ); });
      
      adminInfo.innerText+= 'show only rows#: '+ t.length +'\n';
      prtGm(t);
      return;
    }

    tGm.length= 0;
    loDat= loDat.split('|');
    loDat.forEach(function(row) {
      tGm.push( row.split(':') ); });

    nBar.innerText+= ' #game state applied';
    adminInfo.innerText+= 'applied rows#: '+ tGm.length +'\n';
    prtGm();

    resetEdit(false);
    keepMsgBar= true;

//    doTabs[1]= 1;
    $('#mtb1').click();
  }

  function saveState(isClear)
  {
    if(!window.localStorage) {
      adminInfo.innerText+= 'FAIL:window.localStorage \n'; return; }

    if(isClear)
    {
      localStorage.removeItem('gameState');
      adminInfo.innerText+= "Game state cleared \n";
      return;
    }
    
    var upDat= [];
    tGm.forEach(function(row)
    {
      if(row[0] !== 'F') row[0]= 'A';
      upDat.push( row.join(':') );
    });

    localStorage.setItem('gameState', upDat.join('|'));

    nBar.innerText+= ' #game state stored';           
    adminInfo.innerText+= "Game state stored, rows#: "+ tGm.length +'\n';
    prtGm(tGm);
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

  var rx1= 0, rx2= 0; // tGm rows: 1st & 2nd

  function actSavG()
  {
    var cf1= +tGm[rx1][3], cf2= +tGm[rx2][3];
    $('#gtb>tr')[rx1].cells[4].innerText= fCash(cf1*100);

    tGm.sort(function(a, b)
    {
      if(isNaN(a[2])) return -1;
      if(isNaN(b[2])) return +1; 
      return a[2] - b[2];
    });

    var aux8= '';
    tGm.forEach(function(x, c)
    { // *** tGm:  0.in?  1.pid  2.rnk  3.won  4.buy
      var z= plTab[c];
      if(z[5] < 1) {
        z[2]= z[3]= z[4]= z[5]= z[6]= z[7]= 0; }

      var buy= +x[4];
      
      if(buy > 0)
      {
        var pid= +x[1]-1;
        var ngm= z[5] +1;
        var won= isNaN(x[3]) ? 0 : x[3];
        var bal= x[3] - x[2]*10;

        aux8+= '#'+pid+'&'+buy;
      }
    });

    var gdat= numCTD();
    if(useThisDate > 0) gdat= useThisDate;

    hiTab.push([ gdat, gamePlayers, bankTotal,
          cf1, sortedPl[rx1], cf2, sortedPl[rx2], 0, aux8.substr(1) ]);

    reclcAll();
    
//    clrAdmin(); saveDB();
    $("#ssv4But").click();
    saveState(true);

    btSec= btMin= ttMin= 0; btState= 8;
    timerPaint(false, 'Click to START');
  
//    doTabs[3]= 1;
    $('#mtb3').click();
    reFresh();

    if(useThisDate > 0 && editRow >= 0)
      $('#htb>tr').eq(editRow).children().eq(1).click();
    else
      $('#htb>tr').eq(0).children().eq(1).click();

    useThisDate= 0;
    gamePlayers= 0;
    gameOver= false;
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
    { // Save it!
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
      tGm[rx1][3]= 0;
      tGm[rx2][3]= 0;

      this.value= "00";
      this.setSelectionRange(0, 0);
      $('#gtb>tr')[rx2].cells[4].innerText= "???";
    });

    $(wf).on("keydown", function(e) {
      if(e.which === 13 || e.which === 9) finalSave(); });

    $(wf).on("keyup", function(e)
    {
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


  // *** main redraw function ***************************************
  var lastTab= 0;
  var dontInit= false;
  var initOnceG= true;
  function initG()
  {
    initOnceG= false;
    resetEdit(false);
    
      tGm.length= 0;
      sortedPl.length= 0;
      plTab.sort(function(a, b) { return a[0] - b[0] }); 
      plTab.forEach(function(col)
      {
        if(col[5] < 1) {
          col[2]= col[3]= col[5]= col[6]= col[7]= 0; col[4]= (-900 - col[0]); }

        tGm.push([ 'F', +col[0], '-', '-', 0 ]);
        sortedPl.push( col[1] );
      });

      sortem(1, 4); sortem(3, 0); setRowSpc(4);
      if(curTab !== 1) { freshTab1(); setRowSpc(1); setRowCol(1); }
      if(curTab !== 3) { freshTab3(); setRowSpc(3); setRowCol(3); }
  }
  
  function initS()
  {
    var selRows= $('#ptb')[0].getElementsByClassName('selected');
    for(var i= 0; i < selRows.length; i++)
    {
      var pid= +(selRows[i].firstChild.innerText) -1;
      if(+tGm[pid][4] > 0)
        tGm[pid][0]= "A";
      else {
        tGm[pid][4]= 0; tGm[pid][0]= "T"; }
    }
    
    sortedRnk.length= 0;
    tGm.forEach(function(col)
    {
      if(col[0] !== "T" && col[0] !== "A") {
        col[0]= "F"; col[2]= '-'; col[3]= '-'; col[4]= 0; }
      else
      if(+col[2] >= 0)
        sortedRnk.push([ +col[2], +col[1] ]);
    });
  }

  function reFresh()
  { 
    var ttxt= "Party Mix";
    if(!navigator.onLine) ttxt= "OFFLINE";
    document.getElementById("mtb1").value = ttxt;

    if((initOnceG || editMode) && !dontInit)
    {

      initG();

    }
    else
    if(!keepMsgBar && nBar.innerText.length > 1) {
      setTimeout( function() { clrNotif(); }, 350); }

    initS();

    // *** tab switch
    switch(curTab)
    {
      case 1: freshTab1(); break;
      case 2: freshTab2(); break;
      case 3: freshTab3(); break;
    }

    setRowSpc();
    setRowCol();
    
    if(editMode)
    {
      if(curTab === 1) resetEdit(true);
      $(".admin").css("display", "table-cell");
    }
    else
      $(".admin").css("display", "none");
  
    if(useThisDate < 1) editRow= -1;
    if(curTab === 2 && gameOver) mnySplit();

    dontInit= keepMsgBar= false;
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
    }, 3000);

    if(e.target.cellIndex > 5)
    {
      var mny= e.target.firstChild.nextSibling;
      var rx= mny.parentNode.parentNode.rowIndex -1; 

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

      if(tbLst[curTab] !== 3)
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

      if(tbLst[curTab] !== 3)
        $(mny.previousSibling).css({'font-size':'18px', color:'black'});
      else
        $(mny.previousSibling).css({'font-size':'18px', color:'white'});

      bankTotal-= tGm[rx][4] -1;
      document.getElementById('lblBank')
        .innerText= 'Bank: $'+ fCash(bankTotal*1000);
      
      e.target.innerText= fCash(1000* (tGm[rx][4]= 1));
    }
//    else { alert('Something else!!'); }
  });


  $('#playerTable').click(function(e)
  {
    if(!gameOver && nBar.innerText.length > 1) clrNotif();

    var trx= e.target.parentNode.rowIndex;

    if(trx === 0)
    {
      var s= e.target.cellIndex;
      if(oldSrt[1] !== s) sortem(1, s);
      else plTab.reverse();

      dontInit= true;
      reFresh();
      return;
    }
    
    var rtg= e.target.parentNode;
    if(trx === undefined) rtg= e.target;

    trx= rtg.rowIndex;
    var pid= parseInt($('#ptb>tr')[trx-1].firstChild.innerText, 10) -1;

    if($(rtg).hasClass('selected'))
    {
      tGm[pid][0]= 'F';
      if(editMode) resetEdit(true);
      else rowAnim(rtg, false);
      return;
    }

    if(editMode)
    {
      resetEdit(false);
      document.getElementById("subBut").value= "Edit";

      editRow= trx -1; tGm[pid][0]= 'F';
      $('input#in0').val( plTab[editRow][0] );
      $('input#in1').val( plTab[editRow][1] );
      $('input#in2').val( plTab[editRow][2] );
      $('input#in3').val( plTab[editRow][3] );
      $('input#in4').val( plTab[editRow][5] );
    }
    else
    if(+tGm[pid][4] > 0)
    {
      tGm[pid][0]= 'A';
      $(rtg).addClass('already');
    }
    else
      tGm[pid][0]= 'T';

    rowAnim(rtg, true);
  });


  // *** $('#historyTable') ****************************

  //firefox fix
  function firefoxFix()
  {
    if($('#hth>tr').children()[oldSrt[3]].style.borderColor === 'grey')
      $('#hth>tr').children().eq(oldSrt[3]).css({'border-color':'rgb(128, 128, 127)'});
    else
      $('#hth>tr').children().eq(oldSrt[3]).css({'border-color':'grey'});
  }

  // *** subRow-content - REMOVE
  function subrowDelete(etpn)
  {
    if(editMode)
    {
      editRow= -1; $('#dtEdit').val('');
      $('.initDis').prop("disabled", true);
    }    
    rowAnim(etpn.previousSibling, false);
    $(etpn).remove();
    firefoxFix();
  }

  var evct= 0;
  $('#historyTable').on('click', function (e)
  {
    if(!gameOver && nBar.innerText.length > 1) clrNotif();

    var etpn= e.target.parentNode;
    if(etpn.rowIndex === undefined) etpn= e.target;
    
    if(etpn.rowIndex === 0)
    {
      var s= e.target.cellIndex;
      if(oldSrt[3] !== s) sortem(3, s);
      else hiTab.reverse();

      dontInit= true;
      reFresh();
      return;
    }
    
    if($(etpn).hasClass('extra')) {
      subrowDelete( etpn ); return; }
    
    if($(etpn).hasClass('selected')) {
      subrowDelete(etpn.nextSibling); return; }


    // *** subRow-content - CREATE ***********************   
    var ri= +$(etpn).children()[7].innerText;
    var selRows= $('#htb')[0].getElementsByClassName('selected');

    if(editMode)
    {
      $('#htb>tr.extra').remove();
      $('#htb>tr').removeClass();
      if(tbLst[curTab] !== 1)
        $('#htb>tr').addClass("clean");

      editRow= etpn.rowIndex -1;
      $('.initDis').prop("disabled", false);
    }

    var dtCode= hiTab[ri][0].toString();
    var mon= +dtCode.substring(4,6);
    var dtStr= dtCode.substring(6,8)
              +' '+ monthStr[mon-1]
              +' '+ dtCode.substring(0,4)
              +' @ '+ dtCode.substring(8,10)
              +':'+ dtCode.substring(10,12);

    var scd= '';
    scd+= ' RANK  NAME       $BUY     $WON \n'
        + '––––––––––––––––––––––––––––––––              '+ dtStr +'\n';

    var mg= hiTab[ri][8].split('#');
    
    mg.forEach(function(x, cx)
    {
      var a= x.split('&');
      var pid= +a[0];
      var buy= +a[1];

      var won= 0;
      if(++cx === 1)
        won= hiTab[ri][3]; // $:1
      else
      if(cx === 2)
        won= hiTab[ri][5]; // $:2
      else
        if(cx === 3) scd+= '\n';
      
      var wons= (won === 0)? ' ':fCash(+won*100);
      
      scd+= ('    ' + cx).slice(-4) +'.  '
          + (sortedPl[ pid ] +'        ').substring(0, 8)
          + ('       '+ (buy+'k')).slice(-7) 
          + ('          '+ wons).slice(-9) +' \n';
    });

    $(etpn).after(
        '<tr class="extra"><td colspan=7>'
      + '<pre style="height:'
      + ((+hiTab[ri][1] +4)*15) +'px; '
      + 'padding:9px 10px; margin:0; '
      + 'text-align:left; user-select: none; '
      + 'pointer-events:none; font-size:14px">'
      + scd +'</pre></td></tr>');


    rowAnim(etpn, true);
    firefoxFix();

    setRowCol();

//    $(etpn.nextSibling).focus();
  });

  
  function zipN(s)
  {
    var i, t, r= '';
    var a= (s.toString(10)).substr(4);
    for(i= 0; i < a.length-2; i+= 2) {
      t= +a.substr(i, 2); r+= (t).toString(36); }
    t= ~~(+a.substr(i, 2) /2); r+= (t).toString(36);
    return r;
  }

  function uzpN(a)
  {
    var i, r= '2018';
    for(i= 0; i < a.length-1; i++) {
      r+= ('00'+ parseInt(a.charAt(i), 36)).slice(-2); }
    r+= ('00'+ (2*parseInt(a.charAt(i +0), 36))).slice(-2);
    return +r;
  }
  
  // *** import... **************************************************
  function importDB(data)
  {
    initOnceG= true;
    
// *** UNPACK & IMPORT
    var rd= data.split('@');

    var yr= rd[0];
    sortedPl= rd[1].split('|');
    var hiLoad= rd[2].split('|');
  
    plTab= [];
    sortedPl.forEach(function(x, c)
    {
// ***               0   1    2    3    4    5    6    7
//    pltab        píd  nme  buy  won  bal  ngm  av6  av7
      plTab.push( [c+1, x,     0,   0,   0,   0,   0,   0] );
    });
    
    hiTab= [];
    hiLoad.forEach(function(x, gid)
    {
// ***           0    1    2     3     4     5     6    7    8
// *** hiTab   datm  npl  bnk  $1st  nam1  $2nd  nam2  gid  rkb
      var a= x.split(':');
      hiTab.push( [ uzpN(a[0]), 0, 0, 0, '', 0, '', 0, '' ] );
    });
  
    var npl, bnk, as= '';
    hiLoad.forEach(function(x,n)
    {
      var a= x.split(':');
      var wn1= +a[1];
      var wn2= +a[2];
  
      var g= hiTab[n];
      var mg= a[3].substr(1).split('#');
   
      npl= bnk= 0;
      mg.forEach(function(y,c)
      {
        var b= y.split('&');
        var pid= +b[0];
        var buy= +b[1];

        npl++;
        bnk+= buy;
        
        var won= 0;
        if(c === 0) { won= wn1; g[4]= sortedPl[pid] }
        else if(c === 1) { won= wn2;  g[6]= sortedPl[pid] }
        
        var z= plTab[pid];
        z[2]+= buy; z[3]+= won; 
        z[5]++; // #ng
        z[4]= z[3] - z[2]*10; // bal
        z[6]= c6Avg(z[2], z[5]);
        z[7]= c7Avg(z[3], z[5]);
      });

      g[1]= npl; g[2]= bnk; g[3]= wn1;
      g[5]= wn2; g[8]= a[3].substr(1);
    });
    
    var d= localStorage.getItem('dataBase');
    if(!d || d.length < 9) saveDB(true);
    
    initG();
    loadState(true);
    reFresh();
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
        navigator.storage.estimate().then(function(est)
        {
          adminInfo.innerText+= "Usage: "
            + (est.usage/1048576).toFixed(2) +"MB out of "
            + (est.quota/1048576).toFixed(2) +"MB. \n";
        });
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

    adminInfo.innerText+= '\n';
  }

  function loadCache(isImport)
  {
    adminInfo.innerText+= 'CACHE:info & import \n';
    
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
      importDB(d);
      adminInfo.innerText+=  'import@loadCache-RAW: \n';
    }
    else
      adminInfo.innerText+=  'info@loadCache-RAW: \n';

    var as= '–––––––––1–––––––––2–––––––––3–––––––––4–––––––––5–––––––––6–––––––––7–––––––––8 \n';
    for(var i= 0; i < d.length; i++)
    {
      if(i > 0 && i%80 === 0) as+= '\n';
      as+= d.charAt(i);
    }
    adminInfo.innerText+= as+'\n';

    var rd= d.split('@');
    var yr= rd[0];
    sortedPl= rd[1].split('|');
    var hiLoad= rd[2].split('|');

    adminInfo.innerText+= '\n\n'
      +'timestamp\t name\t $buy\t $won \n';
    
    as= '';
    hiLoad.forEach(function(x)
    {
      var a= x.split(':');
      var wn1= +a[1];
      var wn2= +a[2];
  
      var mg= a[3].substr(1).split('#');
   
      mg.forEach(function(y,c)
      {
        var b= y.split('&');
        var pid= +b[0];
        var buy= +b[1];

        var won= 0;
        if(c === 0) won= wn1;
        else if(c === 1) won= wn2;

        as+= ''+uzpN(a[0])+'\t '+sortedPl[pid]
          +'\t '+buy*1000+'\t '+won*100+'\n';
      });
    });
    adminInfo.innerText+= as+'\n';
  }

  function loadServer()
  {
    adminInfo.innerText+= 'SERVER:load & import \n';

    $.ajax(
    {
      url:appPath +'/lod', type:'GET',
      error:function(e, f)
      {
        adminInfo.innerText+= 'FAIL@client:'+ f +'\n';
        loadCache(true); $("#mtb4").click();
      },
      success:function(r, s, x)
      {
        var d= r.replace(/\n|\r/g, '');
        adminInfo.innerText+= x.getAllResponseHeaders() +'\n'
          + 'PASS:server load '+ (d.length/1024).toFixed(2) +' KB \n';
        importDB(d);
      }
    });
  }

  function logMe()
  {
    clrAdmin();
    adminInfo.innerText+= 'SERVER:logme \n';
    $.ajax(
    {
      url:appPath +'/lgn:'+dbPass, type:'GET',
      error:function(e, f)
      {
        adminInfo.innerText+= 'FAIL@client:'+ f +'\n';
      },
      success:function(r, s, x)
      {
        if(r !== 'pOkk') {
          adminInfo.innerText+= 'FAIL@server:'+ r +'\n'; return; }
  
        adminInfo.innerText+= 
          x.getAllResponseHeaders() +'\n'+ 'PASS:logme logged \n';
        
        isLogged= true;
        $('#log4But').css({background:'none', 'box-shadow':'none'});
        $('#log4But').val("Logged"); $('#pasIn').css({display:'none'});
      }
    });
  }

  
  function saveDB(cchOnly)
  {
    initOnceG= true;

    // *** CACHE SAVE
    adminInfo.innerText+= 'CACHE:export & save \n';

    if(!window.localStorage) {
      adminInfo.innerText+= 'FAIL:window.localStorage \n'; return; }
    else
      adminInfo.innerText+= 'USING:window.localStorage \n';
    
    var rawdb= '2018'+ '@'+ sortedPl.join('|');
   
    var hiSave= '';
    hiTab.forEach(function(x)
    {
      var mg= x[8].split('#');
      hiSave+= '|'+zipN(x[0])+':'+x[3]+':'+x[5]+':';

      mg.forEach(function(y)
      {
        var a= y.split('&');
        var pid= +a[0];
        var buy= +a[1];
        hiSave+= '#'+pid+'&'+buy;
      });
    });

    rawdb+= '@'+ hiSave.substr(1);
    localStorage.setItem('dataBase', rawdb);

    nBar.innerText+= ' #cache save OK';
    adminInfo.innerText+= 'PASS:cache save '+ (rawdb.length/1024).toFixed(2) +' KB \n';

    if(cchOnly) return;

    // *** SERVER SAVE
    adminInfo.innerText+= 'SERVER:export & save \n';

    if(!navigator.onLine) {
      adminInfo.innerText+= 'FAIL:navigator.online \n'; return; }
    else
    if(!isLogged) {
      adminInfo.innerText+= 'FAIL:no password\n';
      nBar.innerText= '#must be logged to update server database'; return; }

    $.ajax(
    {
      url:appPath +'/sav:'+dbPass, data:rawdb, type:'POST',
      error:function(e, f)
      {
        adminInfo.innerText+= 'FAIL@client:'+ f +'\n';
      },
      success:function(r, s, x)
      {
        if(r.substring(0,4) !== 'size') {
          adminInfo.innerText+= 'FAIL@server:'+ r +'\n';  return; }

        nBar.innerText+= ' #server save '+ r.substring(5);
        adminInfo.innerText+= x.getAllResponseHeaders() +'\n'
          + 'PASS:server save '+ (rawdb.length/1024).toFixed(2) +' KB \n';
      }
    });
  }

  function loadDB()
  {                       
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
  clrAdmin(); loadDB();

  function initBuyin(plNo)
  {
    gamePlayers++;
    if(plNo < 0)
    {
      plNo= -(plNo +100);
      bankTotal+= +tGm[plNo][4];
      document.getElementById('lblBank')
        .innerText= 'Bank: $'+ fCash(bankTotal*1000);
    }
    else
      $('#gtb>tr').eq(plNo).children().eq(6).click();
  }


  // *** tab buttons listener ********************************
  var initOnceA= false;
  $(".mtb").click(function(e)
  {
    if(!initOnceA) { //audQuack.load();
      initOnceA= true; audQuack.play(); }

    $(".mtb").removeClass("act dea").addClass("dea");
    $(this).removeClass("dea").addClass("act");

    $(".ptab").removeClass("pac pde").addClass("pde");
    var tid= "#tab"+ (this.id).substring(3,4);
    $(tid).removeClass("pde").addClass("pac");

    curTab= 0;
    if(editMode) {
      editMode= false; $('.adminEdit, .admin').css('display', 'none'); }

    if(tid === "#tab2")
    {
      curTab= 2;
      gamePlayers= 0;
      gameOver= false;

      reFresh();
      
      var dt = new Date();
      document.getElementById("lblDate")
        .innerText= (useThisDate) ? useThisDate :
        dt.toLocaleDateString('en-NZ', {weekday:'long', year:'numeric',
                                        month:'long', day:'numeric'});

      curRank= 0; bankTotal= 0;
      document.getElementById('lblBank')
        .innerText= 'Bank: $'+ fCash(bankTotal*1000);

      for(var i= 0; i < tGm.length; i++)
      {
        if(tGm[i][0] === "T") { curRank++; initBuyin(i); }
        if(tGm[i][0] === "A") { curRank++; initBuyin(-(i+100)); }
      }

      sortedRnk.sort(function(a, b){return b[0] - a[0] });
      for(var i= 0; i < sortedRnk.length; i++)
      {
        var trx= +sortedRnk[i][1] -1;
        var rf= $('#gtb>tr')[trx].cells[3];
        outAnim(trx, rf);
      }

      return;
    } // *** end tab-2

    if(tid === "#tab1") { curTab= 1; initS(); setRowCol(1); }
    else
    if(tid === "#tab3") curTab= 3;
    else
    if(tid === "#tab4") curTab= 4;

//    dontInit=true; reFresh();
//    if(doTabs[curTab] > 0) { reFresh(); doTabs[curTab]= 0; }
  });


  // *** ---------- T I M E R  2nd part ----------------
  function minuteUp()
  {
    if(btState !== 1) return;
   
    if(--btSec <= 0) {
      btSec= 60; btMin--; ttMin++; }
    
    if(btMin < 0)
    {
      var cn= +$('#blindSelect').val() +1;

      if(cn > 15) cn= 15;
      $('#blindSelect').val(cn);
      btState= 2; $('#blindTimer').click();
    }
    else
      setTimeout( minuteUp, 1000);

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
    btSec= 60; btMin= +ts -1;
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
        timerPaint(true, 'Click to PAUSE');
        setTimeout( minuteUp, 1000);
      break;
       
      case 2:
        btState= 9; sirenState= 1;
        if(curTab != 2) $('#mtb2').click();
        setTimeout(bkgSiren, 350);
      break;
    }
  });
  
  $('#timeSelect').on('focus change',function()
  {
    if(btState !== 0) return;

    var ni= (this.options[this.selectedIndex].text).indexOf('min');
    var ts= (this.options[this.selectedIndex].text).substring(0, ni);

    btSec= 60; btMin= +ts -1;
    timerPaint(false, 'Click to START');
  });


  // *** BUTTONS #################################################
  // *** .........................................................
  $("#mnu1").click(function(e)
  { // star A.
    if(useThisDate > 0)
     alert('Game modification in progress... ');

    if(curTab === 4) {
      clrAdmin();
      adminInfo.innerText+= 
        'Made by zele-chelik!, Jun 2018. \n'; return; }

    if(editMode= !editMode)
    {
      dontInit= true;
      if(curTab === 1) sortem(1, 0, 1);
      else if(curTab === 3) sortem(3, 0, 1);
      $('.adminEdit').css('display', 'block');
    }
    else
    {
      initOnceG= true;
      if(curTab === 1) sortem(1, 4);
      else if(curTab === 3) sortem(3, 0);
      $('.adminEdit').css('display', 'none');
    }

    reFresh();
  });


  $("#mnu2").click(function(e)
  { // arrow B.
    if(curTab < 4)
      tbSpc[curTab]= (tbSpc[curTab] !== '45px')? '45px':'70px';
    else
      tbSpc[curTab]= (tbSpc[curTab] !== '300px')? '300px':'auto';
      
    setRowSpc();
  });
   
  $("#mnu3").click(function(e)
  { // line C.
    if(curTab === 4) {
      clrAdmin();
      adminInfo.innerText= 
        'What?! Why did you do that just now? \n'; return; }
    
    if(++tbLst[curTab] > 3) tbLst[curTab]= 1;
    setRowCol();
  });

  $("#headbar").click(function() {
    nBar.innerText= lastNotif; });


  // *** INPUT TEXT FIELD ...............................
  $(".finf").on('keydown', function(e)
  {
    if(e.which === 9 || e.which === 13)
    {
      if(this.id === "dtEdit")
        $("#rdt3But").focus().click();
/*      else
      if(this.id === "pasIn")
        $("#log4But").focus().click();*/
      else
      if(this.id !== "in4") 
        $(this).next("input").focus();
      else
        $('#subBut').focus().click();
    }
  });
  
  $('#subBut').click(function(e)
  {
    if(editRow >= 0)
      plTab.splice(editRow, 1); //delete, then add normaly = edit

    var col0 = $('input#in0').val(); // pid
    var col1 = $('input#in1').val(); // nme
   
    var col2 = +$('input#in2').val(); // buy
    var col3 = +$('input#in3').val(); // won
    var col4= col3 - col2*10; // bal
    var col5 = +$('input#in4').val(); // ngm
    var col6= c6Avg(col2, col5);
    var col7= c7Avg(col2, col5);

    if(col5 < 1) col2= col3= col5= col6= col7= 0;  col4= (-900 -col0);
    plTab.push([ col0, col1, col2, col3, col4, col5, col6, col7 ]);
    reFresh();
  });


  // *** TAB 1 : ADMIN BUTTONS ***************************************
  // *** -------------------------------------------------------------
  
  $('.ord2').click( function() { clrAdmin(); });
  
  // *** tab1-class="ord2" : DARK BOTTOM BUTTON
  $("#raz1But").click(function()
  { //>Reset All to Zero<
    plTab.forEach(function(col) {
      col[2]= col[3]= col[4]= col[5]= col[6]= col[7]= 0; });
    
    hiTab.length= 0;
    reFresh();
  });
  
  // *** To be, or no delete
  // instead, just set inactive by #nG= -1, hmm?
  $('#rli1But').click( //>Remove Last ID<
    function() { plTab.splice(nextID-1, 1); reFresh(); });
  
  $("#rma1But").click(function() { //>Remove All<
    plTab.length= 0; hiTab.length= 0; reFresh(); });


  // *** TAB 2 : ADMIN BUTTONS ***************************************
  // *** -------------------------------------------------------------
  $("#rng2But").click(function()
  { //>Create Random Game<
    if(tGm.length < 4) {
      nBar.innerText= ' #need 4 players min.'; return; }

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

    npx= 0; //resetEdit(false);
    plst.forEach(function(id)
    {
      tGm[+id][0]= 'A';
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


  // *** TAB 3 : ADMIN BUTTONS **********************************
  // *** --------------------------------------------------------
  $("#rdt3But").click(function()
  { //>Re-Date<
/*    tHi[ (+tHiFull[editRow][8]) ][0]= tHiFull[editRow][0]=
      $('#htb>tr')[editRow].cells[0].innerText= +$('input#dtEdit').val(); */
  });
  
  // *** modify game: so, after all... reclcAll()
  $("#mdf3But").click(function()
  { //>Modify<
    if(editRow < 0) {
      alert("Row #: "+ editRow +"...Something's wrong!"); return; }
/*
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
*/
  });

  $('#rmr3But').click(function()
  { //>Remove<
    if(editRow < 0) {
      alert("Row #: "+ editRow +"...Something's wrong!"); return; }
    
    hiTab.splice(editRow, 1);
    reclcAll();

    reFresh();
  });
  
  // *** tab3 - class="ord2" : DARK BOTTOM BUTTON
  $("#rcl3But").click(function()
  { //>Recalculate All<
    reclcAll();
    $('#mtb1').click();
  });

  $("#rma3But").click(function()
  { //>Remove All<
    hiTab.length= 0;
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
    loadState(false); });
  $("#aps4But").click( function() { // >Apply State<
    loadState(true); });
  $("#kps4But").click( function() { // >Keep State<
    saveState(false); });
  $("#ems4But").click( function() { // >Empty State<
    saveState(true); });   

  $("#cad4But").click( function() { // >Cache Data<
    loadCache(false); });
  $("#imc4But").click( function() { // >Import Cache<
    loadCache(true); });
  $("#stc4But").click( function() { // >Store Cache<
    saveDB(true); });

  $("#gpc4But").click(function()
  {
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
    var as= '';
    adminInfo.innerText+= '\n'+'[plTab: '+ plTab.length+']\n'
      + 'pid\t name\t $buy\t $won\t $bal\t #ngm\t %buy\t %won \n';
    plTab.forEach(function(r) {
      as+= ''+ r[0]+'\t '+r[1]+'\t '+r[2]+'\t '+r[3]
        +'\t '+r[4]+'\t '+r[5]+'\t '+r[6]+'\t '+r[7]+'\n'; });
    adminInfo.innerText+= as;
    
    as= '';
    adminInfo.innerText+= '\n'+'[hiTab: '+ hiTab.length+']\n'
      + 'dtm   #   $bank    $1st\t :name\t $2nd\t :name\t rid\t #<pid:buy..> \n';
    hiTab.forEach(function(r, c) {
      as+= ''+ zipN(r[0])+'  '+r[1]+'\t '+r[2]+'\t '+r[3]
        +'\t '+r[4]+'\t '+r[5]+'\t '+r[6]+'\t '+r[7]+'\t '+r[8]+'\n'; });
    adminInfo.innerText+= as;
  });

  $("#sld4But").click( function() { loadDB(); }); //>Server Load<
  $("#ssv4But").click( function() { saveDB(); }); //>Server Save<

// *** WAKE LOCK
  var noSleep = new window.NoSleep();
  var wakeLockEnabled = false;
  var toggleEl = document.querySelector("#wlk4But");
  toggleEl.addEventListener('click', function() {
    if (!wakeLockEnabled) {
      noSleep.enable(); // keep the screen on!
      wakeLockEnabled = true;
      toggleEl.value = "WL enabled";
      document.body.style.backgroundColor = "#333333";
    } else {
      noSleep.disable(); // let the screen turn off.
      wakeLockEnabled = false;
      toggleEl.value = "WL disabled";
      document.body.style.backgroundColor = "#777777";
    }
  }, false);

}); // THE END : $(document).ready

/*
  document.onclick= function(e)
  {
    tEvt.innerText= '\n'
      + 'event info v0.4 \n'
      + 'count: '+ (++evct)
      + '\n this: ' + this
      + '\n this.className: ' + this.className
      + '\n e.type: ' + e.type
      + '\n e.target.firstChild: ' +  e.target.firstChild
      + '\n e.target.parentNode: ' + e.target.parentNode
      + '\n e.target: ' + e.target
      + '\n e.currentTarget: ' + e.currentTarget;
  };
*/

