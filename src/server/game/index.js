// index.js - bootup the game

var GameEngine = require('./engine'),

    WorldHandler = require('../Engine/WorldHandler'),
    SocketHandler = require('../Engine/SocketHandler'),

    DataHandler = require('../Engine/DataHandler');
module.exports = function(db, io) {
	var dataHandler = new DataHandler(db);
	var worldHandler = new WorldHandler(db, dataHandler);
	var socketHandler = new SocketHandler(db, io);
	var game = new GameEngine({mysql:db},
		{   worldHandler : worldHandler, 
			dataHandler : dataHandler, 
			socketHandler: socketHandler
		});

// eventually this game engine class will contain most of the references that are currently global
	game.once('start', function() {
		console.log("AWAKE");
	 //worldHandler.Awake();
	 });
	game.start();

}
// provide reference to the main app
//module.exports = game;