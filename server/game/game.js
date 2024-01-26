
const gameLib = function () {
  
}

gameLib.prototype.executeTask = function (obj) {
  let _ = this;
  let msg = {SUCCESS:false,MESSAGE:'There is some issue.'};
  return new Promise(async function (result) {
    if(obj.TYPE == 'mumbaiRocket'){
      msg = await _.gameMumbaiRocket(obj.TASK,obj.DATA);
    }else if(obj.TYPE == 'eagleSuper'){
      msg = await _.gameEagleSuper(obj.TASK,obj.DATA);
    }
    result(msg);
  });
}

gameLib.prototype.startGame = function (type) {
  for(let i in type){
    if(type[i] == 'mumbaiRocket'){
      this.gameMumbaiRocket('start');
    }else if(type[i] == 'eagleSuper'){
      this.gameEagleSuper('start');
    }
  }
}

gameLib.prototype.generateGame = function (type) {
  for(let i in type){
    if(type[i] == 'mumbaiRocket'){
      this.gameMumbaiRocket('generate');
    }else if(type[i] == 'eagleSuper'){
      this.gameEagleSuper('generate');
    }
  }
}

gameLib.prototype.gameMumbaiRocket = function (task,data) {
  const cls = require('./mumbaiRocket.js');
  let game = new cls();
  let msg = {SUCCESS:false,MESSAGE:'There is some issue.'};
  return new Promise(async function (result) {
    switch(task){
      case 'start':
        msg = await game.startGame();
        break;
      case 'generate':
        msg = await game.generateGame(data);
        break;
      case 'result':
        msg = await game.generateResult(data);
        break;
    }
    result(msg);
  });
}
gameLib.prototype.gameEagleSuper = function (task,data) {
  const cls = require('./eagleSuper.js');
  let game = new cls();
  let msg = {SUCCESS:false,MESSAGE:'There is some issue.'};
  return new Promise(async function (result) {
    switch(task){
      case 'start':
        msg = await game.startGame();
        break;
      case 'generate':
        msg = await game.generateGame(data);
        break;
      case 'result':
        msg = await game.generateResult(data);
        break;
    }
    result(msg);
  });
}

module.exports = gameLib; 