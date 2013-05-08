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

    exports.GameHelper = {
        cellToWorldCoordinates: cellToWorldCoordinates
    };

})(this);