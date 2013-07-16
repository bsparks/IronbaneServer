// engine.js
var events = require('events'),
    sys = require('sys'),
    log = console.log,
    _ = require('underscore'),
    Class = require('../../common/class'),


 fs = require('fs');

// enhance default class
sys.inherits(Class, events.EventEmitter);

// todo: move this method to common lib, also make finer grained
function timeSince(date) {

    var seconds = Math.floor((new Date() - date) / 1000);

    var interval = Math.floor(seconds / 31536000);

    if (interval >= 1) {
        return interval + " years";
    }
    interval = Math.floor(seconds / 2592000);
    if (interval >= 1) {
        return interval + " months";
    }
    interval = Math.floor(seconds / 86400);
    if (interval >= 1) {
        return interval + " days";
    }
    interval = Math.floor(seconds / 3600);
    if (interval >= 1) {
        return interval + " hours";
    }
    interval = Math.floor(seconds / 60);
    if (interval >= 1) {
        return interval + " minutes";
    }
    return Math.floor(seconds) + " seconds";
}

// make this private so that it can't be called directly
var loop = function(server) {
    if(!server.isRunning) {
        return;
    }

    var currTime = Date.now();
    var delta = Math.max(0.3, (currTime - server.lastTime) / 1000);
    server.tick(delta);
    server.lastTime = currTime;

    server._loopId = setTimeout(function() { loop(server); }, 100);
};

var GameEngine = Class.extend({
    autoBackup: true,
    autoBackupInterval: (3600 * 24 * 1000),
    init: function(settings, handlers) {
        _.extend(this, settings);
        this.addHandlers(handlers);
        var server = this;
        
        server.startTime = -1;
        server.lastTime = 0;
        // in case we need to clear these...
        server._loopId = null;
        server._backupId = null;

        if(server.autoBackup && server.autoBackupInterval > 0) {
            server._backupId = setTimeout(function() { server.doBackup(); }, server.autoBackupInterval);
        }

        server.emit('init');
    },
    addHandlers: function(settings) {
        _.extend(this, settings);
        var engine = this;
        _.each(_.keys(settings), function(key){
            console.log("adding " +key)
            engine[key].engine = engine;
        });
        
    },
    doBackup: function() {
        var server = this;
        // whatever backup procedure
        server.emit('backup');

        if(server.autoBackup && server.autoBackupInterval > 0) {
            server._backupId = setTimeout(function() { server.doBackup(); }, server.autoBackupInterval);
        }
    },
    clearPendingBackup: function() {
        if(this._backupId) {
            clearTimeout(this._backupId);
            this._backupId = null;
        }
    },
    getUpTime: function() {
        return timeSince(this.startTime);
    },
    start: function() {
        if(this.isRunning) {
            // already started!
            return;
        }

        console.log("starting the engine");
        this.isRunning = true;
        this.startTime = Date.now();
        //loop(this);
        this.emit('start');
    },
    stop: function() {
        if(!this.isRunning) {
            // already stopped!
            return;
        }

        if(this._loopId) {
            clearTimeout(this._loopId);
            this._loopId = null;
        }
        this.isRunning = false;
        this.emit('stop');
    },
    tick: function(elapsedTime) {
        this.emit('tick', elapsedTime);
    }
});

module.exports = GameEngine;