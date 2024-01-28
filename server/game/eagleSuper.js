const moment = require('moment');
const libFunc = require('../lib/func.js');
let sql = require('../modules/mysql/common').init;


const eagleSuper = function () {
  this.code = 'eagleSuper';
  this.func = new libFunc();
  this.price = {'patti':125,'single':9.1};
  this.gameSet = {
    1:[1,100, 678, 777, 560, 470, 380, 290,119,137,236,146,669,579,399,588,489,245,155,227,344,335,128],
    2:[2,200,345,444,570,480,390,660,129,237,336,246,679,255,147,228,499,688,778,138,156,110,589],
    3:[3,300,120,111,580,490,670,238,139,337,157,346,689,355,247,256,166,599,148,788,445,229,779],
    4:[4,400,789,888,590,130,680,248,149,347,158,446,699,455,266,112,356,239,338,257,220,770,167],
    5:[5,500,456,555,140,230,690,258,159,357,799,267,780,447,366,113,122,177,249,339,889,348,168],
    6:[6,600,123,222,150,330,240,268,169,367,448,899,178,790,466,358,880,114,556,259,349,457,277],
    7:[7,700,890,999,160,340,250,278,179,377,467,115,124,223,566,557,368,359,449,269,133,188,458],
    8:[8,800,567,666,170,350,260,288,189,116,233,459,125,224,477,990,134,558,369,378,440,279,468],
    9:[9,900,234,333,180,360,270,450,199,117,469,126,667,478,135,225,144,379,559,289,388,577,568],
    0:[0,'000',127,190,280,370,460,550,235,118,578,145,479,668,299,334,488,389,226,569,677,136,244]
  };
}

eagleSuper.prototype.startGame = async function () {
  let _ = this;
  let conn = await sql.connectDB();

  let runningGame = await sql.getData('game_inplay', {'where':[
    {'key':'game_code','operator':'is','value':_.code},
    {'key':'status','operator':'is','value':1}
  ]});
  if(runningGame.SUCCESS && runningGame.MESSAGE.length>0){
    
    for(const item of runningGame.MESSAGE){
      await sql.setData('game_inplay',{
        'id':item.id,
        'status':2});
    }
  }
  let curDate = moment().format('YYYY-MM-DD H:mm')+':00';
  let targetGame = await sql.getData('game_inplay', {'where':[
    {'key':'game_code','operator':'is','value':_.code},
    {'key':'status','operator':'is','value':0},
    {'key':'start','operator':'is','value':curDate}
  ]});
  if(targetGame.SUCCESS && targetGame.MESSAGE.length>0){
    for(const item of targetGame.MESSAGE){
      await sql.setData('game_inplay',{
        'id':item.id,
        'status':1});
    }
  }
  conn.release();
}

eagleSuper.prototype.generateGame = async function (data) {
  let curDate = moment().format('YYYY-MM-DD');
  if(data && data.date){
    curDate = data.date;
  }

  let gameStartTime = [
    {'name':"ES1",start:"07:10:00",end:"09:30:00",duration:150},
    {'name':"ES2",start:"09:30:00",end:"11:00:00",duration:90},
    {'name':"ES3",start:"11:00:00",end:"12:30:00",duration:90},
    {'name':"ES4",start:"12:30:00",end:"14:00:00",duration:90},
    {'name':"ES5",start:"14:00:00",end:"15:30:00",duration:90},
    {'name':"ES6",start:"15:30:00",end:"17:00:00",duration:90},
    {'name':"ES7",start:"17:00:00",end:"18:30:00",duration:90},
    {'name':"ES8",start:"18:30:00",end:"20:00:00",duration:90}
  ];
  let _ = this;
  return new Promise(async function (result) {
    let conn = await sql.connectDB();
    let res = await sql.getData('game_inplay', {'where':[
        {'key':'game_code','operator':'is','value':_.code},
        {'key':'start','operator':'higher-equal','value':curDate+' 00:00:00'},
      ]});
    for(let i in gameStartTime){
      let found = false;
      if(res.SUCCESS && res.MESSAGE.length>0){
        found = _.func.findValueDate(res.MESSAGE, 'start',curDate+' '+gameStartTime[i].start);
      }

      if(!found){
        await sql.setData('game_inplay',
            {'name':gameStartTime[i].name,
            'start':curDate+' '+gameStartTime[i].start,
            'end':curDate+' '+gameStartTime[i].end,
            'duration':gameStartTime[i].duration,
            'game_code':_.code}
          );
      }
    }
    conn.release();
    result(res);
  });
}

