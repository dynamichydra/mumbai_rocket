
const gameLib = function () {
  
}

gameLib.prototype.executeTask = function (obj) {
  console.log(obj);
  let _ = this;
  let msg = {SUCCESS:false,MESSAGE:'There is some issue.'};
  return new Promise(async function (result) {
    if(obj.TYPE == 'motka'){
      msg = await _.gameMotka(obj.TASK);
    }else if(obj.TYPE == 'mumbaiRocket'){
      msg = await _.gameMumbaiRocket(obj.TASK,obj.DATA);
    }
    result(msg);
  });
}

gameLib.prototype.startGame = function (type) {
  for(let i in type){
    if(type[i] == 'mumbaiRocket'){
      this.gameMumbaiRocket('start');
    }
  }
}

gameLib.prototype.generateGame = function (type) {
  for(let i in type){
    if(type[i] == 'mumbaiRocket'){
      this.gameMumbaiRocket('generate');
    }
    else if(type[i] == 'motka'){
      this.gameMotka('generate');
    }
  }
}

gameLib.prototype.gameMumbaiRocket = function (task,data) {
  const cls = require('./mumbaiRocket.js');
  let game = new cls();
  let msg = {SUCCESS:false,MESSAGE:'There is some issue.'};
  console.log(task)
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

gameLib.prototype.gameMotka = function (task) {
  const cls = require('./motka.js');
  let game = new cls();
  let msg = {SUCCESS:false,MESSAGE:'There is some issue.'};
  console.log(task)
  return new Promise(async function (result) {
    switch(task){
      case 'start':
        game.startGame();
        break;
      case 'generate':
        game.generateGame();
        break;
      case 'result':
        msg = await game.generateResult();
        break;
    }
    result(msg);
  });
}



module.exports = gameLib; 