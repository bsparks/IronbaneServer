// index.js - bootup the game

var GameEngine = require('./engine');
module.exports = function(db) {
console.log(db);
var game = new GameEngine(db);

// eventually this game engine class will contain most of the references that are currently global

game.start();
}
// provide reference to the main app
//module.exports = game;