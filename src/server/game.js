// game.js - main game server / loop
var Class = require('../common/class'),
    mysql = require('mysql');

var GameServer = Class.extend({
    versionWarningTimer: 10.0,
    init: function(config) {
        this.startTime = (new Date()).getTime();
        this.lastBackupTime = this.startTime;
    },
    tick: function(dTime) {

    }
});

exports.GameServer = GameServer;