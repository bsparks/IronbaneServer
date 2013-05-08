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

var MovingUnit = require('./movingUnit'),
    log = require('util').log;

var Actor = MovingUnit.extend({
    init: function(data) {
        this._super(data);

        this.stateMachine = new StateMachine(this, new EmptyState(), new EmptyState());
    },
    wake: function() {
        if (this.id < 0) {
            this.buildWaypoints();

            // Load the real state
            var currentState = null;
            switch (this.template.type) {
                case UnitTypeEnum.MONSTER:
                    currentState = new ExploreAndLookForEnemies();
                    break;
                case UnitTypeEnum.VENDOR:
                    currentState = new SellMerchandise();
                    break;
                case UnitTypeEnum.MOVINGOBSTACLE:
                    currentState = new MovingObstacle();
                    break;
                case UnitTypeEnum.TURRET:
                    currentState = new Turret();
                    break;
                case UnitTypeEnum.TURRET_STRAIGHT:
                    currentState = new TurretStraight();
                    break;
                case UnitTypeEnum.TURRET_KILLABLE:
                    currentState = new TurretKillable();
                    break;
                case UnitTypeEnum.WANDERER:
                    currentState = new Wander();
                    break;
                default:
                    currentState = new EmptyState();
                    break;
            }

            this.stateMachine.ChangeState(currentState);

            // Check if we have a global state defined
            if (!_.isUndefined(monsterStateMachines[this.template.name])) {
                this.stateMachine.SetGlobalState(monsterStateMachines[this.template.name]());
            }
        }

        this._super();
    },
    buildWaypoints: function() {
        // Calculate realistic routes where we can go to
        this.connectedNodeList = [];

        // First, find a "home" node from where we'll build our list
        var closestNode = null;
        var distance = Math.pow(50, 2);
        var allNodes = worldHandler.world[this.zone].allNodes;

        for (var x in allNodes) {
            var measuredDistance = Helper.distanceSq(allNodes[x].pos, this.position);
            if (measuredDistance < distance) {
                closestNode = allNodes[x];
                distance = measuredDistance;
            }
        }

        if (!closestNode) {
            log("Warning: no nodes found for NPC " + this.id + "!");
            return;
        }

        // We got the closest node
        // Now build a path with all nodes that link to it
        var me = this;

        function addEdgeNodes(list, zone, node) {
            for (var x = 0; x < node.edges.length; x++) {
                var subNode = worldHandler.world[zone].allNodes[node.edges[x]];

                if (!subNode) {
                    // ERROR!
                    // Not sure why, so send someone here and investigate
                    var msg = "Pathfinding node error! Please" + " investigate the connection<br>between node <b>" + node.id + "</b> and node <b>" + node.edges[x] + "</b>!<br>Location: " + ConvertVector3(node.pos).ToString() + " in zone " + me.zone;

                    chatHandler.AnnounceMods(msg, "red");

                    log("ERROR: " + msg);

                    setTimeout(function() {
                        chatHandler.AnnounceMods(msg + "<br><i>Warning: this error happened 15 seconds ago.</i>", "red");
                    }, 15000);

                    setTimeout(function() {
                        chatHandler.AnnounceMods(msg + "<br><i>Warning: this error happened 60 seconds ago.</i>", "red");
                    }, 60000);


                    // debugger;

                    return;

                }

                if (!_.contains(list, subNode)) {
                    list.push(subNode);
                    addEdgeNodes(list, zone, subNode);
                }
            }
        }

        addEdgeNodes(this.connectedNodeList, this.zone, closestNode);
    },
    tick: function(dTime) {
        this.stateMachine.tick(dTime);

        this._super(dTime);
    },
    handleMessage: function(message, data) {
        this.stateMachine.handleMessage(message, data);
    }
});

exports.Actor = Actor;