'use strict';

(function () {

  let gameSet = {
    'one':[1,100, 678, 777, 560, 470, 380, 290,119,137,236,146,669,579,399,588,489,245,155,227,344,335,128],
    'two':[2,200,345,444,570,480,390,660,129,237,336,246,679,255,147,228,499,688,778,138,156,110,589],
    'three':[3,300,120,111,580,490,670,238,139,337,157,346,689,355,247,256,166,599,148,788,445,229,779],
    'four':[4,400,789,888,590,130,680,248,149,347,158,446,699,455,266,112,356,239,338,257,220,770,167],
    'five':[5,500,456,555,140,230,690,258,159,357,799,267,780,447,366,113,122,177,249,339,889,348,168],
    'six':[6,600,123,222,150,330,240,268,169,367,448,899,178,790,466,358,880,114,556,259,349,457,277],
    'seven':[7,700,890,999,160,340,250,278,179,377,467,115,124,223,566,557,368,359,449,269,133,188,458],
    'eight':[8,800,567,666,170,350,260,288,189,116,233,459,125,224,477,990,134,558,369,378,440,279,468],
    'nine':[9,900,234,333,180,360,270,450,199,117,469,126,667,478,135,225,144,379,559,289,388,577,568],
    'zero':[0,'000',127,190,280,370,460,550,235,118,578,145,479,668,299,334,488,389,226,569,677,136,244]
  };

  let startYear = 2023;
  let startMonth ="November";
  let monthNameList = {"December":'12',"November":'11',"October":'10',"September":'09',"August":'08',"July":'07', "June":'06',  "May":'05',  "April":'04',  "March":'03',   "February":'02', "January":'01' };

  init();

  function init() {
    $('#pageTitle').html('M.Rocket Results');
    getLiveResult();
    generateOldMonth();
    bindEvents();
  }

  function bindEvents() {
    $('#liveResult').on('click',getLiveResult);
    $('#pattiList').on('click',pattiList);
    $('#oldResult').on('click','.monthResult',getMonthlyResult);
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

  function pattiList(){
    let htm = ``;
    for (const i in gameSet) {
      let htmT = ``;
      let c = 0;
      for(const j in gameSet[i]){
        htmT += `<div class="innerNum ${c++ ==0?'head':''}">
                  ${gameSet[i][j]}
                </div>`;
      }
      htm += `<div class="numWraper">
                  ${htmT}
            </div>`;
    }
    $(`#resultArea`).html(`<div class="container">
            ${htm}
            <div style="clear:both;"></div>
        </div>`);
    scrollToResult();
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
    
    backendSource.getObject('game_inplay', null, {where:[
      {'key':'game_code','operator':'is','value':'mumbaiRocket'},
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
                    <td class="resultBg">MR1</td>
                    <td class="resultBg">MR2</td>
                    <td class="resultBg">MR3</td>
                    <td class="resultBg">MR4</td>
                    <td class="resultBg">MR5</td>
                    <td class="resultBg">MR6</td>
                    <td class="resultBg">MR7</td>
                    <td class="resultBg">MR8</td>
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
    let game = await DM_GENERAL.fetchInplayGame([
      {'key':'game_code','operator':'is','value':'mumbaiRocket'},
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
          <td class="resultBg">MR1</td>
          <td class="resultBg">MR2</td>
          <td class="resultBg">MR3</td>
          <td class="resultBg">MR4</td>
          <td class="resultBg">MR5</td>
          <td class="resultBg">MR6</td>
          <td class="resultBg">MR7</td>
          <td class="resultBg">MR8</td>
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
