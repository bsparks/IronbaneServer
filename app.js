// app.js - alternate file to setup everything using node instead of php
var package = require('./package.json'),
    app = require('express')(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server),
    commander = require('commander');

var init = function() {
    // setup routes
    app.get('/', function (req, res) {
        res.sendfile(__dirname + '/client/index.html');
    });

    // setup sockets


    // start the server
    server.listen(commander.port);
};

commander
    .version(package.version)
    .option('-p, --port [portNumber]', 'Port to host server [9080]', 9080)
    .option('-v, --verbose', 'Verbose console logging.')
    .parse(process.argv);

// start everything up
init();