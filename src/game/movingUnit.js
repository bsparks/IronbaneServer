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

var Unit = require('./unit'),
    SteeringBehaviour = require('./steeringBehavior'),
    Helper = require('../common/gameHelper'),
    Constants = require('../common/constants');

var MovingUnit = Unit.extend({
    targetPosition: new THREE.Vector3(),
    steeringForce: new THREE.Vector3(),
    init: function(data) {
        this._super(data);

        this.steeringBehaviour = new SteeringBehaviour(this);
    },
    tick: function(dTime) {
        var acceleration = this.steeringForce.multiplyScalar(this.mass);

        this.velocity.addSelf(acceleration.multiplyScalar(dTime));
        this.velocity.Truncate(this.maxSpeed);
        this.position.addSelf(this.velocity.clone().multiplyScalar(dTime));

        if ( this.velocity.length() > 0.2 ) {
            this.heading = this.velocity.clone().normalize();
            this.side = this.heading.clone().Perp();
        }

        var cellPos = Helper.worldToCellCoordinates(this.position.x, this.position.z, Constants.CELL_SIZE);
        if ( cellPos.x != this.cellX || cellPos.z != this.cellZ ) {
              this.changeCell(cellPos.x, cellPos.z);
        }

        this._super(dTime);
    }
});

exports.MovingUnit = MovingUnit;