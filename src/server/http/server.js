// server.js - main HTTP server

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
var config = require('../../../nconf'),
    path = require('path'),
    Class = require('../../common/class'),
    log = require('util').log; // built in timestampped logger

var Server = Class.extend({
    init: function(config) {
        config = config || {};

        // this will allow us to choose whether or not the http server is used,
        // say from cmdline or config
        if(config.autoStart !== false) {
            // auto startup
            this.start();
        }
    },
    start: function() {
        log('starting http server...');

        var db = require('mysql').createConnection({
            host: config.get('mysql_host'),
            user: config.get('mysql_user'),
            password: config.get('mysql_password'),
            database: config.get('mysql_database')
            //insecureAuth:false
        });

        // create http api server
        var express = require('express.io');
        var MySQLStore = require('connect-mysql')(express);
        var passport = require('passport');
        var LocalStrategy = require('passport-local').Strategy;
        var User = require('../entity/user')(db);

        passport.serializeUser(function(user, done) {
            done(null, user.id);
        });

        passport.deserializeUser(function(id, done) {
            User.getById(id)
                .then(function(user) {
                    done(null, user);
                }, function(err) {
                    done(err, false);
                });
        });

        passport.use(new LocalStrategy(function(username, password, done) {
            User.authenticate(username, password)
                .then(function(user) {
                    done(null, user);
                }, function(err) {
                    done(err, false);
                });
        }));

        var isProduction = config.get('isProduction');
        var params = {
            log: 0,
            'close timeout': isProduction ? (60 * 3) : 86400,
            'heartbeat timeout': isProduction ? (60 * 3) : 86400,
            'heartbeat interval': isProduction ? (20 * 3) : 86400,
            'polling duration': isProduction ? (25 * 3) : 86400
        };

        var app = express().http().io(params); // purposefully global
        app.passport = passport; // convienience

        app.configure(function() {
            app.use(express.favicon(config.get('clientDir') + "favicon.ico"));
            app.use(express.cookieParser());
            app.use(express.bodyParser());
            app.use(express.methodOverride());
            app.use(express.session({
                secret: config.get('session_secret'),
                cookie: { maxAge: 3600000 }, // one hour
                store: new MySQLStore({client: db}) // store sessions in db for "remember me"
            }));
            app.set('view engine', 'html');
            app.set('views', config.get('clientDir'));
            app.engine('html', require('hogan-express'));
            // Initialize Passport!  Also use passport.session() middleware, to support
            // persistent login sessions (recommended).
            app.use(passport.initialize());
            app.use(passport.session());

            // Simple route middleware to ensure user is authenticated.
            //   Use this route middleware on any resource that needs to be protected.  If
            //   the request is authenticated (typically via a persistent login session),
            //   the request will proceed.  Otherwise, the user will be redirected to the
            //   login page.
            app.ensureAuthenticated = function(req, res, next) {
                if (req.isAuthenticated()) {
                    return next();
                }

                res.send(403, 'please log in first');
            };

            // ALL roles must be present to access
            app.authorize = function(roles) {
                // array or single...
                if (typeof roles === 'string') {
                    roles = [roles];
                }

                var middle = function(req, res, next) {
                    if (!req.user.roles || req.user.roles.length === 0) {
                        next(403, 'unauthorized');
                        return;
                    }

                    for (var i = 0; i < roles.length; i++) {
                        if (req.user.roles.indexOf(roles[i]) < 0) {
                            next(403, 'unauthorized');
                            return;
                        }
                    }
                    next();
                };

                return middle;
            };

            // ANY role may access
            app.authorizeAny = function(roles) {
                var middle = function(req, res, next) {
                    if (!req.user.roles || req.user.roles.length === 0) {
                        next(403, 'unauthorized');
                        return;
                    }

                    for (var i = 0; i < roles.length; i++) {
                        if (req.user.roles.indexOf(roles[i]) >= 0) {
                            next();
                            return;
                        }
                    }
                    next(403, 'unauthorized');
                    return;
                };

                return middle;
            };
        });

        // load routes
        require('./routes')(app, db);

        this.server = app;

        // start api server
        app.listen(config.get('server_port'));

        log('express.io server running on ' + config.get('server_port'));
    }
});

exports.Server = Server;