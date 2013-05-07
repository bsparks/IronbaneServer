/*
    This file is part of Ironbane MMO.

    Ironbane MMO is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    Ironbane MMO is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with Ironbane MMO.  If not, see <http://www.gnu.org/licenses/>.
*/
// repl.js - server commands for the console
var Class = require('../common/class');

// level enum
var ACCESS_LEVEL = {
    GUEST: 0,
    PLAYER: 1,
    EDITOR: 2,
    ADMIN: 3
};

var ConsoleCommand = Class.extend({
    init: function(accessLevel, name, description, paramsyntax, paramdefaults, command) {
        this.requiredAccess = accessLevel;
        this.name = name;
        this.description = description;
        this.paramsyntax = paramsyntax;
        this.paramdefaults = paramdefaults;
        this.command = command;
    },
    exec: function(params) {
        this.command.apply(null, params);
    }
});

// request, eval, print, loop
var ServerCommands = Class.extend({
    commands: {},
    accessLevel: ACCESS_LEVEL.GUEST,
    init: function() {

    },
    addCommand: function(accessLevel, name, description, paramsyntax, paramdefaults, command) {
        this.commands[name] = new ConsoleCommand(accessLevel, name, description, paramsyntax, paramdefaults, command);
    },
    setAccess: function(level) {
        this.accessLevel = level;
    },
    resetAccess: function() {
        this.accessLevel = ACCESS_LEVEL.GUEST;
    },
    exec: function(data) {
        data = data.trim();
        var command = data.split(' ')[0];

        if (!(command in this.commands)) {
            console.log("That's not a real command...");
            return;
        }

        this.commands[command].exec(data.split(' ').slice(1));
    }
});

// static access to enum
ServerCommands.ACCESS_LEVEL = ACCESS_LEVEL;

exports.ConsoleCommand = ConsoleCommand;
exports.ServerCommands = ServerCommands;