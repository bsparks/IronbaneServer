var Vector3 = require('../Engine/Vector3');

function SetData(obj, data, names) {
  for(var n in names) {
    obj[names[n]] = data[names[n]];
  }
}

function SetDataAll(obj, data) {
  for(var n in data) {
    obj[n] = data[n];
  }
}

function CheckData(obj, names) {
  if ( !ISDEF(obj) ) return false;
  if ( !obj ) return false;

  //for(var n in names) {
  for(var n=0;n<names.length;n++){
    if ( !ISDEF(obj[names[n]]) ) return false;
  }
  return true;
}



function CheckVector(obj) {
  return CheckData(obj, ["x","y","z"]);
}

// Generic cell functions
// Cells are supposed to be numbered next to eachother
function WorldToCellCoordinates(x, z, cellsize) {

  if ( cellsize % 2 != 0 ) console.error("Cellsize not dividable by 2!");

  var cellhalf = cellsize / 2;
  //  5 / 20 = 0
  // 20 / 20 = 1
  x = Math.floor((x + cellhalf)/cellsize);
  z = Math.floor((z + cellhalf)/cellsize);

  return {
    x: x,
    z: z
  };
}

module.exports.CellToWorldCoordinates = CellToWorldCoordinates;
function CellToWorldCoordinates(x, z, cellsize) {

  if ( cellsize % 2 != 0 ) console.error("Cellsize not dividable by 2!");

  var cellhalf = cellsize / 2;
  // 0 * 20 - 10 = -10;
  // 1 * 20 - 10 = 10;
  x = (x * cellsize);
  z = (z * cellsize);

  return {
    x: x,
    z: z
  };
}

function DistanceBetweenPoints(x1,y1,x2,y2){
  return Math.sqrt(Math.pow((x2-x1), 2) + Math.pow((y2-y1), 2));
}

function DistanceSq(pos1, pos2) {
  return Math.pow((pos2.x-pos1.x), 2) + Math.pow((pos2.y-pos1.y), 2) + Math.pow((pos2.z-pos1.z), 2);
}

String.prototype.trim = function() {
  return this.replace(/^\s+|\s+$/g, "");
};



function roundNumber(number, decimals) {
  var newnumber = new Number(number+'').toFixed(parseInt(decimals));
  return parseFloat(newnumber);
}

Number.prototype.Round2 = function() {
  return this % 2 == 0 ? this : this+1;
};
Number.prototype.Round = function(digits) {
  return roundNumber(this, digits);
};
Number.prototype.clamp = function(min, max) {
  return Math.min(Math.max(this, min), max);
};
Number.prototype.ToDegrees = function() {
  return this * (180 / Math.PI);
};
Number.prototype.ToRadians = function() {
  return this * (Math.PI / 180);
};
Number.prototype.Lerp = function(t, alpha) {
  return this + ( t - this ) * alpha;
};


// * (180/Math.PI)