eagleSuper.prototype.cancelAllBet = async function (data) {
  let _ = this;
  return new Promise(async function (result) {
    let conn = await sql.connectDB();
    let res = await sql.getData('game_inplay', {'where':[
      {'key':'game_code','operator':'is','value':_.code},
       {'key':'id','operator':'is','value':data.id}
    ]});
    if(res.SUCCESS && res.MESSAGE.id){
      let oldBet = await sql.getData(_.code, {'where':[
        {'key':'game_id','operator':'is','value':res.MESSAGE.id}
      ]});
      if(oldBet.SUCCESS && oldBet.MESSAGE.length>0){
        await sql.startTransaction();
        let count = 0;
        for(const item of oldBet.MESSAGE){
          let user = await sql.getData('user', {where:[
            {key:"id",operator:"is", value:item.user_id}
          ]});
          let bal = user.MESSAGE.balance + item.amt - item.price;
          t = await sql.setDelete(_.code,{id:item.id});
          
          t = await sql.customSQL("UPDATE user SET balance = '"+bal+"' WHERE id ="+item.user_id);
          let insertSql = "INSERT INTO transaction_log SET id='BC-"+Date.now()+""+(count++)+"."+item.user_id+"', user_id="+item.user_id+",amt='"+(item.amt - item.price)+"', ref_no='"+item.id+"',description='"+_.code+" win return - bal: "+bal+"' ";
          t = await sql.customSQL(insertSql);
        }
        await sql.commitTransaction();
      }
    }
    conn.release();
    result({SUCCESS:true,MESSAGE:'Success'});
  });
}

eagleSuper.prototype.generateResult = async function (data) {
  let _ = this;
  
  return new Promise(async function (result) {
    let conn = await sql.connectDB();
    
    let res = await sql.getData('game_inplay', {'where':[
      {'key':'game_code','operator':'is','value':_.code},
       {'key':'id','operator':'is','value':data.id}
    ]});
    if(res.SUCCESS && res.MESSAGE.id){
      let inPlay = res.MESSAGE;
      await sql.startTransaction();

      let oldWin = await sql.getData(_.code, {'where':[
        {'key':'game_id','operator':'is','value':inPlay.id},
        {'key':'price','operator':'higher','value':0}
      ]});
      if(oldWin.SUCCESS && oldWin.MESSAGE.length>0){
        let count = 0;
        for(const item of oldWin.MESSAGE){
          let t = await sql.setData(_.code,{
            'id':item.id,
            'price':0,
            'status':0});

          let user = await sql.getData('user', {where:[
            {key:"id",operator:"is", value:item.user_id}
          ]});
          let bal = user.MESSAGE.balance -item.price;
          t = await sql.customSQL("UPDATE user SET balance = '"+bal+"' WHERE id ="+item.user_id);
          let insertSql = "INSERT INTO transaction_log SET id='RW-"+Date.now()+""+(count++)+"."+item.user_id+"', user_id="+item.user_id+",amt='"+bal+"', ref_no='"+item.id+"',description='"+_.code+" win return - bal: "+bal+"' ";
          t = await sql.customSQL(insertSql);
        }
      }

      res = await sql.getData(_.code, {'where':[
        {'key':'game_id','operator':'is','value':inPlay.id},
        {'key':'number','operator':'is','value':data.num}
      ]});
      if(res.SUCCESS && res.MESSAGE.length>0){
        let count = 0;
        for(const item of res.MESSAGE){
          let tP = item.amt * _.price.patti;
          let t = await sql.setData(_.code,{
            'id':item.id,
            'price':tP,
            'status':1});
          
          let user = await sql.getData('user', {where:[
            {key:"id",operator:"is", value:item.user_id}
          ]});
          let bal = user.MESSAGE.balance +tP;
          t = await sql.customSQL("UPDATE user SET balance = '"+bal+"' WHERE id ="+item.user_id);
          let insertSql = "INSERT INTO transaction_log SET id='RW-"+Date.now()+""+(count++)+"."+item.user_id+"', user_id="+item.user_id+",amt='"+bal+"', ref_no='"+item.id+"',description='"+_.code+" win - bal: "+bal+"' ";
          t = await sql.customSQL(insertSql);
        }
      }

      res = await sql.getData(_.code, {'where':[
        {'key':'game_id','operator':'is','value':inPlay.id},
        {'key':'number','operator':'is','value':data.single}
      ]});
      if(res.SUCCESS && res.MESSAGE.length>0){
        let count = 0;
        for(const item of res.MESSAGE){
          let tP = item.amt * _.price.single;
          let t = await sql.setData(_.code,{
            'id':item.id,
            'price':tP,
            'status':1});
          
          let user = await sql.getData('user', {where:[
            {key:"id",operator:"is", value:item.user_id}
          ]});
          let bal = user.MESSAGE.balance +tP;
          t = await sql.customSQL("UPDATE user SET balance = '"+bal+"' WHERE id ="+item.user_id);
          let insertSql = "INSERT INTO transaction_log SET id='RW-"+Date.now()+""+(count++)+"."+item.user_id+"', user_id="+item.user_id+",amt='"+bal+"', ref_no='"+item.id+"',description='"+_.code+" win - bal: "+bal+"' ";
          t = await sql.customSQL(insertSql);
        }
      }

      await sql.setData('game_inplay',{'id':inPlay.id,'status':'2','result_one':data.num,'result_two':data.single});
      
      
      await sql.commitTransaction();
    }
    conn.release();
    result({SUCCESS:true,MESSAGE:'Success'});
  });
}

module.exports = eagleSuper; 