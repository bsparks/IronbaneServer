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

var Unit = require('../unit'),
    log = require('util').log;

var Lever = Unit.extend({
    init: function(data) {
        this._super(data);

        this.useTimeout = 0.0;
        this.on = false;
    },
    wake: function() {
        if (!this.data.switchNumber) {
            log("Bad switch number for " + this.id);
            this.targetUnit = null;
        } else {
            this.data.switchNumber = -Math.abs(this.data.switchNumber);
            // TODO: reference or something for worldHandler
            this.targetUnit = worldHandler.findUnit(this.data.switchNumber);
        }

        if (!(this.targetUnit instanceof ToggleableObstacle)) {
            this.targetUnit = null;
        }

        if (this.targetUnit) {
            this.targetUnit.updateLeverList();
            this.toggle(this.targetUnit.on);
        }

        this._super();
    },
    toggle: function(bool) {
        log("[Lever] " + this.id + " toggled " + (bool ? "on" : "off"));

        this.on = bool;

        this.emitNearby('toggle', {
            id: this.id,
            on: this.on
        });

        this.useTimeout = 2.0;
    },
    tick: function(dTime) {
        this._super(dTime);

        if (this.useTimeout > 0) {
            this.useTimeout -= dTime;
        } else {
            // TODO: reference or something for worldHandler OR will this.otherUnits work here?
            var units = worldHandler.world[this.zone][this.cellX][this.cellZ].units;

            for (var u = 0; u < units.length; u++) {
                if (!(units[u].isPlayer())) {
                    continue;
                }

                if (units[u].inRangeOfUnit(this, 1)) {
                    if (this.targetUnit) {
                        this.targetUnit.Toggle(!this.on);
                    }

                    break;
                }
            }
        }
    }
});

exports.Lever = Lever;