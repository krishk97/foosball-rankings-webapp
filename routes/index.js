const express = require('express');
const { check, validationResult }= require('express-validator');
const router = express.Router();
const MongoClient = require('mongodb').MongoClient; 
const assert = require('assert'); 

// mongodb setup 
// NOTE: currently database is not being closed! 
const url = 'mongodb://localhost:27017'; 
const dbName = 'foosball-data';  
const client = new MongoClient(url); 

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index',
  {title: "PBPL Foosball Rankings", 
  success_gamelog: req.session.success_gamelog, 
  success_submitnewplayer: req.session.success_submitnewplayer, 
  errors_gamelog: req.session.errors_gamelog, 
  errors_submitnewplayer: req.session.errors_submitnewplayer});
  
  // debugging mongodb entries
  /**
  client.connect(function(err){
    const db = client.db(dbName); 
    db.collection('player-log').find({name:"Krish"},{}).count()
    .then(function(numItems) { 
      console.log(numItems); 
    }); 
  }); 
   */

  // at end of request session, reset success and errors to null
  req.session.success_gamelog = null; 
  req.session.success_submitnewplayer = null; 
  req.session.errors_gamelog = null; 
  req.session.errors_submitnewplayer = null; 
});

/* POST log game */ 
router.post('/log-game', [
  // Check validity: winner 1 and 2 cannot match with either loser 1 or 2
  check('winner1').custom((winner1,{req}) => {
    if (winner1 === req.body.loser1 || winner1 === req.body.loser2){
      throw new Error('Winner 1 cannot be a loser')
    }
    else{ 
      return winner1
    }
    }), 
  check('winner2').custom((winner2,{req}) => {
    if (winner2 === req.body.loser1 || winner2 === req.body.loser2){
      throw new Error('Winner 2 cannot be a loser')
    } 
    else {
      return winner2
    }
    }) ], 

  function(req,res,next){
    // game log object 
    var gameLog = {
      date: Date.now(),
      winner1: req.body.winner1, 
      winner2: req.body.winner2, 
      loser1: req.body.loser1, 
      loser2: req.body.loser2, 
      score: req.body.score 
    }; 
  
    var errors_gamelog = validationResult(req); 
    // output errors if check failed 
    if (!errors_gamelog.isEmpty()) { 
      req.session.errors_gamelog = errors_gamelog; 
      req.session.success_gamelog = false; 
    }

    else {
      req.session.success_gamelog = true; 
      // input game log data into mongodb
      client.connect(function(err){
        assert.equal(null,err); 
        const db = client.db(dbName); 
        db.collection('game-log').insertOne(gameLog,function(err){
          assert.equal(null,err); 
          console.log('Following data inputted in db: '); 
          console.log("Date: " + gameLog['date']); 
          console.log("Winners: " + gameLog['winner1'] + " and " + gameLog['winner2']); 
          console.log("Loser: " + gameLog['loser1'] + " and " + gameLog['loser2']); 
          console.log("Score: " + gameLog['score']); 
        })
      })
    }
    res.redirect('/'); 
});

/* POST submit new player */ 
router.post('/submit-new-player', [
  // Check validity - NEED TO CHECK IF PLAYER ALREADY IN DB!
  check('name','Please input a player name').not().isEmpty(), 
  //],
  
  check('name').custom(value => {
    client.connect(function(err){
      assert.equal(null,err);
      const db = client.db(dbName); 
      return db.collection('player-log').find({name: value}).count()
        .then(numItems => {
          if (numItems!==0){ 
            return Promise.reject('Player name must be unique')     
          }
      return true
        })
      })
  }) ], 
  
  function(req,res,next){

    var errors_submitnewplayer = validationResult(req); 
    // output errors if check failed 
    if (!errors_submitnewplayer.isEmpty()) { 
      req.session.errors_submitnewplayer = errors_submitnewplayer; 
      req.session.success_submitnewplayer = false; 
    }
    else {
      req.session.success_submitnewplayer = true;
      // new player object
      var player = {
        name: req.body.name, 
        elo: 1000, 
        wins: 0, 
        losses: 0,
        ratingChange: 0}; 
      // input new player into db 
      client.connect(function(err){
        const db = client.db(dbName); 
        db.collection('player-log').insertOne(player,function(err){
          assert.equal(null,err);
          console.log(player['name'] + " has successfully been put into the database"); 
        //var ans = db.collection('player-log').find({name: 'Krish'}).count() 
        //ans.then(function(result){ 
        // console.log('got count', result); }); 
        }) 
      })    
    }

  res.redirect('/'); 
}); 

/* POST delete player */ 
router.post('/delete-player', function(req,res,next){
  console.log(req.body.button_deletePlayer); 
  res.redirect('/'); 
}); 

/* POST delete game */ 
router.post('/delete-game', function(req,res,next){
  console.log(req.body.button_deleteGame); 
  res.redirect('/'); 
}); 

module.exports = router;
