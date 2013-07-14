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

var Class = require('../../common/class'),
config = require('../../../nconf'),
//walk = require('./Util').walk,
//walk = require('node-utils').walk,
wrench = require('wrench'),
shared = require('../External/Shared'),
_ = require('underscore'),
events = require('events'),
    sys = require('sys'),
CellToWorldCoordinates = require('../External/Util').CellToWorldCoordinates,
fs = require('fs');

sys.inherits(Class, events.EventEmitter);
var WorldHandler = Class.extend({
  init: function() {
    console.log("creating the worldHandler");

    this.dataPath = config.get('clientDir') + 'plugins/game/data';
    // World structure
    // [zone][cx][cz]
    this.world = {};

    this.allNodes = {};

    this.switches = {};

    this.LoadWorldLight();

    this.awake = false;
    this.hasLoadedWorld = false;
    this.once('start', function() {
      this.Awake();
    })  ;
    this.Awake();

  },
  Awake: function() {


    this.BuildZoneWaypoints();



    // All units ready! Awaken!
    this.LoopUnits(function(u){
      u.Awake();
    });

    console.log("World has awaken!");
    this.awake = true;

  //worldHandler.LoadSwitches();
  },
  BuildZoneWaypoints: function() {
    // Load all waypoints!
    console.log("building zone waypoints");

    var count = 0;
    for(var z in this.world) {

      var subcount = 0;

      // Every zone has their own set of nodes
    this.allNodes[z] = {};

      for(var cx in this.world[z]) {

        for(var cz in this.world[z][cx]) {
          if ( this.world[z][cx][cz] === undefined ) continue;
          if ( this.world[z][cx][cz].graph === undefined ) continue;
          if ( this.world[z][cx][cz].graph.nodes === undefined ) continue;

          //this.allNodes = worldHandler.world[this.zone][cx][cz]['graph']['nodes'].concat(this.allNodes);
      var len = this.world[z][cx][cz].graph.nodes.length;
          for(var x=0;x<len;x++){
            var node = this.world[z][cx][cz].graph.nodes[x];
      //console.log(node);
      //console.log(this.world[z].allNodes);
            //this.world[z].allNodes.node['id'] = node;
      this.allNodes[z][node.id] = node;
            count++;
            subcount++;
          }

        }
      }

      log("Loaded "+subcount+" waypoints for zone "+z+"");

    }

    this.LoopUnits(function(u){
      if ( u instanceof Actor ) {
        u.BuildWaypoints();
      }
    });

    console.log("Loaded "+count+" waypoints in total");

  },
  Tick: function(dTime) {

    if ( !this.hasLoadedWorld ) return;

    if ( !this.awake ) {
      var hasLoadedUnits = true;

      this.LoopCells(function(cell) {
        if ( !cell.hasLoadedUnits ) hasLoadedUnits = false;
      });

      if ( hasLoadedUnits ) this.Awake();
    }

  },
  SaveWorld: function() {
    this.LoopCellsWithIndex(function(z, cx, cz) {
      this.SaveCell(z, cx, cz);
    });
  },
  DoFullBackup: function() {
    chatHandler.AnnounceMods("Backing up server...", "blue");

    var deploySh = spawn('sh', [ 'serverbackup.sh' ], {
      //cwd: process.env.HOME + '/myProject',
      cwd: '/root',
      env:_.extend(process.env, {
        PATH: process.env.PATH + ':/usr/local/bin'
      })
    });

    deploySh.stderr.on('data', function (data) {
      chatHandler.AnnounceMods(data, "red");
      //console.log('stderr: ' + data);
    });

    // handle error so server doesn't crash...
    deploySh.on('error', function(err) {
        log('Error doing full backup!', err);
    });

    deploySh.on('exit', function (code) {
      chatHandler.AnnounceMods("Backup complete!", "blue");
      //console.log('child process exited with code ' + code);
    });
  },
  CheckWorldStructure: function(zone, cx, cz) {
    if ( ISDEF(zone) && !ISDEF(worldHandler.world[zone]) ) return false;
    if ( ISDEF(cx) && !ISDEF(worldHandler.world[zone][cx]) ) return false;
    if ( ISDEF(cz) && !ISDEF(worldHandler.world[zone][cx][cz]) ) return false;
    return true;
  },
  BuildWorldStructure: function(zone, cx, cz) {
    if ( !_.isUndefined(zone) && _.isUndefined(this.world[zone]) ) this.world[zone] = {};
    if ( !_.isUndefined(cx) && _.isUndefined(this.world[zone][cx]) ) this.world[zone][cx] = {};
    if ( !_.isUndefined(cz) && _.isUndefined(this.world[zone][cx][cz]) ) this.world[zone][cx][cz] = {};
  },
  LoadWorldLight: function() {
    var worldHandler = this;
    this.world = {};
    dataPath = this.dataPath
    console.log(dataPath);
    wrench.readdirRecursive(dataPath, function(err, results) {
      //console.log(results);
      if (err) throw err;
      if (results === null) return;
    var rl = results.length;
      for (var r=0;r<rl;r++) {
        results[r] = results[r].replace(dataPath+"\\", "");

        var data = results[r].split("\\");
       //log(data);

        var zone = parseInt(data[0], 10);
        var cx = parseInt(data[1], 10);
        var cz = parseInt(data[2], 10);

        var file = data[3];
        if ( !_.isNumber(zone) ) continue;
        if ( !_.isNumber(cx) ) continue;
        if ( !_.isNumber(cz) ) continue;

        console.log(data)
        worldHandler.BuildWorldStructure(zone, cx, cz);

        // Load navigation graph, even in a light world because we need it
        if ( file == "graph.json" ) {
          try {
            var path = dataPath+"/"+zone+"/"+cx+"/"+cz;
            var stats = fs.lstatSync(path+"/graph.json");

            if (stats.isFile()) {
              worldHandler.world[zone][cx][cz].graph = JSON.parse(fs.readFileSync(path+"/graph.json", 'utf8'));
            }
          }
          catch (e) {
            throw e;
          }
        }


        if ( file !== "objects.json" ) continue;

        worldHandler.world[zone][cx][cz].objects = [];
        worldHandler.world[zone][cx][cz].units = [];
        worldHandler.world[zone][cx][cz].hasLoadedUnits = false;

        console.log("Loaded cell ("+cx+","+cz+") in zone "+zone);

        worldHandler.LoadUnits(zone, cx, cz);
      }

      this.hasLoadedWorld = true;

    });



  },
  LoopUnits: function(fn) {
    this.LoopCells(function(cell) {
      if ( !_.isUndefined(cell.units) ) {
        _.each(cell.units, function(unit) {
          fn(unit);
        });
      }
    });
  },
  LoopUnitsNear: function(zone, cellX, cellZ, fn) {
    this.LoopCellsNear(zone, cellX, cellZ, function(cell) {
      if ( !_.isUndefined(cell.units) ) {
        _.each(cell.units, function(unit) {
          fn(unit);
        });
      }
    });
  },
  LoopCells: function(fn) {
    _.each(this.world, function(zone) {
      _.each(zone, function(cellX) {
        _.each(cellX, function(cellZ) {
          fn(cellZ);
        });
      });
    });
  },
  LoopCellsNear: function(zone, cellX, cellZ, fn) {
    for(var x=cellX-1;x<=cellX+1;x++){
        for(var z=cellZ-1;z<=cellZ+1;z++){
            if ( worldHandler.CheckWorldStructure(zone, x, z) ) {
                fn(worldHandler.world[zone][x][z]);
            }
        }
    }
  },
  LoopCellsWithIndex: function(fn) {
    for(var zone in this.world) {
      if ( !this.world.hasOwnProperty(zone) ) continue;
      for(var cellX in this.world[zone]) {
        if ( !this.world[zone].hasOwnProperty(cellX) ) continue;
        for(var cellZ in this.world[zone][cellX]) {
          if ( !this.world[zone][cellX].hasOwnProperty(cellZ) ) continue;
          fn(zone, cellX, cellZ);
        }
      }
    }
  },
  LoadSwitches: function() {

    this.switches = {};

    mysql.query('SELECT * FROM ib_switches',
      function (err, results, fields) {

        if (err) throw err;

        for(var u=0;u<results.length;u++) {

          var switchdata = results[u];


          this.switches[switchdata.id] = new Switch(switchdata.id, switchdata.output1, switchdata.output2, switchdata.output3, switchdata.output4);

        }

      });



  },
  LoadUnits: function(zone, cellX, cellZ) {


    var worldPos = CellToWorldCoordinates(cellX, cellZ, shared.cellSize);
    console.log(worldPos);

    var worldHandler = this;
    var cellSizeHalf = shared.cellSize/2;
      this.engine.mysql.query('SELECT * FROM ib_units WHERE zone = ? AND x > ? AND z > ? AND x < ? AND z < ?',
        [zone,(worldPos.x-cellSizeHalf),(worldPos.z-cellSizeHalf),(worldPos.x+cellSizeHalf),(worldPos.z+cellSizeHalf)],
        function (err, results, fields) {

          if (err) throw err;

          _.each(results, function(unitdata) {




            worldHandler.MakeUnitFromData(unitdata);


          });

          worldHandler.world[zone][cellX][cellZ].hasLoadedUnits = true;

        });




  },
  MakeUnitFromData: function(data) {
    data.id = -data.id;



    if ( typeof data.data === "string" ) {
      data.data = JSON.parse(data.data);
    }

    if ( _.isUndefined(this.engine.dataHandler.units[data.template]) ) {
      log("Warning! Unit template "+data.template+" not found!");
      log("Cleaning up MySQL...");

      mysql.query('DELETE FROM ib_units WHERE template = ?', [data.template], function (err) {
        if (err) throw err;
      });

      return null;
    }
    console.log( "making units");

    data.template = this.engine.dataHandler.units[data.template];
    // Depending on the param, load different classes


    var unit = null;

    switch(data.template.type) {
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
  LoadCell: function(zone, cellX, cellZ) {
    // Query the entry
    var path = this.dataPath+"/"+zone+"/"+cellX+"/"+cellZ;

    fsi.mkdirSync(path, 0777, true, function (err) {
      if (err) {
        log("Error:" +err);
      } else {
        log('Directory created');
      }
    });


    if ( fs.existsSync(path+"/objects.json") ) {
      // Load static gameobjects
      try {
        stats = fs.lstatSync(path+"/objects.json");

        if (stats.isFile()) {
          this.world[zone][cellX][cellZ].objects = JSON.parse(fs.readFileSync(path+"/objects.json", 'utf8'));

        }
      }
      catch (e) {
        throw e;
      }

      // Load navigation graph
      try {
        stats = fs.lstatSync(path+"/graph.json");

        if (stats.isFile()) {
          this.world[zone][cellX][cellZ].graph = JSON.parse(fs.readFileSync(path+"/graph.json", 'utf8'));

        }
      }
      catch (e) {
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
  GenerateCell: function(zone, cellX, cellZ) {

    worldHandler.BuildWorldStructure(zone, cellX, cellZ);


    this.world[zone][cellX][cellZ].units = [];
    this.world[zone][cellX][cellZ].objects = [];
    this.world[zone][cellX][cellZ].graph = {};

    log("Generated cell ("+cellX+","+cellZ+")");

    this.SaveCell(zone, cellX, cellZ, true);

  },
  SaveCell: function(zone, cellX, cellZ, clearObjects) {


    var doClearObjects = clearObjects || false;

    chatHandler.AnnounceMods("Saving cell "+cellX+", "+cellZ+" in zone "+zone+"...");

    // Instead of saving instantly, we load the cell, overwrite it with the terrain we have, and save it! And empty terrain!

    var buffer_objects = JSON.parse(JSON.stringify(this.world[zone][cellX][cellZ].objects));
    var buffer_graph = JSON.parse(JSON.stringify(this.world[zone][cellX][cellZ].graph));
    var buffer_units = this.world[zone][cellX][cellZ].units;

    this.LoadCell(zone, cellX, cellZ);

    if ( doClearObjects ) {
      this.world[zone][cellX][cellZ].objects = [];
      buffer_objects = [];
    }

    this.world[zone][cellX][cellZ].graph = buffer_graph;
    this.world[zone][cellX][cellZ].units = buffer_units;


    for(var o=0;o<buffer_objects.length;o++) {
      this.world[zone][cellX][cellZ].objects.push(buffer_objects[o]);
    }

    if ( ISDEF(worldHandler.world[zone][cellX][cellZ].changeBuffer) ) {

      for(var d=0;d<worldHandler.world[zone][cellX][cellZ].changeBuffer.length;d++) {

        var obj = worldHandler.world[zone][cellX][cellZ].changeBuffer[d];


        var pos = ConvertVector3(obj.pos);
        pos = pos.Round(2);


        var found = false;

        for(var o=0;o<worldHandler.world[zone][cellX][cellZ].objects.length;o++) {
          var loopObj = worldHandler.world[zone][cellX][cellZ].objects[o];

          if ( pos.x === loopObj.x && pos.y === loopObj.y && pos.z === loopObj.z ) {



            if ( _.isEmpty(obj.metadata) ) {
              delete worldHandler.world[zone][cellX][cellZ].objects[o].metadata;
            }
            else {

              if ( _.isUndefined(worldHandler.world[zone][cellX][cellZ].objects[o].metadata) ) {
                worldHandler.world[zone][cellX][cellZ].objects[o].metadata = {};
              }

              _.extend(worldHandler.world[zone][cellX][cellZ].objects[o].metadata, obj.metadata);
            }

            found = true;
            break;
          }
        }


        if ( !found ) {
          log("Could not find object in changeBuffer!");
        }
        else {
          log("Found object in changeBuffer!");
        }



      }
    }

    // Delete the things from the terrain in the deleteBuffer
    if ( ISDEF(worldHandler.world[zone][cellX][cellZ].deleteBuffer) ) {



      for(var d=0;d<worldHandler.world[zone][cellX][cellZ].deleteBuffer.length;d++) {

        var data = worldHandler.world[zone][cellX][cellZ].deleteBuffer[d];


        data = ConvertVector3(data);
        data = data.Round(2);



        var found = false;

        for(var o=0;o<worldHandler.world[zone][cellX][cellZ].objects.length;o++) {
          var obj = worldHandler.world[zone][cellX][cellZ].objects[o];


          obj = ConvertVector3(obj);
          obj = obj.Round(2);

          if ( data.x === obj.x && data.y === obj.y && data.z === obj.z ) {
            worldHandler.world[zone][cellX][cellZ].objects.splice(o--, 1);
            worldHandler.world[zone][cellX][cellZ].deleteBuffer.splice(d--, 1);
            found = true;
            break;
          }
        }


        if ( !found ) {
          log("Could not find object in deleteBuffer!");
        }
        else {
          log("Found object in deleteBuffer!");
        }



      }
    }

    // Query the entry
    var path = dataPath+"/"+zone+"/"+cellX+"/"+cellZ;

    fsi.mkdirSync(path, 0777, true, function (err) {
      if (err) {
        log("Error:" +err);
      } else {
        log('Directory created');
      }
    });


    var str = JSON.stringify(this.world[zone][cellX][cellZ].objects);
    fs.writeFileSync(path+"/objects.json", str);

    // Clean up the nodes first
    astar.cleanUp(this.world[zone][cellX][cellZ].graph);

    // Rebuild the zone waypoints
    worldHandler.BuildZoneWaypoints();

    str = JSON.stringify(this.world[zone][cellX][cellZ].graph);
    fs.writeFileSync(path+"/graph.json", str);

    log("Saved cell ("+cellX+","+cellZ+") in zone "+zone+"");

    // Clean up
    this.world[zone][cellX][cellZ].objects = [];

  },
  UpdateNearbyUnitsOtherUnitsLists: function(zone, cellX, cellZ) {
    for(var x=cellX-1;x<=cellX+1;x++){
      for(var z=cellZ-1;z<=cellZ+1;z++){
        if ( worldHandler.CheckWorldStructure(zone, x, z) ) {
          for(var u=0;u<worldHandler.world[zone][x][z].units.length;u++) {
            worldHandler.world[zone][x][z].units[u].UpdateOtherUnitsList();
          }
        }
      }
    }
  },
  FindUnit: function(id) {

    var foundUnit = null;

    this.LoopUnits(function(unit) {
      if ( foundUnit ) return;
      if ( unit.id === id ) foundUnit = unit;
    });

    return foundUnit;
  },
  // Only for players!!!!
  FindPlayerByName: function(name) {

    for(var z in worldHandler.world) {
      for(var cx in worldHandler.world[z]) {
        for(var cz in worldHandler.world[z][cx]) {

          if ( ISDEF(worldHandler.world[z][cx][cz].units) ) {

            var units = worldHandler.world[z][cx][cz].units;

            for(var u in units) {

              if ( units[u].id < 0 ) continue;

              if ( units[u].name === name ) return units[u];
            }
          }
        }
      }
    }
    return null;
  },
  FindUnitNear: function(id, nearUnit) {

    var zone = nearUnit.zone;
    var cx = nearUnit.cellX;
    var cz = nearUnit.cellZ;


    for(var x=cx-1;x<=cx+1;x++){
      for(var z=cz-1;z<=cz+1;z++){
        if ( !worldHandler.CheckWorldStructure(zone, x, z) ) continue;

        if ( ISDEF(worldHandler.world[zone][x][z].units) ) {

          var units = worldHandler.world[zone][x][z].units;

          for(var u=0;u<units.length;u++) {
            if ( units[u].id === id ) return units[u];
          }
        }
      }
    }

    return null;
  },
  DeleteUnit: function(id) {

    for(var z in worldHandler.world) {
      for(var cx in worldHandler.world[z]) {
        for(var cz in worldHandler.world[z][cx]) {

          if ( ISDEF(worldHandler.world[z][cx][cz].units) ) {

            var units = worldHandler.world[z][cx][cz].units;

            for(var u=0;u<units.length;u++) {
              if ( units[u].id === id ) {
                worldHandler.world[z][cx][cz].units.splice(u, 1);
                return true;
              }
            }
          }
        }
      }
    }
    return false;
  },
  AutoSaveCell: function(zone, x, z) {
    // Set a timer to auto save this cell
    // If we set the height again, reset the timer
    if ( ISDEF(worldHandler.world[zone][x][z].saveTimer) ) {
      //log("clearTimer");
      clearTimeout(worldHandler.world[zone][x][z].saveTimer);
    }
    worldHandler.world[zone][x][z].saveTimer = setTimeout(
      (function(zone, cx, cz) {
        return function() {
          worldHandler.SaveCell(zone, cx, cz);
        };
      })(zone, x, z), 5000);
  },
  GetWaypointID: function(zone) {
    if ( worldHandler.world[zone] === undefined ) return -1;
    if ( worldHandler.world[zone].waypointIDCount === undefined || worldHandler.world[zone].waypointIDCount < 100) {
      worldHandler.world[zone].waypointIDCount = 0;
      for(var cx in worldHandler.world[zone]) {
        for(var cz in worldHandler.world[zone][cx]) {
          if ( worldHandler.world[zone][cx][cz].graph !== undefined ) {
            if ( worldHandler.world[zone][cx][cz].graph.nodes !== undefined ) {
              for(var n=0;n<worldHandler.world[zone][cx][cz].graph.nodes.length;n++) {
                if ( worldHandler.world[zone][cx][cz].graph.nodes[n].id > worldHandler.world[zone].waypointIDCount ) {
                  worldHandler.world[zone].waypointIDCount = worldHandler.world[zone][cx][cz].graph.nodes[n].id;
                }
              }
            }
          }
        }
      }
    }
    return ++worldHandler.world[zone].waypointIDCount;
  }

  
}
);

module.exports = WorldHandler;