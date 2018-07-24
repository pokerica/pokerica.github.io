$(document).ready(function()
{
  var versionCode= 'v2.0r23b \n';
  var appPath= 'https://pok.glitch.me';
  $.ajaxSetup({async:true, cache:false, timeout:9999,
               dataType:'text', contentType:'text/plain', processData:false});

  // *** load from cache blob?
  var audQuack= document.getElementById('audQuack');
  
  var nBar= document.getElementById('notif');
  var adminInfo= document.getElementById('dbFrame');

  var nextID= 0;
  var curRank= 0;

  var dbPass= '*';
  var filesha= '#';
  var isLogged= false;
  var ttxt= 't1';

  var curTab= 1;
  var lastTab= 0;
  var editRow= -1;
  var editMode= false;

  var tbSpc= [0, '45px','45px','45px','300px'];
  var tbLst= [0, 1,1,1,0];
  var oldSrt= [0, 5, 0, 1];
  
  var bankTotal= 0;
  var gamePlayers= 0;
  var gameOver= false;
  
  var lastDate= 0;
  var useThisDate= 0;
  var isRemote= false;

  var rx1= 0, rx2= 0; // tGm rows: 1st & 2nd
// *** PLAYER TAB   0    1    2    3    4    5    6    7
// ***             píd  nme  buy  won  bal  ngm  av6  av7
  var plTab= [];
// *** HISYORY TAB TABLE
// ***           0    1    2     3     4     5     6    7
// *** hiTab   datm  npl  bnk  $1st  nam1  $2nd  nam2  gid
  var hiTab= [];

// *** tGm:  0.in?  1.pid  2.rnk  3.won  4.buy
  var tGm = [ ['F', 0, 0, 0, 0] ];
  var sortedPl= [ 'a', 'b', 'c' ];
  
  function fCash(num, mod)
  { // *** clear commas: .replace(/,/g, '');
    if(isNaN(num)) return 'n-n';
    if(mod === 0) return ' ';
  
    var x= (num < 0);
    num= Math.abs(num).toString()
             .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    if(x) num= '−'+ num;
    return num;
  }
  
  function numCTD()
  {
    var curDate= new Date();
    var r= curDate.getFullYear()
               + ("00"+(curDate.getMonth()+1)).slice(-2)
               + ("00"+curDate.getDate()).slice(-2)
               + ("00"+curDate.getHours()).slice(-2)
               + ("00"+curDate.getMinutes()).slice(-2);
    return parseInt(r, 10);
  }

  var lastNotif= '';
  function clrAdmin(a)
  {
    if(!a) adminInfo.innerText= versionCode;
    if(nBar.innerText !== '...') {
      lastNotif= nBar.innerText; nBar.innerText= '...'; }
  }

  function setRowCol(ct)
  {
    if(!ct) ct= curTab;
    switch(ct)
    {
      case 1:
        $('#ptb>tr').css({border:'none'});
        $('#ptb>tr').removeClass().addClass("clean");
        switch(tbLst[ct])
        {
          case 1: $('#ptb>tr').removeClass(); break; 
          case 2: $('#ptb>tr').css('border-top', '1px solid lightgrey');
        }

        for(var i= 0; i < plTab.length; i++)
        {
          var pid= +plTab[i][0] -1;
          if(tGm[pid][0] !== 'F')
          {
            $('#ptb>tr').eq(i).removeClass().addClass('selected');
            if(+tGm[pid][4] > 0)
              $('#ptb>tr').eq(i).addClass('already');
          } 
        }

        if(!editMode)
          $('#ptb>tr').last('tr').removeClass()
            .css({'border-top':'3px double grey', background:'white',
                  'user-select':'none', 'pointer-events':'none'});
      break;

      case 2:
        $('#lblBank, #timeSelect, #blindSelect')
          .css({'border-color':'grey', filter:'',
                color:'black', 'background-color':'white'});
        $('#gtb>tr').css({border:'none'});
        $('#tab2').css({color:'black', 'background-color':'white'});
        switch(tbLst[ct])
        {
          case 1:
            $('#gtb>tr').css({'border-top':'1px solid lightgrey'});
          break;

          case 2:
            $('#lblBank, #timeSelect, #blindSelect').css({filter:'invert(100%)'});
            $('#gtb>tr').css('border-top', '1px solid grey');
            $('#tab2').css({color:'white', background:'black'});
            break;
          case 3:break;
        }
      break;

      case 3:
        $('#htb>tr').css({border:'none'});
        $('#htb>tr').not('.selected, .extra').removeClass().addClass("clean");
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

        if(!editMode)
          $('#htb>tr').last('tr').removeClass()
            .css({'border-top':'3px double grey', background:'white',
                  'user-select':'none', 'pointer-events':'none'});
      break;
    }
  }

  function setRowSpc(ct)
  {
    var tt; if(!ct) ct= curTab;
    switch(ct)
    {
      case 1: tt= $('#ptb>tr'); break;
      case 2: tt= $('#gtb>tr'); break;
      case 3: tt= $('#htb>tr'); break;
      case 4: tt= $('#dbFrame'); break;
    }
    if(tt.css('height') !== tbSpc[ct]) tt.css({height:tbSpc[ct]});
  }
  
  function sortem(tab, col)
  {
    oldSrt[tab]= col;
    var rev= (col < 0);
    col= Math.abs(col)-1;

    var t= (tab === 1) ? plTab : hiTab;
    if(t.length < 1) return;
    
    if(isNaN(t[0][col]))
    { // alpha
      t.sort(function(a, b)
      {
        if(b[col] > a[col]) return -1;
        else if(b[col] < a[col]) return 1;
        else return 0;
      });
    }
    else // numeric
      t.sort(function(a, b) { return +b[col] - (+a[col]); });
    
    if(rev) t.reverse();
    
    if(tab === 1)
    { // *** header
      $('#pth>tr').children().css({border:'none'});
      $("#pth>tr").children().eq(col).css({border:'2px solid grey'});
    }
    else
    if(tab === 3)
    { // *** header
      $('#hth>tr').children().css({border:'none'});
      $('#hth>tr').children().eq(col).css({'border':'2px solid grey'});
    }
  }

  function reclcAll()
  {
    plTab.length= 0;;
    sortedPl.forEach(function(x, c) {
      plTab.push( [c+1, x,     0,   0,   0,   0,   0,   0] ); });
    
    sortem(curTab= 3, 1); reFresh();
    if(hiTab.length > 0) lastDate= hiTab[0][0];

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
  }

  // *** recalc. selected history-table rows
  function reclcSelHrows(z)
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
    stb+= '  NAME    $BUY     $WON      >$BAL<             #gms    %buy     %won \n'
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

    if(editMode) { stb= "  [edit mode activated]"; pl= 0; }
    else if(selHgm.length < 1) stb= "  [selected games balance]";

    document.getElementById('sumSg').innerHTML= '<pre id="selSum" '
      + 'style="font-size:15px; padding:1px 12px">'+ stb +'</pre>';
   
    pl= 7+ (pl +1)*15; $('#selSum').css({height:pl+'px'});
    
    if(!z) return;
    if(z.getBoundingClientRect().bottom > window.innerHeight)
      z.scrollIntoView(false); // document.documentElement.scrollTop+= h;
  }

  function rowAnim(tbrow, turnOn)
  {
    if(!turnOn)
    {
      $(tbrow).removeClass();
      if(tbLst[curTab] !== 1) $(tbrow).addClass("clean");
      if(curTab === 3) reclcSelHrows(tbrow.nextSibling);
    }
    else
    {
      $(tbrow).removeClass('clean').addClass('selected');
      if(curTab === 3) reclcSelHrows(tbrow.nextSibling);
    }
  }

  function resetEdit()
  {
    $('#ptb>tr').removeClass();
    if(tbLst[1] !== 1) $('#ptb>tr').addClass("clean");
    tGm.forEach(function(r) { r[0]= 'F'; });

    editRow= -1;
    document.getElementById("subBut").value= "New";
    $('#in1c0').val(nextID+1);
    $('#in1c1').val('');
  }
  
  // *** ---------- T I M E R  1st part----------------
  var btSec= 0;
  var btMin= 0;
  var ttMin= 0;
  var btState= 0;
  var sirenState= 0;

  function timeText(istt)
  {
    if(isRemote && !istt) return 'RFRSH';
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

  function timerPaint()
  {
    $('#blindTimer').css({filter:''});
    var bt= document.getElementById('blindTimer');

    var isBlack= false, inf= 'Click to START';

    if(isRemote) inf= 'Click to UPDATE';
    else
    if(gameOver) inf= 'Click to SAVE';
    else
    if(btState === 1) {
      isBlack= true; inf= 'Click to PAUSE'; }
    else
    if(sirenState > 0)
    {
      if( (sirenState === 1 && tbLst[2] !== 2)
         || (sirenState === 2 && tbLst[2] === 2) ) {
        inf= 'Alarm !!!'; document.body.style.backgroundColor= 'white'; }
      else {
        inf= '!!! Alarm'; document.body.style.backgroundColor= 'black'; }

      isBlack= (sirenState === 2);
    }
    
    if(tbLst[2] === 2) isBlack= !isBlack;
    (isBlack)? $(bt).css({background:'white', color:'black'})
             : $(bt).css({background:'black', color:'white'})

    bt.innerHTML= timeText(false) +'<b id="timeTxt">'
      + inf +'<br>'+ 'Game time '+ timeText(true) +'</b>';
  }

  // *** tabs# redraw... ************************************************
  function freshTab1()
  {
    var curDate= new Date();
    document.getElementById("lblDate1")
      .innerText= curDate.toLocaleDateString('en-NZ',
                    {weekday:'long', year:'numeric', month:'long', day:'numeric'});

    var tbuy, twon, tbal, tgms, tavb, tavw;
    tbuy= twon= tbal= tgms= tavb= tavw= 0;

    nextID= 0;
    $("#ptb").empty();
    plTab.forEach(function(col, cx)
    {
      tbuy+= col[2]; twon+= col[3]; tbal+= col[4];
      tgms+= col[5]; tavb+= col[6]; tavw+= col[7];
      if(+col[0] > nextID) nextID= +col[0];
      $('#ptb').append(
         '<tr tabindex="1"><td class="admin">'+ col[0]
        +'</td><td style="text-align:left">'+ col[1]
        +'</td><td>'+ fCash(col[2]*1000, col[2])
        +'</td><td>'+ fCash(col[3]*100, col[2])
        +'</td><td>'+ fCash(col[4]*100, col[2])
        +'</td><td>'+ ((col[2] === 0) ? ' ' : col[5])
        +'</td><td>'+ fCash(col[6]*100, col[2])
        +'</td><td>'+ fCash(col[7]*100, col[2])
        +'</td></tr>');
    });

    if(editMode) return;
    
    var a= plTab.length;
    $('#ptb').append( '<tr><td style="text-align:right">Total:\nAverage:'
        +'</td><td>'+ fCash(tbuy*1000)+'\n'+fCash(Math.round(tbuy /a)*1000)
        +'</td><td>'+ fCash(twon*100)+'\n'+fCash(Math.round(twon /a)*100)
        +'</td><td>'+ fCash(tbal*100)+'\n'
        +'</td><td>'+ tgms+'\n'+Math.round(tgms /a)
        +'</td><td>'+ fCash(tavb*100)+'\n'+fCash(Math.round(tavb /a)*100)
        +'</td><td>'+ fCash(tavw*100)+'\n'+fCash(Math.round(tavw /a)*100)
        +'</td></tr>'
    );
    $('#ptb>tr').last('tr').children().css({'font-size':'14px'});
  }

  function yeMny(cnt)
  {   
    var nc= $('#gtb>tr')[cnt], mny= $('.money')[cnt];
    $(mny).css({border:'', background:'darkgreen', color:'',
                height:'', width:'', 'font-size':'', padding:''});

    var k= tGm[cnt]; var t= k[1] -1; nc.cells[2].innerText= sortedPl[ t ];
    $(nc.cells[2]).css({'text-align':'left', 'font-size':'', 'color':''});
    k[2]= k[3]= 0; nc.cells[3].innerText= nc.cells[4].innerText= '';
  }
  
  function naMny(cnt)
  {
    var dd= '[OUT]';
    var mny= $('.money')[cnt];
    var nc= $('#gtb>tr')[cnt].cells[2];

    $(mny).css({border:'1px dashed grey', height:'24px', width:'50px',
                'font-size':'15px', 'padding-top':'4px', background:'none', color:'#909090'});

    var k= tGm[cnt];
    if(k[2] > 2)
      $(nc).css({'text-align':'center', 'font-size':'17px', 'color':'#909090'});
    else
    {
      if(k[2] === 1) dd= '[1st]'; else if(k[2] === 2) dd= '[2nd]';
      $(nc).css({'text-align':'right', 'font-size':'', 'color':''});
    }
    nc.innerText+= ' ' +dd;
  }

  function backAnim(rx)
  {
    var iRnk= tGm[rx][2];
    if(iRnk > curRank+1) { // !editMode && useThisDate === 0 && 
      audQuack.currentTime= 0; audQuack.play(); return; }
    
    if(gameOver)
    {
      gameOver= false; timerPaint();
 //     var wf= $('#gtb>tr')[rx1].cells[4].firstChild; $(wf).val('pooo');
    }
    curRank++; yeMny(rx);
  }

  function outAnim(rx)
  {
    var mny= $('.money')[rx];
    if(curRank === 2) rx2= rx; else if(curRank === 1) rx1= rx;
    mny.parentNode.parentNode.cells[3].innerText= (tGm[rx][2]= curRank);
//    mny.previousSibling.innerText= '';
    naMny(rx); curRank--;
    // *** GAME OVER
    if(curRank === 0) mnySplit();
  }

  function freshTab2()
  {
    gameOver= false;
    var curDate= new Date();
    var ldt= curDate.toLocaleDateString('en-NZ',
                                        {weekday:'long', year:'numeric',
                                         month:'long', day:'numeric'});

    if(useThisDate > 0) ldt= 'Modify Game: '+ useThisDate;
    else if(isRemote) ldt= 'Showing Remote Game';
    document.getElementById("lblDate").innerText= ldt;

    bankTotal= 0;
    document.getElementById('lblBank')
      .innerText= 'Bank: $'+ fCash(bankTotal*1000);

    gamePlayers= 0;
    var sortedRnk= [];
    $('#gtb').empty();
    tGm.forEach(function(col, cnt)
    { 
      if(col[0] !== 'F')
      {
        gamePlayers++;bankTotal+= (col[4] === 0)? (col[4]= 1) : col[4];
        if(col[0] === 'A' && col[2] > 0) sortedRnk.push([ col[2], col[1] ]);
      }
      else {
        col[2]= col[3]= col[4]= 0; }

      var dn= 'style="display:none"';
      if(editMode || col[0] !== 'F') dn= 'style="display:"';
      $('#gtb').append(
         '<tr '+ dn +'><td class="admin" style="text-align:center">'+ col[0]
        +'</td><td class="admin" style="padding-right:20px">'+ col[1]
        +'</td><td tabindex="1" style="text-align:left">'+ sortedPl[ col[1] -1 ]   
        +'</td><td style="text-align:center">'+ ((col[2] < 1)? ' ':col[2])
        +'</td><td>'+ fCash(col[3], 0)
        +'</td><td tabindex="1" style="text-align:right">'+ fCash(col[4] *1000)
        +'</td><td tabindex="1" style="padding:0">' //; overflow:visible
        +'<pre class="mnyInfo"' +'> </pre>'
        +'<pre class="money">  $  </pre></td></tr>' );
    });

    document.getElementById('lblBank')
      .innerText= 'Bank: $'+ fCash(bankTotal*1000);
    
    curRank= gamePlayers;
    sortedRnk.sort(function(a, b){return b[0] - a[0] });
    for(var i= 0; i < sortedRnk.length; i++)
    {
      var trx= +sortedRnk[i][1] -1;
      var rf= $('#gtb>tr')[trx].cells[3];
      outAnim(trx, rf);
    }

    timerPaint();
  }

  var msa= ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul',
                          'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  function freshTab3()
  {
    var tppl, tbnk, t1st, t2nd;
    tppl= tbnk= t1st= t2nd= 0;

    var m, d; $('#htb').empty();
    hiTab.forEach(function(col, cnt)
    {
      tppl+= +col[1]; tbnk+= +col[2]; t1st+= +col[3]; t2nd+= +col[5];
      if(+col[0] === useThisDate) editRow= cnt;
      m= +(''+col[0]).substring(4,6);
      d= (''+col[0]).substring(6,8)+" " + msa[m-1]+"`"+(''+col[0]).substring(2,4);
      $('#htb').append(
         '<tr tabindex="1"><td style="font-size:17px; text-align:center">'+ d
        +'</td><td>'+ col[1]
        +'</td><td>'+ fCash(+col[2]*1000) // bank
        +'</td><td>'+ fCash(+col[3]*100) // $:1
        +'</td><td  style="text-align:left">'+ col[4]
        +'</td><td>'+ fCash(+col[5]*100) // $:2
        +'</td><td style="text-align:left">'+ col[6]
        +'</td><td style="display:none">'+ (col[7]= cnt) +'</td></tr>');
    });

    reclcSelHrows();
    if(editMode) return;
    
    var a= hiTab.length;
      $('#htb').append(
         '<tr tabindex="1"><td style="font-size:17px; text-align:right">Total:\nAverage:'
        +'</td><td>'+ tppl+'\n'+Math.round(tppl /a)
        +'</td><td>'+ fCash(tbnk*1000)+'\n'+fCash(Math.round(tbnk /a)*1000)
        +'</td><td>'+ fCash(t1st*100)+'\n'+fCash(Math.round(t1st /a)*100)
        +'</td><td>'
        +'</td><td>'+ fCash(t2nd*100)+'\n'+fCash(Math.round(t2nd /a)*100)
        +'</td><td></td></tr>'
      );
    $('#htb>tr').last('tr').children().css({'font-size':'14px'});
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
      col[2]= +col[2];
      col[4]= +col[4];
      if(col[0] === 'F') 
      {
        col[2]= col[4]= 0;
//        adminInfo.innerText+= ('       '+ col[0]).slice(-7)+'\n';
      }
      else
        adminInfo.innerText+=
            ('        '+ col[0]).slice(-8)
          + ('     '+ col[1]).slice(-5)
          + ('     '+ col[2]).slice(-5)
          + ('        '+ col[3]).slice(-7)
          + ('        '+ col[4]).slice(-7) +' \n';
    });
  }

  function rmtLod()
  {
    useThisDate= 0;
    adminInfo.innerText+= 'REMOTE STATE:import \n';
    $.ajax(
    {
      url:appPath +'/lst', type:'GET',
      error:function(e, f) {
        nBar.innerText= ' #remote state import FAIL@client:'+ f; },
      success:function(r, s, x)
      {
        var k= r.replace(/\n|\r/g, '');
        if(k === '@#' || k.length < 9) {
          nBar.innerText= ' #none found, check history tab for finished games';
          //loadServer();
          initG();
          $('#mtb2').click();          
          return;
        }

        nBar.innerText= ' #remote state imported';
        if(k === tgm2str())
          nBar.innerText+= ' #no changes since last update';
        else
        {
          tGm.length= 0; k= k.split('|');
          k.forEach(function(row) { tGm.push( row.split(':') ); });
          prtGm(); // *** need this now to init NaNs
        }

        isRemote= true;
        $('#mtb2').click();
      }
    });    
  }

  function rmtSav(clr)
  {
    var upDat= (clr)? '@#' : tgm2str();
    adminInfo.innerText+= 'REMOTE STATE:export \n';
    $.ajax(
    {
      url:appPath +'/sst', data:upDat, type:'POST',
      error:function(e, f) {
        adminInfo.innerText+= 'Remote state export FAIL@client:'+ f; },
      success:function(r, s, x)
      {
        if(r.substring(0,4) !== 'size') {
          adminInfo.innerText+= 'Remote state export FAIL@server:'+ r; return; }

        if(clr) adminInfo.innerText+= 'Remote state cleared \n';
        else adminInfo.innerText+= 'Remote state exported '+ r.substring(5)+'\n';
      }
    }); 
  }

  function loadState(isImport)
  { 
    if(!window.localStorage) {
      adminInfo.innerText+= 'FAIL:window.localStorage \n'; return; }
   
    adminInfo.innerText+= 'LOCAL STATE:import \n';
    
    var loDat= localStorage.getItem('gameState');
    if(!loDat) {
      adminInfo.innerText+=
        'Local state empty, skip import \n'; return; }

    adminInfo.innerText+= 'Local state acquired, ';
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

    nBar.innerText= ' #local state imported';
    adminInfo.innerText+= 'Local state imported, rows#: '+ tGm.length +'\n';
    
    prtGm(); // *** need this now to init NaNs
  }
  
  function tgm2str()
  {
    var x= [];
    tGm.forEach(function(r) {
      if(r[0] !== 'F') r[0]= 'A'; x.push( r.join(':') ); });
    return x.join('|');
  }
  
  function saveState(clr)
  {
    if(!clr && curRank < 2) return;
    adminInfo.innerText+= 'LOCAL STATE:export \n';
                     
    if(isRemote || useThisDate > 0)
      adminInfo.innerText+= 'ABORT@saveSate:remote or edit mode active \n';
    else
    {
      if(gsE) rmtSav(clr);
      else adminInfo.innerText+= 'ABORT@remote export:sharing off \n';

      if(!window.localStorage)
        adminInfo.innerText+= 'FAIL:window.localStorage \n';
      else
      { // local PASS
        var loDat= localStorage.getItem('gameState');
        if(loDat || clr)
        {
          localStorage.removeItem('gameState');
          adminInfo.innerText+= "Local state cleared \n";
        }

        if(!clr)
        {
          localStorage.setItem('gameState', tgm2str());
          nBar.innerText+= ' #game state stored';           
          adminInfo.innerText+= "Local state exported, rows#: "+ tGm.length +'\n';
        }
      }
    }
//    $('#mtb2').click();
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

  function actSavG()
  {
    var udt= (useThisDate > 0)
    var cf1= tGm[rx1][3], cf2= tGm[rx2][3];
    $('#gtb>tr')[rx1].cells[4].innerText= fCash(cf1*100);
    tGm.sort(function(a, b) { return a[2] - b[2]; });

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
    if(udt)
    {
      gdat= useThisDate;
      hiTab.splice(editRow, 1);
    }
    else
    if(hiTab.length > 0 && gdat <= lastDate) gdat= lastDate +1;

    hiTab.push([ gdat, gamePlayers, bankTotal, cf1,
                 sortedPl[rx1], cf2, sortedPl[rx2], 0, aux8.substr(1) ]);
    
    reclcAll(); initG();
    $('#mtb3').click();

    if(udt) $('#htb>tr').eq(editRow).click();
    else $('#htb>tr').eq(0).click();

    saveDB(false);
    saveState(true);
    
    useThisDate= 0;
    gamePlayers= 0;
    gameOver= false;
    rx1= rx2= 0;
  }

  function finalSave()
  {
    var cf1= tGm[rx1][3], cf2= tGm[rx2][3];
    if(isNaN(cf1) || isNaN(cf2) || cf2 < 0 
       || cf1 < cf2 || cf1 < bankTotal*5 || cf1 > bankTotal*10)
    {
      if(Math.random() < 0.4) alert("It does not compute!");
      else if(Math.random() < 0.7) alert("W-w-whaaat?!");
      else alert("La-le-li-lu-le-lo?!");

      $('#gtb>tr')[rx1].cells[4].firstChild.focus();
    }
    else
    if(confirm('1st $'+ fCash(cf1*100) +'  ::  ' 
                      + '2nd $'+ fCash(cf2*100) +' \n '))
    { // Save it!
      ssPend= false; clearTimeout(clrST);
      actSavG();
    }
    else
      $('#gtb>tr')[rx1].cells[4].firstChild.focus();
  }

  function mnySplit()
  {
    var wfO= $('#gtb>tr')[rx1].cells[4];
    wfO.innerText= '';
    wfO.innerHTML= '<input type="tel" autocomplete="off" '
      +'style="text-align:right; padding:2px 9px; margin:-5px">';       
  
    var wf= wfO.firstChild;
    $(wf).css({border:'1px solid gold', width:'90%'});
    
    $(wf).off();
    $(wf).on('focus', function(e)
    {
      tGm[rx1][3]= 0;
      tGm[rx2][3]= 0;
      this.value= '00';
      this.setSelectionRange(0, 0);
      $('#gtb>tr')[rx2].cells[4].innerText= '???';
    });

    $(wf).on("keydown", function(e)
    {
      if(e.which === 13 || e.which === 9)
      {
        finalSave();
      }
    });

    $(wf).on("keyup", function(e)
    {
      var w2Typ= $('#gtb>tr')[rx2].cells[4];

      var wf1, wf2;
      var nsf= (this.value.replace(/,/g, ''));

      if(e.which === 8 || isNaN(nsf)
         || +nsf <= 0 || nsf === '00')
      {
        tGm[rx1][3]= 0;
        tGm[rx2][3]= 0;
        this.value= '00';
        this.setSelectionRange(0, 0);
        w2Typ.innerText= '???';
        return;
      }

      if(nsf > 99) nsf/= 100;

      wf1= parseInt(nsf, 10);
      wf2= bankTotal*10 - wf1;

      tGm[rx1][3]= wf1;
      tGm[rx2][3]= wf2;
      this.value= fCash(wf1*100);
      w2Typ.innerText= fCash(wf2*100);
//      w1Typ.setSelectionRange(w1Typ.value.length-2, w1Typ.value.length-2);
    });
    btState= 0; sirenState= 0;
    gameOver= true; timerPaint();
    wf.focus();
  }

  // *** main redraw function ***************************************
  function initG()
  {
    tGm.length= 0;
    sortedPl.length= plTab.length;
    plTab.forEach(function(x, c)
    {
      if(x[5] < 1) {
        x[2]= x[3]= x[5]= x[6]= x[7]= 0; x[4]= (-900 - x[0]); }

      sortedPl[ +x[0]-1 ]= x[1];
      tGm.push([ 'F', c+1, 0, 0, 0 ]);
    });

    isRemote= false; useThisDate= 0; btInit();
    sortem(curTab= 1, 5); reFresh();
  }
  
  function reFresh()
  { 
    $('#mtb1').val(ttxt);
    switch(curTab)
    {
      case 1: freshTab1(); break;
      case 2: freshTab2(); break;
      case 3: freshTab3(); break;
    }

    setRowSpc(); setRowCol();
    lastTab= curTab;

    if(editMode) $(".admin").css("display", "table-cell");
    else $(".admin").css("display", "none");
  }
  // *** END REFRESH *****************************************

  $('#gameTable').click(function(e)
  {
    if(e.target.parentNode.rowIndex === 0) return;
    var lmy= document.getElementsByClassName('money');
    ssPend= true;
    clearTimeout(clrST);
    clrST= setTimeout(function()
    {
      saveState(false); ssPend= false;
      for(var i= 0; i < lmy.length; i++) {
        $(lmy[i].previousSibling).css({'font-size':'15px'}); } 
    }, 2500);

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
        .innerText= fCash(1000* (++tGm[rx][4]));

      bankTotal++;
      document.getElementById('lblBank')
        .innerText= 'Bank: $'+ fCash(bankTotal*1000);
    }
    else
    if(e.target.cellIndex === 2 || e.target.cellIndex === 3)
    {
      var rx= e.target.parentNode.rowIndex-1;

      if(tGm[rx][2] > 0)
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

      bankTotal-= (tGm[rx][4] -1);
      document.getElementById('lblBank')
        .innerText= 'Bank: $'+ fCash(bankTotal*1000);
      
      e.target.innerText= fCash(1000* (tGm[rx][4]= 1));
    }
//    else { alert('Something else!!'); }
  });

  $('#playerTable').click(function(e)
  {
    var trx= e.target.parentNode.rowIndex;
    if(trx === 0)
    {
      var os= oldSrt[1], s= e.target.cellIndex;
      s= (!(os < 0)&& Math.abs(os) -1 === s)? -(s+1) : s+1;
      sortem(1, s);

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
      if(editMode) resetEdit();
      else rowAnim(rtg, false);
      return;
    }

    if(editMode)
    {
      resetEdit();
      document.getElementById("subBut").value= "Edit";

      editRow= trx -1;
      $('#in1c0').val( plTab[editRow][0] );
      $('#in1c1').val( plTab[editRow][1] );
      rowAnim(rtg, true);
      return;
    }

    if(tGm[pid][4] > 0)
    {
      tGm[pid][0]= 'A';
      $(rtg).removeClass().addClass('already selected');
    }
    else
    {
      tGm[pid][2]= 0;
      tGm[pid][0]= 'T';
      rowAnim(rtg, true);
    }
  });

  // *** $('#historyTable') ****************************
  //firefox fix
  function firefoxFix()
  {
    var z= Math.abs(oldSrt[3]) -1;
    if($('#hth>tr').children()[z].style.borderColor === 'grey')
      $('#hth>tr').children().eq(z).css({'border-color':'rgb(128, 128, 127)'});
    else
      $('#hth>tr').children().eq(z).css({'border-color':'grey'});
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

  $('#historyTable').on('click', function (e)
  {
    if(useThisDate > 0) {
      e.stopPropagation();
      nBar.innerText= ' #not now, edit mode activated'; return;
    }

    var etpn= e.target.parentNode;
    if(etpn.rowIndex === undefined) etpn= e.target;
    
    if(etpn.rowIndex === 0)
    {
      var os= oldSrt[3], s= e.target.cellIndex;
      s= (!(os < 0) && Math.abs(os) -1 === s)? -(s+1) : s+1;
      sortem(3, s);
      
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
      $('#dtEdit').val( hiTab[ri][0] );
      $('.initDis').prop("disabled", false);
    }

    var d= hiTab[ri][0].toString();
    var m= +d.substring(4,6);
    var ws= d.substring(6,8)
              +' '+ msa[m-1]
              +' '+ d.substring(0,4)
              +' @ '+ d.substring(8,10)
              +':'+ d.substring(10,12);

    var scd= '';
    scd+= 'RANK  NAME    $BUY      $WON \n'
        + '–––––––––––––––––––––––––––––                 '+ ws +'\n';
    var mg= hiTab[ri][8].split('#');
    mg.forEach(function(x, cx)
    {
      var a= x.split('&');
      var won= 0, pid= +a[0], buy= +a[1];
      if(++cx === 1) won= hiTab[ri][3]; // $:1
      else if(cx === 2) won= hiTab[ri][5]; // $:2
      else if(cx === 3) scd+= '\n';
      
      var wons= (won === 0)? ' ':fCash(+won*100);
      scd+= ('   ' + cx).slice(-3) +'.  '
          + (sortedPl[ pid ] +'         ').substring(0, 9)
          + ('   '+ (buy+'k')).slice(-3) 
          + ('           '+ wons).slice(-10) +' \n';
    });

    var h= (+hiTab[ri][1] +4) *15;
    $(etpn).after(
        '<tr class="extra"><td colspan=7>'+'<pre style="height:'
      + h +'px; '+'padding:9px 10px; margin:0; text-align:left; '
      + 'user-select: none; pointer-events:none; font-size:14px">'
      + scd +'</pre></td></tr>');
    rowAnim(etpn, true);
    firefoxFix(); setRowCol();
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
// *** UNPACK & IMPORT
    var rd= data.split('@');

    var yr= rd[0];
    sortedPl= rd[1].split('|');
    var hiLoad= rd[2].split('|');
  
    plTab.length= 0;
    sortedPl.forEach(function(x, c)
    {
// ***               0   1    2    3    4    5    6    7
//    pltab        píd  nme  buy  won  bal  ngm  av6  av7
      plTab.push( [c+1, x,     0,   0,   0,   0,   0,   0] );
    });
    
    hiTab.length= 0;
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
      
    curTab= 4; reFresh();
      
    reclcAll();
    
    initG();
  
    
    loadState(true);
    $('#mtb1').click();
  }

  function cchInfo()
  { //    adminInfo.innerText+= "Cache info.v9 -- \n";
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
              var strOut= 'Cache data files: \n';
              reqs.forEach(function(rs, i)
              {
                strOut+= '            '+ ('   '+ (i+1)).slice(-3) +':: '
                  + (rs.url).substr(0+ (rs.url).lastIndexOf('/')) +'\n';
              });
              adminInfo.innerText+= 'Cache name: '+ cacheName +' \n'+ strOut +'\n';
              strOut= '';
          });
        });
      });
    }
    else adminInfo.innerText+= 'FAIL' +t;
    
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
      else adminInfo.innerText+= 'FAIL' +t;

      t= ':navigator.storage.persist \n';
      if(navigator.storage.persist)
      {
        adminInfo.innerText+= 'PASS' +t;
        navigator.storage.persisted().then(function(getP) {
          adminInfo.innerText+= "Persistence: "+ getP +'\n'; });
      }
      else adminInfo.innerText+= 'FAIL' +t;
    }
    else adminInfo.innerText+= 'FAIL' +t;

    t= ':navigator.serviceWorker \n';
    if(navigator.serviceWorker) adminInfo.innerText+= 'PASS' +t;
    else adminInfo.innerText+= 'FAIL' +t;

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
    if(!d) { nBar.innerText= ' #no cache data '; return; }

    if(isImport) {
      importDB(d); adminInfo.innerText+=  'import@loadCache-RAW: \n'; }
    else
      adminInfo.innerText+=  'info@loadCache-RAW: \n';

    var as= '–––––––––1–––––––––2–––––––––3–––––––––4–––––––––5–––––––––6–––––––––7–––––––––8 \n';
    for(var i= 0; i < d.length; i++) {
      if(i > 0 && i%80 === 0) as+= '\n'; as+= d.charAt(i); }
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
        ttxt= 'CACHE'; loadCache(true); $("#mtb4").click();
      },
      success:function(r, s, x)
      {
        var d= r.replace(/\n|\r/g, '');
        adminInfo.innerText+= x.getAllResponseHeaders() +'\n'
          + 'PASS:server load '+ (d.length/1024).toFixed(2) +'KB \n';
        ttxt= 'Party Mix';
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
    adminInfo.innerText+= 'PASS:cache save '+ (rawdb.length/1024).toFixed(2) +'KB \n';

    if(cchOnly) return;

    // *** SERVER SAVE
    adminInfo.innerText+= 'SERVER:export & save \n';

    if(!navigator.onLine) {
      adminInfo.innerText+= 'FAIL:navigator.online \n'; return; }
    else
    if(!isLogged) {
      adminInfo.innerText+= 'FAIL:no password\n';
      nBar.innerText= ' #must be logged to update server database'; return; }

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
          adminInfo.innerText+= 'FAIL@server:'+ r +'\n'; return; }

        nBar.innerText+= ' #server save '+ r.substring(5);
        adminInfo.innerText+= x.getAllResponseHeaders() +'\n'
          + 'PASS:server save '+ (rawdb.length/1024).toFixed(2) +'KB \n';
      }
    });
  }

  function loadDB()
  {
    if(!navigator.onLine)
    {
      adminInfo.innerText+= 'FAIL@navigator.offline \n';
      ttxt= 'OFFLINE'; loadCache(true); $("#mtb4").click();
      return;
    }
    loadServer();
  }

  // *** action starts here *********************************                     
  if(navigator.storage) {
    navigator.storage.persisted().then(function(getP) {
      if(getP) {
        $('#gpc4But').val("Persistance Granted");
        $('#gpc4But').css({background:'none', color:'black', 'box-shadow':'none'}); }
    });
  }
  clrAdmin();
  loadDB();


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

    if(editMode) $("#mnu1").click();
    switch(tid)
    {
      case '#tab1': curTab= 1; setRowCol(); break;
      case '#tab2': curTab= 2; reFresh(); break;
      case '#tab3': curTab= 3; break;
      case '#tab4': curTab= 4; break;
    }
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

    timerPaint();
  }

  function bkgSiren()
  {
    if(sirenState === 0) return;
    audQuack.currentTime= 0; audQuack.play();   
  
    timerPaint();
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
    nBar.innerText= ' #timer click..';
    if(isRemote) { rmtLod(); return; }
    if(gameOver) { finalSave(); return; }

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
        timerPaint();
      break;
       
      case 1:
        timerPaint(); setTimeout( minuteUp, 1000);
      break;
       
      case 2:
        btState= 9; sirenState= 1;
        $('#mtb2').click(); setTimeout(bkgSiren, 99);
      break;
    }
  });

  $('#timeSelect').on('focus change',function()
  {
    if(btState !== 0) return;
    var ni= (this.options[this.selectedIndex].text).indexOf('min');
    var ts= (this.options[this.selectedIndex].text).substring(0, ni);
    btSec= 60; btMin= +ts -1; timerPaint();
  });

  // *** BUTTONS #################################################
  $('.ord2').click( function() { clrAdmin(); });
  $('.ptab').click( function(e) { clrAdmin(1); }); // 1= clr just #notif
  $('#headbar').click(function() {
    var t= nBar.innerText; nBar.innerText= lastNotif; lastNotif= t;  });
  $('.mnu, .mtb, .ord, .ord2, #blindTimer').click(function(e) { e.stopPropagation(); });
  // *** .........................................................
  $("#rmtLod2").click(function() { rmtLod(); });
  
  $("#mnu1").click(function()
  { // star A.
    if(curTab === 4) {
      clrAdmin(); adminInfo.innerText+=
        'Made by zele-chelik!, Jun 2018. \n'; return; }
//alert('ct= '+curTab);
    if(editMode= !editMode)
    {
      if(useThisDate > 0)
      {
        nBar.innerText+= ' #edit mode activated';
        editMode= false; return;
      }

      if(curTab === 1) {
        resetEdit(); $('#ptb>tr').last('tr').remove(); }
      else
      if(curTab === 3)
      {
        $('#htb>tr.extra').remove();
        $('#htb>tr').last('tr').remove();
        $('#htb>tr').removeClass(); setRowCol(3);
        $('#dtEdit').val(''); $('.initDis').prop("disabled", true);
      }

      $(".admin").css("display", "table-cell");
      $('.adminEdit').css('display', 'block');
    }
    else
    {
      if(curTab === 1) initG();
      else
      if(curTab === 3 && useThisDate === 0 && !isRemote)  {
        reclcAll(); initG(); curTab= 3; }

      $(".admin").css("display", "none");
      $('.adminEdit').css('display', 'none');
    }
  });

  $("#mnu2").click(function()
  { // arrow B.
    if(curTab < 4) tbSpc[curTab]= (tbSpc[curTab] !== '45px')? '45px':'59px';
    else tbSpc[curTab]= (tbSpc[curTab] !== '300px')? '300px':'auto';
    setRowSpc();
  });
   
  $("#mnu3").click(function()
  { // line C.
    if(curTab === 4) {
      clrAdmin(); adminInfo.innerText=
        'What?! Why did you do that just now? \n'; return; }

    if(++tbLst[curTab] > 3) tbLst[curTab]= 1;
    setRowCol();
  });
  
  $('#subBut').click(function()
  {
    var col0 = $('#in1c0').val(); // pid
    var col1 = $('#in1c1').val(); // nme
    
    if(editRow >= 0) plTab[editRow][1]= col1;
    else plTab.push([ col0, col1, 0, 0, 0, 0, 0, 0 ]);

    resetEdit();
    initG(); reFresh();
  });

  // *** INPUT TEXT FIELD ...............................
  $(".finf").on('keydown', function(e)
  {
    if(e.which !== 9 && e.which !== 13) return;
    $(this).next().click();
  });

  // *** TAB 1 : ADMIN BUTTONS ***************************************
  $("#raz1But").click(function()
  { //>Reset All to Zero<
    plTab.forEach(function(col) {
      col[2]= col[3]= col[5]= col[6]= col[7]= 0; col[4]= (-900 -col[0]); });
    
    hiTab.length= 0;
    initG(); reFresh();
  });
  // *** To be, or no delete?
  $('#rli1But').click( //>Remove Last ID<
    function() { plTab.splice(nextID-1, 1); reFresh(); });
  $("#rma1But").click(function() { //>Remove All<
    plTab.length= 0; hiTab.length= 0; initG(); reFresh(); });

  // *** TAB 2 : ADMIN BUTTONS ***************************************
  $("#rng2But").click(function()
  { //>Create Random Game<
    var g= tGm.length;
    if(g < 4) {
      nBar.innerText= ' #need 4 players at least'; return; }

    var x, u= false, p= [1,2,3];
    var n= Math.round(Math.random()*g) -g/5;
        n= Math.max(4, n); n= Math.min(9, n);

    p.length= 0;
    for(var i= 0; i < n; i++)
    {
      while(!u)
      {
        u= true;
        x= Math.round(Math.random()*g);
        for(var j= 0; j < p.length; j++) {
          if(x === p[j]) { u= false; break; } }
      }
      u= false; p.push(x);
    }

    $('#mnu1').click();
    tGm.forEach(function(r) {
      r[0]= 'F'; r[2]= r[3]= r[4]= 0; });

    p.forEach(function(id, c)
    {
      var k= tGm[+id]; k[0]= 'A'; k[2]= c+1;
      if(+id < 4) k[4]= 2+ Math.floor(Math.random()*8);
      else if(+id < 8) k[4]= 1+ Math.floor(Math.random()*5);
      else k[4]= 1+ Math.floor(Math.random()*3);
    });
    $('#mtb2').click();
  });

  // *** TAB 3 : ADMIN BUTTONS **********************************
  $("#rdt3But").click(function()
  { //>Re-Date<
    var nd= $('#dtEdit').val();
    $('#htb>tr')[editRow]
      .cells[0].innerText= hiTab[editRow][0]= +nd;
  });
  
  $("#mdf3But").click(function()
  { //>Modify<
    var ri= editRow;
    isRemote= false;
    useThisDate= +hiTab[ri][0];
    tGm.forEach(function(r) {
      r[0]= 'F'; r[2]= r[3]= r[4]= 0; });

    var mg= hiTab[ri][8].split('#');
    var w1= hiTab[ri][3], w2= hiTab[ri][5]; // $1 & $2

//    mdfySort= oldSrt[3];
//    $('#mnu1').click();
    mg.forEach(function(x, cx)
    {
      var a= x.split('&');
      var won= 0, pid= +a[0], buy= +a[1];
      if(++cx === 1) won= w1; else if(cx === 2) won= w2;

      var k= tGm[pid];
      k[0]= 'A'; k[1]= pid+1; k[2]= cx; k[3]= won; k[4]= buy;
    });
    $('#mtb2').click();
  });

  $('#rmr3But').click(function() { //>Remove<
    hiTab.splice(editRow, 1); reclcAll(); initG(); reFresh(); });
  
  // *** tab3 - class="ord2" : DARK BOTTOM BUTTON
  $("#rcl3But").click(function() { //>Recalculate All<
    reclcAll(); initG(); $('#mtb1').click(); });
  $("#rma3But").click(function() { //>Remove All<
    hiTab.length= 0; reFresh(); });
  
  // *** TAB 4 : ADMIN BUTTONS ***************************************
  $("#log4But").click(function() { //>Log In<
    if(isLogged) return; dbPass= $('#pasIn').val(); logMe(); });
  
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
    ttxt= 'IMPORT'; loadCache(true); });
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
      if(getP) adminInfo.innerText+= "Storage persistence already granted! \n";
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
              adminInfo.innerText+= 'Notifications unavailable, try Chromium! \n';
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
  var wlE= false, gsE= true;
  $('#rgs4But').click(function()
  {
    if(gsE= !gsE) this.value= 'Sharing:ON';
    else this.value= 'Sharing:OFF';
  });

  $('#wlk4But').click(function()
  {
    if(wlE= !wlE)
    {
      noSleep.enable(); this.value= 'WakeLock:ON';
      document.body.style.backgroundColor= '#333333';
    }
    else
    {
      noSleep.disable(); this.value= 'WakeLock:OFF';
      document.body.style.backgroundColor= '#777777';
    }
  });
  var noSleep= new window.NoSleep();

}); // THE END
