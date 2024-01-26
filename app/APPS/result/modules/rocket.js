'use strict';

(function () {

  let startYear = 2023;
  let startMonth ="November";
  let monthNameList = {"December":'12',"November":'11',"October":'10',"September":'09',"August":'08',"July":'07', "June":'06',  "May":'05',  "April":'04',  "March":'03',   "February":'02', "January":'01' };

  init();

  function init() {
    $('#pageTitle').html('Game Results');
    getGameType();
    generateOldMonth();
    bindEvents();
  }

  function bindEvents() {
    $('#liveResult').on('click',getLiveResult);
    $('#gameName').on('change',getLiveResult);
    $('#oldResult').on('click','.monthResult',getMonthlyResult);
  }

  function getGameType(){
    $('#gameName').html('');
    backendSource.getObject('game', null, {where:[
      {'key':'status','operator':'is','value':1}
    ]}, function (data) {
      data.MESSAGE.map(e=>{
        $('#gameName').append(`
          <option value="${e.code}">${e.name}</option>
        `);
      });
      getLiveResult();
    });
  }

  function generateOldMonth(){
    const d = new Date();
    let year = d.getFullYear();
    let htm = ``;
    const currentYear = moment().year();
    const currentMonth = moment().month()+1;
    let monthBreak = 1

    while(year >= startYear){
      for(let i in monthNameList){
        if (year === currentYear && parseInt(monthNameList[i]) > currentMonth)continue;
        if(year == startYear){
          if(monthBreak==1){
            htm += `<div class="conBox my-2 monthResult" data-month="${monthNameList[i]}" data-year="${year}">${i}&nbsp;${year} results</div>`;
            if(i == startMonth)monthBreak=0;
          }
        }else{
          htm += `<div class="conBox my-2 monthResult" data-month="${monthNameList[i]}" data-year="${year}">${i}&nbsp;${year} results</div>`;
        }
      }
      year--;
    }
    $('#oldResult').html(htm);
  }

  function scrollToResult(){
    $("html, body").animate({
      scrollTop: $("#resultArea").offset().top - 100
    }, 1000);
  }

  function getMonthlyResult(){
    let month = $(this).attr('data-month');
    let year = $(this).attr('data-year');
    let htm = `<p>No data found.</p>`;
    let gameCode = $('#gameName').val();
    let gameName = gameCode=='mumbaiRocket'?'MR':'ES';
    backendSource.getObject('game_inplay', null, {where:[
      {'key':'game_code','operator':'is','value':gameCode},
      {'key':'start','operator':'higher','value':year+'-'+month+'-01 00:00:00'},
      {'key':'end','operator':'lower','value':year+'-'+month+'-31 23:59:59'},
    ],
    order:{'by':'id','type':'DESC'}}, function (game) {
      if(game.SUCCESS){
        if(game.MESSAGE.length>0){
          let arr = {};
          for(let i in game.MESSAGE){
            if(!arr['key'+moment(game.MESSAGE[i].end).format('DD')]){
              arr['key'+moment(game.MESSAGE[i].end).format('DD')] = {key:moment(game.MESSAGE[i].end).format('DD'),val:[]};
            }
            arr['key'+moment(game.MESSAGE[i].end).format('DD')].val.push(game.MESSAGE[i]);
          }
          htm = '';
          
          const keyValueArray = Object.entries(arr);
          keyValueArray.sort((a, b) => b[0].localeCompare(a[0]));
          arr = Object.fromEntries(keyValueArray);
          
          for(let i in arr){
            let patti = ``, single=``;
            for(let j in arr[i].val){
              patti = `<td class="item${i%2}">${arr[i].val[j].result_one??'-'}</td>`+patti;
              single = `<td class="item${i%2}">${arr[i].val[j].result_two??'-'}</td>`+single;
            }
            htm += `<table>
                  <tr>
                    <td colspan="8" class="resultBg">${moment(year+'-'+month+'-'+arr[i].key).format('DD MMMM YYYY')}</td>
                  </tr>
                  <tr>
                    <td class="resultBg">${gameName}1</td>
                    <td class="resultBg">${gameName}2</td>
                    <td class="resultBg">${gameName}3</td>
                    <td class="resultBg">${gameName}4</td>
                    <td class="resultBg">${gameName}5</td>
                    <td class="resultBg">${gameName}6</td>
                    <td class="resultBg">${gameName}7</td>
                    <td class="resultBg">${gameName}8</td>
                  </tr>
                  <tr>
                    ${patti}
                  </tr>
                  <tr>
                    ${single}
                  </tr>
                </table>`;
          }
        }
      }
      $('#resultArea').html(htm);
      scrollToResult();
    });
    
  }

  async function getLiveResult(){
    let toDay = moment().format('YYYY-MM-DD');
    let gameCode = $('#gameName').val();
    let gameName = gameCode=='mumbaiRocket'?'MR':'ES';
    let game = await DM_GENERAL.fetchInplayGame([
      {'key':'game_code','operator':'is','value':gameCode},
      {'key':'start','operator':'higher','value':toDay+' 00:00:00'},
      {'key':'end','operator':'lower','value':toDay+' 23:59:59'},
    ]);
    let patti = ``, single=``;
    let bTmp = `
      <td class="item0">-</td>
      <td class="item1">-</td>
      <td class="item0">-</td>
      <td class="item1">-</td>
      <td class="item0">-</td>
      <td class="item1">-</td>
      <td class="item0">-</td>
      <td class="item1">-</td>
    `;
    
    if(game.SUCCESS){
      if(game.MESSAGE.length>0){
        
        for(let i in game.MESSAGE){
          patti += `<td class="item${i%2}">${game.MESSAGE[i].result_one??'-'}</td>`
          single += `<td class="item${i%2}">${game.MESSAGE[i].result_two??'-'}</td>`
        }
      }else{
        patti  = single =  bTmp;
      }
    }else{
      patti  = single = bTmp;
    }
    let htm = `<table>
        <tr>
          <td colspan="8" class="resultBg">${moment().format('DD MMMM YYYY')}</td>
        </tr>
        <tr>
          <td class="resultBg">${gameName}1</td>
          <td class="resultBg">${gameName}2</td>
          <td class="resultBg">${gameName}3</td>
          <td class="resultBg">${gameName}4</td>
          <td class="resultBg">${gameName}5</td>
          <td class="resultBg">${gameName}6</td>
          <td class="resultBg">${gameName}7</td>
          <td class="resultBg">${gameName}8</td>
        </tr>
        <tr>
          ${patti}
        </tr>
        <tr>
          ${single}
        </tr>
      </table>`;
    $('#resultArea').html(htm);
    scrollToResult();
  }

})();
