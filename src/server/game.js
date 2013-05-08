// game.js - main game server / loop
var Class = require('../common/class'),
    mysql = require('mysql'),
    Q = require('q');

var GameServer = Class.extend({
    versionWarningTimer: 10.0,
    itemTemplates: {},
    unitTemplates: {},
    init: function(config) {
        // keep reference for sql callbacks...
        var server = this;

        this.startTime = (new Date()).getTime();
        this.lastBackupTime = this.startTime;

        var connection = mysql.createConnection({
            host: config.mysql.host,
            user: config.mysql.user,
            password: config.mysql.password,
            database: config.mysql.database
        });

        connection.connect(function(err) {
            if(err) {
                console.error('Error connecting to MySql!', err);
                return;
            }

            Q.all([
                Q.nfcall(connection.query, 'SELECT id FROM ib_units ORDER BY id DESC'),
                Q.nfcall(connection.query, 'SELECT id FROM ib_items ORDER BY id DESC'),
                // next 2 queries were from dataHandler
                Q.nfcall(connection.query, 'SELECT * FROM ib_item_templates'),
                Q.nfcall(connection.query, 'SELECT * FROM ib_unit_templates')
            ]).then(function(npc, item, itemTemplates, unitTemplates) {
                server.npcIDCount = npc.length > 0 ? npc[0].id : 0;
                server.itemIDCount = item.length > 0 ? item[0].id : 0;

                for(var i=0;i<itemTemplates.length;i++) {
                    server.itemTemplates[itemTemplates[i].id] = itemTemplates[i];
                }

                for(var u=0;u<unitTemplates.length;u++) {
                    server.unitTemplates[unitTemplates[u].id] = unitTemplates[u];
                }

                // we're done shut down this connection
                connection.end();
            }, function(err) {
                // some error in query? better still end connection?
                connection.end();
            });
        });
    },
    getNextItemID: function() {
        return this.itemIDCount++;
    },
    getNextNpcID: function() {
        return -(this.npcIDCount++);
    },
    tick: function(dTime) {

    }
});

exports.GameServer = GameServer;