function getRandomInt (min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Random float between
function getRandomFloat(minValue,maxValue,precision){
  if(typeof(precision) == 'undefined'){
    precision = 2;
  }
  return parseFloat(Math.min(minValue + (Math.random() * (maxValue - minValue)),maxValue).toFixed(precision));
}

function ChooseRandom(a) {
  return a[getRandomInt(0,a.length-1)];
}

var sequencedTimers = {};
function ChooseSequenced(a) {
  var uid = "";
  for (var b in a) uid += b;
  if ( !ISDEF(sequencedTimers[uid]) ) sequencedTimers[uid] = 0;
  var value = a[sequencedTimers[uid]];
  sequencedTimers[uid]++;
  if ( sequencedTimers[uid] >= a.length ) sequencedTimers[uid] = 0;
  return value;
}

function ConvertVector3(vec) {
  return new THREE.Vector3(vec.x, vec.y, vec.z);
}
function RawVector3(vec) {
  return {x:vec.x, y:vec.y, z:vec.z};
}


function ISDEF(o) {
  return typeof o != "undefined"
};


function isNumber(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

function CheckForFunctionReturnValue(v, data) {
  return typeof(v)=="function"?v(data):v;
}


Vector3.prototype.Round = function(n) {
  this.x = roundNumber(this.x, n);
  this.y = roundNumber(this.y, n);
  this.z = roundNumber(this.z, n);

  return this;
};

Vector3.prototype.ToRadians = function(n) {
  this.x = this.x.ToRadians();
  this.y = this.y.ToRadians();
  this.z = this.z.ToRadians();

  return this;
};

Vector3.prototype.ToDegrees = function(n) {
  this.x = this.x.ToDegrees();
  this.y = this.y.ToDegrees();
  this.z = this.z.ToDegrees();

  return this;
};

function RoundVector(vec, n) {
  vec.x = roundNumber(vec.x, n);
  vec.y = roundNumber(vec.y, n);
  vec.z = roundNumber(vec.z, n);
  return vec;
}

Number.prototype.ToBig = function() {
  return this * 100;
};
Vector3.prototype.ToBig = function(n) {
  this.x = this.x * 100;
  this.y = this.y * 100;
  this.z = this.z * 100;

  return this;
};

Vector3.prototype.Truncate = function(n) {
  if ( this.length() > n ) {
    return this.normalize().multiplyScalar(n);
  }
  return this;
};

Vector3.prototype.Perp = function() {
  return this.crossSelf(new Vector3(0, 1, 0));
};

function VectorDistance(a,b) {
  return a.clone().subSelf(b).length();
}
function VectorDistanceSq(a,b) {
  return a.clone().subSelf(b).lengthSq();
}
Vector3.prototype.isNear = function(vec, range) {
  return VectorDistanceSq(this, vec) <= range*range;
};

function WasLucky(maxchance) {
  return getRandomInt(1, maxchance) == 1;
}

function WasLucky100(chance) {
  return chance >= mt_rand(1, 100);
}

function mt_rand (min, max) {
  // Returns a random number from Mersenne Twister
  //
  // version: 1109.2015
  // discuss at: http://phpjs.org/functions/mt_rand
  // +   original by: Onno Marsman
  // *     example 1: mt_rand(1, 1);
  // *     returns 1: 1
  var argc = arguments.length;
  if (argc === 0) {
    min = 0;
    max = 2147483647;
  } else if (argc === 1) {
    throw new Error('Warning: mt_rand() expects exactly 2 parameters, 1 given');
  }
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

var dateChunks = new Array(

  new Array(60 * 60 * 24 * 365, 'year'),

  new Array(60 * 60 * 24 * 30, 'month'),

  new Array(60 * 60 * 24 * 7, 'week'),

  new Array(60 * 60 * 24, 'day'),

  new Array(60 * 60, 'hour'),

  new Array(60, 'minute'),

  new Array(1, 'second')

  );

function timeSince(since) {



  var count;



  for (i = 0, j = dateChunks.length; i < j; i++) {

    var seconds = dateChunks[i][0];

    var name = dateChunks[i][1];

    if ((count = Math.floor(since / seconds)) != 0) {

      break;

    }

  }



  var print = (count == 1) ? '1 ' + name : count + " " + name + "s";

  //    if ( name == "min" ) print = count + " " + name;
  //    if ( name == "" ) print = count;

  return print;

}

function firstOfObject(o) {
  for(var k in o) return o[k];
}
/*
function reverseArray(array) {

  var length = array.length;

  if ( length === 0 ) return array;

  var left = null;
  var right = null;
  for (left = 0; left < length / 2; left += 1)
  {
      right = length - 1 - left;
      var temporary = array[left];
      array[left] = array[right];
      array[right] = temporary;
  }
  return array;
}
*/
function capitaliseFirstLetter(string)
{
    return string.charAt(0).toUpperCase() + string.slice(1);
}

//Copyright 2009 Nicholas C. Zakas. All rights reserved.
//MIT Licensed
function timedChunk(items, process, context, callback){
    var todo = items.concat();   //create a clone of the original

    setTimeout(function(){

        var start = +new Date();

        do {
             process.call(context, todo.shift());
        } while (todo.length > 0 && (+new Date() - start < 15));

        if (todo.length > 0){
            setTimeout(arguments.callee, 25*10);
        } else {
            callback(items);
        }
    }, 25);
}

