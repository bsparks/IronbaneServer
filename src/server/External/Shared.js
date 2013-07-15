/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

var shared = {
cellSize : 96+16,
cellLoadRange : 2,


unitAcceleration : 20,


 dayTime : 60 * 15,
//  dayTime : 90,


 worldScale : 2,

 lootBagTemplate : 2,
 movingObstacleTemplate : 4,
 toggleableObstacleTemplate : 5,
 leverTemplate : 6,
 teleportEntranceTemplate : 7,
 teleportExitTemplate : 8,
 signTemplate : 9,
 lootableMeshTemplate : 10,
 heartPieceTemplate : 11,
 musicPlayerTemplate : 71,

 UnitTypeEnum : {
  PLAYER: 0,
  NPC: 1,
  LOOTABLE: 2,
  BILLBOARD : 3,
  MULTIBOARD : 4,
  MESH : 5,
  MOVINGOBSTACLE: 6,
  TRAIN: 7,
  TOGGLEABLEOBSTACLE: 8,
  LEVER: 9,
  TELEPORTENTRANCE: 10,
  TELEPORTEXIT: 11,
  SIGN: 12,
  HEARTPIECE: 13,
  MUSICPLAYER: 14,

  // NPC's
  MONSTER:20,
  VENDOR:21,
  TURRET:22,
  WANDERER:23,
  TURRET_STRAIGHT:24,
  TURRET_KILLABLE:25
},
 ZoneTypeEnum : {
  WORLD: 1,
  DUNGEON : 2,
  MAINMENU : 3
},
getZoneTypeConfig : function(zonetype) {
  if (zonetype === ZoneTypeEnum.WORLD) 
  {
    return {
  'enableWater': true,
  'waterLevel': -1,
  'waterTexture': 1650,
  'waterTextureGlow': 1651,
  'enableClouds': true,
  'cloudDensity':0.80,
  'cloudLevel': 15,
  'skyboxShader': "world",
  "noTerrain": false,
  "music": ["ib2"] }
};
},/*
ZoneTypeEnum.DUNGEON = {
  'enableWater': true,
  'waterLevel': -1,
  'waterTexture': 1650,
  'waterTextureGlow': 1651,
  'enableClouds': false,
  'cloudDensity':0.0,
  'cloudLevel': 0,
  'skyboxShader': "dungeon",
  "noTerrain": false,
  "music": ["ib2"]
},

ZoneTypeEnum.MAINMENU = {
  'enableWater': false,
  'waterLevel': -1,
  'waterTexture': 1650,
  'waterTextureGlow': 1651,
  'enableClouds': false,
  'cloudDensity':0.0,
  'cloudLevel': 0,
  'skyboxShader': "dungeon",
  "noTerrain": true,
  "music": []
}
],*/


 LootBagTypeEnum : {
  COMMON: 0,
  UNCOMMON: 1,
  EPIC: 2,
  LEGENDARY: 3,

  CHEST: 11,
  BOOKSHELVES: 12
},

 SteeringBehaviourEnum : {
  SEEK: 0,
  ARRIVE: 1,
  PURSUIT: 2,
  INTERPOSE: 3
},

 SignTypeEnum : {
  DIRECTION: 1,
  NORMAL: 2,
  HUGE: 3
},


 WeaponRanges : {
  sword:2,
  dagger:5,
  axe:4,
  bow:15,
  staff:15
},

 ColorEnum : {
  WHITE: 0xFFFFFF,
  LIGHTBLUE: 0x92aafd,
  RED: 0xFF0000,
  GREEN: 0x00FF00,
  BLUE: 0x0000FF
},

 MovingObstacleMovementTypeEnum : {
  SineWaveX: 1,
  SineWaveY: 2,
  SineWaveZ: 3,
  SineWaveXY: 4,
  SineWaveXZ: 5,
  SineWaveYZ: 6,
  SineWaveXYZ: 7,
  SineWaveXYZ2: 8,
  RotationX: 21,
  RotationY: 22,
  RotationZ: 23,
  RotationXY: 24,
  RotationXZ: 25,
  RotationYZ: 26,
  RotationXYZ: 27,
  RotationXYZ2: 28
},

 ToggleableObstacleMovementTypeEnum : {
  DoorX : 1,
  DoorY : 2,
  DoorZ : 3
},

 UserManagementTypeEnum : {
  LIGHTWARN : 0,
  SERIOUSWARN : 1,
  KICK : 2,
  BAN : 3
},

 meleeTimeout : 0.5,
 meleeRange : 3.0,

 maxHealth : 20,

CalculateItemPrice : function(item) {
    // for now use basevalue directly, eventually will have modifiers on the shopkeep
    return item.basevalue || 0;
}

}
module.exports = shared;