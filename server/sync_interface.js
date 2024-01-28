var bodyParser = require('body-parser');
const game = require('./game/game.js');
var DokuMe_SyncInterface = function(executor, express) {
    let _ = this;
    _.executor = executor;
    _.app = express;
    _.app.use(bodyParser.json());
}


DokuMe_SyncInterface.prototype.start = function(){
    let _ = this;
    
    _.app.get('/test',function (req, res) {
      const a = new game();
        let b =a.generateGame();
        res.json({SUCCESS:true, MESSAGE:b})
    });

    _.app.get('/game/generate/rocket', function (req, res) {
      const gObj = new game();
      gObj.generateGame(['mumbaiRocket','eagleSuper']);
      res.json({STATUS:true,MESSAGE:'done'});
  });
    _.app.get('/game/start/rocket', function (req, res) {
      const gObj = new game();
      gObj.startGame(['mumbaiRocket']);
      res.json({STATUS:true,MESSAGE:'done'});
  });
    _.app.get('/game/start/super', function (req, res) {
      const gObj = new game();
      gObj.startGame(['eagleSuper']);
      res.json({STATUS:true,MESSAGE:'done'});
  });

    _.app.post('/game', function (req, res) {
      let obj = req.body;
      const gObj = new game();

      gObj.executeTask(obj).then(function(result){
          if(result){
              res.json(result);
          }else{
              res.json(result);
          }
      }).catch(function(error){
          console.log(error);
          res.json(error);
      });
  });

    _.app.post('/task/submit', function (req, res) {
        let obj = req.body;
        _.executor.executeTask(obj.SOURCE, obj.TYPE, obj.TASK, obj.DATA).then(function(result){
            if(result){
                res.json(result);
            }else{
                res.json(result);
            }
        }).catch(function(error){
            console.log(error);
            res.json(error);
        });
    });
}


module.exports = DokuMe_SyncInterface;