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
var Unit = require('../unit');

var HeartPiece = Unit.extend({
    init: function(data) {
        this._super(data);
    },
    tick: function(dTime) {
        this._super(dTime);

        var units = this.otherUnits;

        for (var u = 0; u < units.length; u++) {
            if (!(units[u].isPlayer())) {
                continue;
            }
            if (units[u].inRangeOfUnit(this, 1)) {
                break;
            }
        }
    }
});

exports.HeartPiece = HeartPiece;