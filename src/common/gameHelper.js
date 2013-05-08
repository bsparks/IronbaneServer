// gameHelper.js - misc helper/utility functions formerly found in util.js
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

    var roundNumber = function(number, digits) {
        var multiple = Math.pow(10, digits);
        var rndedNum = Math.round(number * multiple) / multiple;
        return rndedNum;
    };

    exports.GameHelper = {
        cellToWorldCoordinates: cellToWorldCoordinates,
        roundNumber: roundNumber
    };

})(this);