// gameHelper.js - misc helper/utility functions formerly found in util.js
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
(function(exports) {

    var cellToWorldCoordinates = function(x, z, cellsize) {
        if (cellsize % 2 !== 0) {
            throw "Cellsize not divisible by 2!";
        }

        var cellhalf = cellsize / 2;
        // 0 * 20 - 10 = -10;
        // 1 * 20 - 10 = 10;
        x = (x * cellsize);
        z = (z * cellsize);

        return {
            x: x,
            z: z
        };
    };

    // Cells are supposed to be numbered next to eachother
    function worldToCellCoordinates(x, z, cellsize) {
        if (cellsize % 2 !== 0) {
            throw "Cellsize not dividable by 2!";
        }

        var cellhalf = cellsize / 2;
        //  5 / 20 = 0
        // 20 / 20 = 1
        x = Math.floor((x + cellhalf) / cellsize);
        z = Math.floor((z + cellhalf) / cellsize);

        return {
            x: x,
            z: z
        };
    }

    var roundNumber = function(number, digits) {
        var multiple = Math.pow(10, digits);
        var rndedNum = Math.round(number * multiple) / multiple;
        return rndedNum;
    };

    var roundVector = function(vec, digits) {
        vec.x = roundNumber(vec.x, digits);
        vec.y = roundNumber(vec.y, digits);
        vec.z = roundNumber(vec.z, digits);
    };

    function randomClamped() {
        return (Math.random() * 2) - 1;
    }

    function distanceSq(pos1, pos2) {
        return Math.pow((pos2.x - pos1.x), 2) + Math.pow((pos2.y - pos1.y), 2) + Math.pow((pos2.z - pos1.z), 2);
    }

    exports.GameHelper = {
        cellToWorldCoordinates: cellToWorldCoordinates,
        worldToCellCoordinates: worldToCellCoordinates,
        roundNumber: roundNumber,
        roundVector: roundVector,
        randomClamped: randomClamped,
        distanceSq: distanceSq
    };

})(this);