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
var Class = require('../common/class'),
    Helper = require('../common/gameHelper'),
    THREE = require('three');

var Deceleration = {
    SLOW: 3,
    NORMAL: 2,
    FAST: 1
};

var SteeringBehaviour = Class.extend({
    init: function(unit) {
        this.unit = unit;
        this.targetUnit = null;
        this.steeringForce = new THREE.Vector3();

        // Wander
        this.wanderRadius = 5.2;
        this.wanderDistance = 2.0;
        this.wanderJitter = 180.0;
        this.wanderTarget = new THREE.Vector3();
    },
    calculate: function() {
        this.steeringForce.set(0, 0, 0);
    },
    seek: function(targetPos) {
        var desiredVelocity = targetPos.clone().subSelf(this.unit.position).normalize().multiplyScalar(this.unit.maxSpeed);
        return desiredVelocity.subSelf(this.unit.velocity);
    },
    flee: function(targetPos) {
        var desiredVelocity = this.unit.position.clone().subSelf(targetPos).normalize().multiplyScalar(this.unit.maxSpeed);
        return desiredVelocity.subSelf(this.unit.velocity);
    },
    arrive: function(targetPos, deceleration) {
        var toTarget = targetPos.clone().subSelf(this.unit.position);

        //calculate the distance to the target position
        var dist = toTarget.length();

        if (dist > 0) {
            var decelerationTweaker = 0.3;
            var speed = dist / (deceleration / decelerationTweaker);
            speed = Math.min(speed, this.unit.maxSpeed);
            var desiredVelocity = toTarget.multiplyScalar(speed / dist);

            return desiredVelocity.subSelf(this.unit.velocity);
        }

        return new THREE.Vector3();
    },
    pursuit: function(evader) {
        var toEvader = evader.position.clone().subSelf(this.unit.position);
        var relativeHeading = this.unit.heading.dot(evader.heading);
        if (toEvader.dot(this.unit.heading) > 0 && relativeHeading < -0.95) {
            return this.seek(evader.position);
        }

        var lookAheadTime = toEvader.length() / (this.unit.maxSpeed + evader.velocity.length());
        var seek = evader.position.clone().addSelf(evader.velocity.clone().multiplyScalar(lookAheadTime));

        return this.seek(seek);
    },
    evade: function(pursuer) {
        var toPursuer = pursuer.position.clone().subSelf(this.unit.position);
        var lookAheadTime = toPursuer.length() / (this.unit.maxSpeed + pursuer.velocity.length());

        return this.flee(pursuer.position.clone().addSelf(pursuer.velocity.clone().multiplyScalar(lookAheadTime)));
    },
    turnaroundTime: function(unit, targetPos) {
        var toTarget = targetPos.clone().subSelf(unit.position);
        var dot = unit.heading.dot(toTarget);
        var coefficient = 0.5;

        return (dot - 1.0) * -coefficient;
    },
    resetWander: function() {
        this.wanderTarget = new THREE.Vector3();
    },
    wander: function() {
        this.wanderTarget.addSelf(new THREE.Vector3(Helper.randomClamped() * this.wanderJitter,
            0, Helper.randomClamped() * this.wanderJitter));

        this.wanderTarget.normalize().multiplyScalar(this.wanderRadius);

        var offset = this.unit.heading.clone().multiplyScalar(this.wanderDistance);
        return offset.addSelf(this.wanderTarget);
    },
    interpose: function(unitA, unitB) {
        var midPoint = unitA.position.clone().addSelf(unitB.position).multiplyScalar(0.5);
        var timeToReachMidPoint = this.unit.position.clone().subSelf(midPoint).length() / this.unit.maxSpeed;
        var posA = unitA.position.clone().addSelf(unitA.velocity.clone.multiplyScalar(timeToReachMidPoint));
        var posB = unitB.position.clone().addSelf(unitB.velocity.clone.multiplyScalar(timeToReachMidPoint));

        midPoint = posA.addSelf(posB).multiplyScalar(0.5);

        return this.arrive(midPoint, Deceleration.FAST);
    }
});

exports.SteeringBehaviour = SteeringBehaviour;
exports.Deceleration = Deceleration;