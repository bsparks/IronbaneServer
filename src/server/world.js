// world.js - formerly worldHandler
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

// walk a directory tree, was in util previously (only used here...)
var walk = function(dir, done) {
    var results = [];
    fs.readdir(dir, function(err, list) {
        if (err) return done(err);
        var i = 0;
        (function next() {
            var file = list[i++];
            if (!file) return done(null, results);
            file = dir + '/' + file;
            fs.stat(file, function(err, stat) {
                if (stat && stat.isDirectory()) {
                    walk(file, function(err, res) {
                        results = results.concat(res);
                        next();
                    });
                } else {
                    results.push(file);
                    next();
                }
            });
        })();
    });
};

var Class = require('../common/class'),
    Helper = require('../common/gameHelper'),
    Perlin = require('../common/perlin'),
    log = require('util').log,
    mkdirp = require('mkdirp'), // previously was in fsi module
    fs = require('fs'),
    _ = require('underscore'),
    THREE = require('three');

var World = Class.extend({
    awake: false,
    world: {}, // structure: [zone][cx][cz]
    switches: {},
    hasLoadedWorld: false,
    init: function(worldDataPath) {
        this.worldDataPath = worldDataPath;

        // these formerly in shared.js in client... (best place here?)
        this.cellSize = 112;
        this.cellSizeHalf = this.cellSize * 0.5;
        this.cellLoadRange = 2;
        this.worldScale = 2;
    },
    wake: function() {
        this.buildZoneWaypoints();
        // ready all units...
        this.loopUnits(function(unit) { unit.wake(); });
        this.awake = true;
        log("World has awaken!");
    },
    buildZoneWaypoints: function() {
        // Load all waypoints!
        var count = 0,
            subcount = 0;

        for (var z in this.world) {
            // Every zone has their own set of nodes
            this.world[z].allNodes = {};

            for (var cx in this.world[z]) {
                for (var cz in this.world[z][cx]) {
                    if ((this.world[z][cx][cz] === undefined) ||
                        (this.world[z][cx][cz].graph === undefined) ||
                        (this.world[z][cx][cz].graph.nodes === undefined)) {
                        continue;
                    }

                    for (var x = 0; x < this.world[z][cx][cz].graph.nodes.length; x++) {
                        var node = this.world[z][cx][cz].graph.nodes[x];
                        this.world[z].allNodes[node.id] = node;
                        count++;
                        subcount++;
                    }

                }
            }

            log("Loaded " + subcount + " waypoints for zone " + z + "");
        }

        this.loopUnits(function(u) {
            if (u instanceof Actor) {
                u.buildWaypoints();
            }
        });

        log("Loaded " + count + " waypoints in total");
    },
    tick: function(dTime) {
        if ( !this.hasLoadedWorld ) return;

        if (!this.awake) {
            var hasLoadedUnits = true;
            // loop through all the cells?
            for (var z in this.world) {
                for (var cx in this.world[z]) {
                    for (var cz in this.world[z][cx]) {
                        if (!this.world[z][cx][cz].hasLoadedUnits) {
                            hasLoadedUnits = false;
                        }
                    }
                }
            }

            if (hasLoadedUnits) {
                this.wake();
            }
        }
    },
    // foreach unit (todo: flatten?)
    loopUnits: function(fn) {
        for(var z in worldHandler.world) {
            for(var cx in worldHandler.world[z]) {
                for(var cz in worldHandler.world[z][cx]) {
                    if (!_.isUndefined(worldHandler.world[z][cx][cz].units)) {
                        var units = worldHandler.world[z][cx][cz].units;
                        for(var u=0, len=units.length;u<len;u++) {
                            fn(units[u]);
                        }
                    }
                }
            }
        }
    },
    saveWorld: function() {
        for (var z in this.world) {
            for (var cx in this.world[z]) {
                for (var cz in this.world[z][cx]) {
                    this.saveCell(z, cx, cz);
                }
            }
        }
    },
    checkWorldStructure: function(zone, cx, cz, checkterrain, tx, tz) {
        if ((!_.isUndefined(zone) && _.isUndefined(worldHandler.world[zone])) ||
            (!_.isUndefined(cx) && _.isUndefined(worldHandler.world[zone][cx])) ||
            (!_.isUndefined(cz) && _.isUndefined(worldHandler.world[zone][cx][cz])) ||
            (!_.isUndefined(checkterrain) && _.isUndefined(worldHandler.world[zone][cx][cz].terrain)) ||
            (!_.isUndefined(tx) && _.isUndefined(worldHandler.world[zone][cx][cz].terrain[tx])) ||
            (!_.isUndefined(tz) && _.isUndefined(worldHandler.world[zone][cx][cz].terrain[tx][tz]))) {
            return false;
        }

        return true;
    },
    buildWorldStructure: function(zone, cx, cz, checkterrain, tx, tz) {
        if (!_.isUndefined(zone) && _.isUndefined(worldHandler.world[zone])) {
            worldHandler.world[zone] = {};
        }
        if (!_.isUndefined(cx) && _.isUndefined(worldHandler.world[zone][cx])) {
            worldHandler.world[zone][cx] = {};
        }
        if (!_.isUndefined(cz) && _.isUndefined(worldHandler.world[zone][cx][cz])) {
            worldHandler.world[zone][cx][cz] = {};
        }
        if (!_.isUndefined(checkterrain) && _.isUndefined(worldHandler.world[zone][cx][cz].terrain)) {
            worldHandler.world[zone][cx][cz].terrain = {};
        }
        if (!_.isUndefined(tx) && _.isUndefined(worldHandler.world[zone][cx][cz].terrain[tx])) {
            worldHandler.world[zone][cx][cz].terrain[tx] = {};
        }
        if (!_.isUndefined(tz) && _.isUndefined(worldHandler.world[zone][cx][cz].terrain[tx][tz])) {
            worldHandler.world[zone][cx][cz].terrain[tx][tz] = {};
        }
    },
    loadWorldLight: function() {
        var world = this,
            dataPath = this.worldDataPath;

        // reset the world map?
        this.world = {};

        walk(dataPath, function(err, results) {
            if (err) throw err;

            for (var r = 0; r < results.length; r++) {
                results[r] = results[r].replace(dataPath + "/", "");
                var data = results[r].split("/");

                //log(data);

                var zone = data[0];
                var cx = data[1];
                var cz = data[2];

                var file = data[3];

                if (!isNumber(zone)) continue;
                if (!isNumber(cx)) continue;
                if (!isNumber(cz)) continue;

                world.buildWorldStructure(zone, cx, cz);

                // Load navigation graph, even in a light world because we need it
                if (file === "graph.json") {
                    try {
                        var path = dataPath + "/" + zone + "/" + cx + "/" + cz;
                        var stats = fs.lstatSync(path + "/graph.json");

                        if (stats.isFile()) {
                            world.world[zone][cx][cz].graph = JSON.parse(fs.readFileSync(path + "/graph.json", 'utf8'));
                        }
                    } catch (e) {
                        throw e;
                    }
                }

                if (file !== "terrain.dat") { continue; }

                world.world[zone][cx][cz].terrain = {};
                world.world[zone][cx][cz].objects = [];
                world.world[zone][cx][cz].units = [];
                world.world[zone][cx][cz].hasLoadedUnits = false;

                log("Loaded cell (" + cx + "," + cz + ") in zone " + zone);

                world.loadUnits(zone, cx, cz);
            }

            world.hasLoadedWorld = true;
        });
    },
    // skipping loadSwitches for now...
    loadUnits: function(zone, cellX, cellZ) {
        var worldPos = Helper.cellToWorldCoordinates(cellX, cellZ, this.cellSize),
            worldHandler = this;

        (function(zone, cellX, cellZ) {
            // TODO: something with this DB call!
            mysql.query('SELECT * FROM ib_units WHERE zone = ? AND x > ? AND z > ? AND x < ? AND z < ?',
                [zone, (worldPos.x - worldHandler.cellSizeHalf), (worldPos.z - worldHandler.cellSizeHalf), (worldPos.x + worldHandler.cellSizeHalf), (worldPos.z + worldHandler.cellSizeHalf)],
                function(err, results, fields) {
                    if (err) throw err;

                    for (var u = 0; u < results.length; u++) {
                        var unitdata = results[u];
                        worldHandler.makeUnitFromData(unitdata);
                    }

                    worldHandler.world[zone][cellX][cellZ].hasLoadedUnits = true;
                });
        })(zone, cellX, cellZ);
    },
    makeUnitFromData: function(data) {
        // TODO: DATAHANDLER!
        data.id = -data.id;

        if (typeof data.data == "string") {
            data.data = JSON.parse(data.data);
        }

        if (_.isUndefined(dataHandler.units[data.template])) {
            log("Warning! Unit template " + data.template + " not found!");
            log("Cleaning up MySQL...");

            // TODO: again DB call!
            mysql.query('DELETE FROM ib_units WHERE template = ?', [data.template], function(err) {
                if (err) throw err;
            });

            return;
        }

        data.template = dataHandler.units[data.template];
        // Depending on the param, load different classes
        var unit = null;
        switch (data.template.type) {
            case UnitTypeEnum.NPC:
            case UnitTypeEnum.MONSTER:
            case UnitTypeEnum.VENDOR:
            case UnitTypeEnum.TURRET:
            case UnitTypeEnum.TURRET_STRAIGHT:
            case UnitTypeEnum.TURRET_KILLABLE:
            case UnitTypeEnum.WANDERER:
                unit = new NPC(data);
                break;
            case UnitTypeEnum.MOVINGOBSTACLE:
                // Convert data rotations to regular members
                data.rotx = data.data.rotX;
                data.roty = data.data.rotY;
                data.rotz = data.data.rotZ;

                unit = new MovingObstacle(data);
                break;
            case UnitTypeEnum.TOGGLEABLEOBSTACLE:
                // Convert data rotations to regular members
                data.rotx = data.data.rotX;
                data.roty = data.data.rotY;
                data.rotz = data.data.rotZ;

                unit = new ToggleableObstacle(data);
                break;
            case UnitTypeEnum.TRAIN:
                unit = new Train(data);
                break;
            case UnitTypeEnum.LEVER:
                unit = new Lever(data);
                break;
            case UnitTypeEnum.TELEPORTENTRANCE:
                unit = new TeleportEntrance(data);
                break;
            case UnitTypeEnum.TELEPORTEXIT:
                unit = new TeleportExit(data);
                break;
            case UnitTypeEnum.MUSICPLAYER:
                unit = new MusicPlayer(data);
                break;
            case UnitTypeEnum.SIGN:
                // Convert data rotations to regular members
                data.rotx = data.data.rotX;
                data.roty = data.data.rotY;
                data.rotz = data.data.rotZ;

                unit = new Sign(data);
                break;
            case UnitTypeEnum.LOOTABLE:
                // Convert data rotations to regular members
                data.rotx = data.data.rotX;
                data.roty = data.data.rotY;
                data.rotz = data.data.rotZ;

                unit = new Lootable(data, true);
                break;
            case UnitTypeEnum.HEARTPIECE:
                unit = new HeartPiece(data);
                break;
            default:
                unit = new Unit(data);
                break;
        }

        return unit;
    },
    loadCell: function(zone, cellX, cellZ) {
        // Query the entry
        var worldHandler = this,
            path = this.worldDataPath + "/" + zone + "/" + cellX + "/" + cellZ;

        mkdirp(path, function(err) {
            if(err) {
                log("[World.loadCell] Error creating path: ", path);
            }
        });

        if (fs.existsSync(path + "/terrain.dat")) {
            try {
                stats = fs.lstatSync(path + "/terrain.dat");

                if (stats.isFile()) {
                    var terrain = fs.readFileSync(path + "/terrain.dat", 'utf8');

                    var coordsToWorld = Helper.cellToWorldCoordinates(cellX, cellZ, this.cellSize);
                    var offset_x = coordsToWorld.x;
                    var offset_z = coordsToWorld.z;
                    var ar = terrain.split(";");

                    var count = 0;

                    this.world[zone][cellX][cellZ].terrain = {};
                    for (var x = offset_x - this.cellSizeHalf; x < offset_x + this.cellSizeHalf; x += this.worldScale) {
                        if (_.isUndefined(this.world[zone][cellX][cellZ].terrain[x])) {
                            this.world[zone][cellX][cellZ].terrain[x] = {};
                        }
                        for (var z = offset_z - this.cellSizeHalf; z < offset_z + this.cellSizeHalf; z += this.worldScale) {
                            var info = ar[count].split(",");
                            this.world[zone][cellX][cellZ].terrain[x][z] = {
                                t: info[0],
                                y: info[1]
                            };
                            count++;
                        }
                    }
                } else {
                    log("Terrain file not found! " + path);
                }
            } catch (e) {
                throw e;
            }

            // Load static gameobjects
            try {
                stats = fs.lstatSync(path + "/objects.json");

                if (stats.isFile()) {
                    this.world[zone][cellX][cellZ].objects = JSON.parse(fs.readFileSync(path + "/objects.json", 'utf8'));

                }
            } catch (e) {
                throw e;
            }

            // Load navigation graph
            try {
                stats = fs.lstatSync(path + "/graph.json");

                if (stats.isFile()) {
                    this.world[zone][cellX][cellZ].graph = JSON.parse(fs.readFileSync(path + "/graph.json", 'utf8'));

                }
            } catch (e) {
                throw e;
            }

        }

        // Outside of terrain, there are other objects that populate the world
        //
        // Textures that always face the camera
        // Textures that change depending on the angle (Unit-like)
        // Textures that always face the camera and that have multiple sprites to play
        // Textures that are animated (rotating, some vertices moving (grass))
        // Textures that are double-sided but don't face the camera
        // Textures that are single-sided (most simply)
        //
        // 3D objects
        //
        // Particle emitters
        //
        //
        //

        // Maintain a unit list for each cell, for both players and NPC's

        // Preload all NPC's, players come later
        // NPC's should always have static cell positions, players however can change
        // We should check once in a while for players if they changed cell coordinates

        this.world[zone][cellX][cellZ].units = [];

    },
    // <octaves>,<persistence> some discovered values:
    // 1,4, 1-5, 2-2, 4-1, 5-1 -> small hills
    // 2,5 mountains
    // 2,3 somewhat more hillish
    // 3,2 very rough, volcano
    // 3-3 Very mountaneous, hard to navigate
    // 3-4, 3-5, icepeaks :D
    // 4-3 super sharp peaks
    generateCell: function(zone, cellX, cellZ, octaves, persistence, scale, tile, heightOffset) {

        tile = tile || 11;
        heightOffset = heightOffset || 0;

        var coordsToWorld = Helper.cellToWorldCoordinates(cellX, cellZ, this.cellSize);

        var offset_x = coordsToWorld.x;
        var offset_z = coordsToWorld.z;

        // Generate a cell inside a zone and save it
        var perlin = new Perlin.ImprovedNoise();
        var quality = 1;
        var r = 1;

        scale = scale | 1.0;

        var halfSize = this.cellSizeHalf;

        var startTime = (new Date()).getTime();

        // [cell][x][z]
        var cell = {};

        var perlinOffset = 7199254740992;

        for (var x = offset_x - halfSize; x < offset_x + halfSize; x += this.worldScale) {
            cell[x + ''] = {};
            for (var z = offset_z - halfSize; z < offset_z + halfSize; z += this.worldScale) {
                var h = Helper.roundNumber(Perlin.Noise2D(((x) / (10 * scale)) + perlinOffset, ((z) / (10 * scale)) + perlinOffset, octaves, persistence), 2) * scale;
                h += heightOffset;
                this.buildWorldStructure(zone, cellX, cellZ, true, x, z);

                this.world[zone][cellX][cellZ].terrain[x][z] = {
                    t: tile,
                    y: h
                };
            }
        }

        this.world[zone][cellX][cellZ].units = [];
        this.world[zone][cellX][cellZ].objects = [];
        this.world[zone][cellX][cellZ].graph = {};

        var endTime = (new Date()).getTime() - startTime;
        log("Generated cell (" + cellX + "," + cellZ + ") in " + endTime / 1000 + " seconds");

        this.saveCell(zone, cellX, cellZ, true);
    },
    saveCell: function(zone, cellX, cellZ, clearObjects) {
        // TODO: change this to an event?
        chatHandler.AnnounceMods("Saving cell " + cellX + ", " + cellZ + " in zone " + zone + "...");

        // Instead of saving instantly, we load the cell, overwrite it with the terrain we have, and save it! And empty terrain!
        var buffer_terrain = JSON.parse(JSON.stringify(this.world[zone][cellX][cellZ].terrain));
        var buffer_objects = JSON.parse(JSON.stringify(this.world[zone][cellX][cellZ].objects));
        var buffer_graph = JSON.parse(JSON.stringify(this.world[zone][cellX][cellZ].graph));
        var buffer_units = this.world[zone][cellX][cellZ].units;

        this.loadCell(zone, cellX, cellZ);

        if (clearObjects) {
            this.world[zone][cellX][cellZ].objects = [];
            buffer_objects = [];
        }

        this.world[zone][cellX][cellZ].graph = buffer_graph;
        this.world[zone][cellX][cellZ].units = buffer_units;

        for (var xt in buffer_terrain) {
            for (var zt in buffer_terrain[xt]) {
                if (_.isUndefined(this.world[zone][cellX][cellZ].terrain[xt])) {
                    log("terrain xt undefined");
                }
                if (!_.isUndefined(buffer_terrain[xt][zt].t)) {
                    this.world[zone][cellX][cellZ].terrain[xt][zt].t = buffer_terrain[xt][zt].t;
                }
                if (!_.isUndefined(buffer_terrain[xt][zt].y)) {
                    this.world[zone][cellX][cellZ].terrain[xt][zt].y = buffer_terrain[xt][zt].y;
                }
            }
        }

        for (var o = 0; o < buffer_objects.length; o++) {
            this.world[zone][cellX][cellZ].objects.push(buffer_objects[o]);
        }

        if (!_.isUndefined(worldHandler.world[zone][cellX][cellZ].changeBuffer)) {
            for (var d = 0; d < worldHandler.world[zone][cellX][cellZ].changeBuffer.length; d++) {
                var obj = worldHandler.world[zone][cellX][cellZ].changeBuffer[d];
                var pos = new THREE.Vector3(obj.pos.x, obj.pos.y, obj.pos.z);
                Helper.roundVector(pos, 2);

                var found = false;

                for (var o = 0; o < worldHandler.world[zone][cellX][cellZ].objects.length; o++) {
                    var loopObj = worldHandler.world[zone][cellX][cellZ].objects[o];
                    if (pos.x == loopObj.x && pos.y == loopObj.y && pos.z == loopObj.z) {
                        if (_.isEmpty(obj.metadata)) {
                            delete worldHandler.world[zone][cellX][cellZ].objects[o].metadata;
                        } else {
                            if (_.isUndefined(worldHandler.world[zone][cellX][cellZ].objects[o].metadata)) {
                                worldHandler.world[zone][cellX][cellZ].objects[o].metadata = {};
                            }
                            _.extend(worldHandler.world[zone][cellX][cellZ].objects[o].metadata, obj.metadata);
                        }
                        found = true;
                        break;
                    }
                }

                if (!found) {
                    log("Could not find object in changeBuffer!");
                } else {
                    log("Found object in changeBuffer!");
                }
            }
        }

        // Delete the things from the terrain in the deleteBuffer
        if (!_.isUndefined(worldHandler.world[zone][cellX][cellZ].deleteBuffer)) {
            for (var d = 0; d < worldHandler.world[zone][cellX][cellZ].deleteBuffer.length; d++) {
                var data = worldHandler.world[zone][cellX][cellZ].deleteBuffer[d];
                data = new THREE.Vector3(data.x, data.y, data.z);
                Helper.roundVector(data, 2);

                var found = false;
                for (var o = 0; o < worldHandler.world[zone][cellX][cellZ].objects.length; o++) {
                    var obj = worldHandler.world[zone][cellX][cellZ].objects[o];

                    obj = new THREE.Vector3(obj.x, obj.y, obj.z);
                    Helper.roundVector(obj, 2);

                    if (data.x == obj.x && data.y == obj.y && data.z == obj.z) {
                        worldHandler.world[zone][cellX][cellZ].objects.splice(o--, 1);
                        worldHandler.world[zone][cellX][cellZ].deleteBuffer.splice(d--, 1);
                        found = true;
                        break;
                    }
                }

                if (!found) {
                    log("Could not find object in deleteBuffer!");
                } else {
                    log("Found object in deleteBuffer!");
                }
            }
        }

        // Query the entry
        var path = this.worldDataPath + "/" + zone + "/" + cellX + "/" + cellZ;
        mkdirp(path, function(err) {
            if (err) {
                log("Error:" + err);
            } else {
                log('Directory created');
            }
        });

        var coordsToWorld = Helper.cellToWorldCoordinates(cellX, cellZ, this.cellSize);
        var offset_x = coordsToWorld.x;
        var offset_z = coordsToWorld.z;
        var ar = [];
        for (var x = offset_x - this.cellSizeHalf; x < offset_x + this.cellSizeHalf; x += this.worldScale) {
            for (var z = offset_z - this.cellSizeHalf; z < offset_z + this.cellSizeHalf; z += this.worldScale) {
                var info = this.world[zone][cellX][cellZ].terrain[x][z];
                ar.push(info.t + "," + info.y);
            }
        }
        var str = ar.join(";");

        fs.writeFileSync(path + "/terrain.dat", str);

        str = JSON.stringify(this.world[zone][cellX][cellZ].objects);
        fs.writeFileSync(path + "/objects.json", str);

        // Clean up the nodes first
        // BS: commented out since astar.cleanup was...
        //astar.cleanUp(this.world[zone][cellX][cellZ].graph);

        // Rebuild the zone waypoints
        this.buildZoneWaypoints();

        str = JSON.stringify(this.world[zone][cellX][cellZ].graph);
        fs.writeFileSync(path + "/graph.json", str);

        log("Saved cell (" + cellX + "," + cellZ + ") in zone " + zone + "");

        // Clean up
        this.world[zone][cellX][cellZ].terrain = {};
        this.world[zone][cellX][cellZ].objects = [];
    },
    updateNearbyUnitsOtherUnitsLists: function(zone, cellX, cellZ) {
        for (var x = cellX - 1; x <= cellX + 1; x++) {
            for (var z = cellZ - 1; z <= cellZ + 1; z++) {
                if (this.checkWorldStructure(zone, x, z)) {
                    for (var u = 0; u < this.world[zone][x][z].units.length; u++) {
                        this.world[zone][x][z].units[u].updateOtherUnitsList();
                    }
                }
            }
        }
    },
    findUnit: function(id) {
        for (var z in this.world) {
            for (var cx in this.world[z]) {
                for (var cz in this.world[z][cx]) {
                    if (!_.isUndefined(this.world[z][cx][cz].units)) {
                        var units = this.world[z][cx][cz].units;
                        for (var u = 0; u < units.length; u++) {
                            if (units[u].id === id) {
                                return units[u];
                            }
                        }
                    }
                }
            }
        }
        return null;
    },
    // Only for players!!!!
    findPlayerByName: function(name) {
        for (var z in this.world) {
            for (var cx in this.world[z]) {
                for (var cz in this.world[z][cx]) {
                    if (!_.isUndefined(this.world[z][cx][cz].units)) {
                        var units = this.world[z][cx][cz].units;

                        for (var u in units) {
                            if (units[u].id < 0) {
                                continue;
                            }

                            if (units[u].name === name) {
                                return units[u];
                            }
                        }
                    }
                }
            }
        }
        return null;
    },
    findUnitNear: function(id, nearUnit) {
        var zone = nearUnit.zone;
        var cx = nearUnit.cellX;
        var cz = nearUnit.cellZ;

        for (var x = cx - 1; x <= cx + 1; x++) {
            for (var z = cz - 1; z <= cz + 1; z++) {
                if (!this.checkWorldStructure(zone, x, z)) {
                    continue;
                }

                if (!_.isUndefined(this.world[zone][x][z].units)) {

                    var units = this.world[zone][x][z].units;

                    for (var u = 0; u < units.length; u++) {
                        if (units[u].id == id) {
                            return units[u];
                        }
                    }
                }
            }
        }

        return null;
    },
    deleteUnit: function(id) {
        for (var z in this.world) {
            for (var cx in this.world[z]) {
                for (var cz in this.world[z][cx]) {
                    if (!_.isUndefined(this.world[z][cx][cz].units)) {
                        var units = this.world[z][cx][cz].units;

                        for (var u = 0; u < units.length; u++) {
                            if (units[u].id == id) {
                                this.world[z][cx][cz].units.splice(u, 1);
                                return true;
                            }
                        }
                    }
                }
            }
        }
        return false;
    },
    getUnitCell: function(id) {
        for (var z in this.world) {
            for (var cx in this.world[z]) {
                for (var cz in this.world[z][cx]) {
                    if (!_.isUndefined(this.world[z][cx][cz].units)) {
                        var units = this.world[z][cx][cz].units;

                        for (var u = 0; u < units.length; u++) {
                            if (units[u].id === id) {
                                return {
                                    zone: z,
                                    x: cx,
                                    z: cz
                                };
                            }
                        }
                    }
                }
            }
        }
        return null;
    },
    getWaypointID: function(zone) {
        if (this.world[zone] === undefined) {
            return -1;
        }
        if (this.world[zone].waypointIDCount === undefined || this.world[zone].waypointIDCount < 100) {
            this.world[zone].waypointIDCount = 0;
            for (var cx in this.world[zone]) {
                for (var cz in this.world[zone][cx]) {
                    if (this.world[zone][cx][cz].graph !== undefined) {
                        if (this.world[zone][cx][cz].graph.nodes !== undefined) {
                            for (var n = 0; n < this.world[zone][cx][cz].graph.nodes.length; n++) {
                                if (this.world[zone][cx][cz].graph.nodes[n].id > this.world[zone].waypointIDCount) {
                                    this.world[zone].waypointIDCount = this.world[zone][cx][cz].graph.nodes[n].id;
                                }
                            }
                        }
                    }
                }
            }
        }
        return ++this.world[zone].waypointIDCount;
    },
    autoSaveCell: function(zone, x, z) {
        var worldHandler = this;

        // Set a timer to auto save this cell
        // If we set the height again, reset the timer
        if (!_.isUndefined(this.world[zone][x][z].saveTimer)) {
            //log("clearTimer");
            clearTimeout(this.world[zone][x][z].saveTimer);
        }
        this.world[zone][x][z].saveTimer = setTimeout(
        (function(zone, cx, cz) {
            return function() {
                worldHandler.saveCell(zone, cx, cz);
            };
        })(zone, x, z), 5000);
    }
});

exports.World = World;