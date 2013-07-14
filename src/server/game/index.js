// index.js - bootup the game

var GameEngine = require('./engine'),

    WorldHandler = require('../Engine/WorldHandler'),
    SocketHandler = require('../Engine/SocketHandler'),

    DataHandler = require('../Engine/DataHandler');
module.exports = function(db) {
var game = new GameEngine({mysql:db},
	{worldHandler : new WorldHandler(), dataHandler : new DataHandler(db), socketHandler: new SocketHandler()});

// eventually this game engine class will contain most of the references that are currently global

game.start();
}
// provide reference to the main app
//module.exports = game;