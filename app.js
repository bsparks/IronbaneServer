// app.js - alternate file to setup everything using node instead of php
var package = require('./package.json'),
    app = require('express')(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server),
    commander = require('commander'),
    repl = require('repl');

var init = function() {
    // setup routes
    app.get('/', function (req, res) {
        res.sendfile(__dirname + '/client/index.html');
    });

    // setup sockets


    // start the server
    server.listen(commander.port);
};

var startServer = function() {
    init();

    // Not game stuff, this is for the server executable
    process.stdin.setEncoding('utf8');

    // startup a full node repl for javascript awesomeness
    var serverREPL = repl.start({
        prompt: "ironbane> ",
        input: process.stdin,
        output: process.stdout
    });

    serverREPL.on('exit', function() {
        process.exit();
    });

    // repl commands start with a dot i.e. ironbane> .who
    serverREPL.defineCommand('log', function() {
        console.log('log test!', arguments, '\n');
    });

    serverREPL.context.version = package.version;
};

commander
    .version(package.version)
    .option('-p, --port [portNumber]', 'Port to host server [9080]', 9080)
    .option('-v, --verbose', 'Verbose console logging.')
    .parse(process.argv);

commander
    .command('initDB')
    .action(function() { console.log('initialize database...'); });

// default command
commander
    .command('*')
    .action(startServer);

// this is the app entry point
commander.parse(process.argv);