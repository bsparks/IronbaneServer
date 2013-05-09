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

    exports.GUEST_SPAWN_ZONE = 1;
    exports.GUEST_SPAWN_POS = [10, 0, 0]; // array vector to convert to THREE
    exports.PLAYER_SPAWN_TIMEOUT = 5.0;
    exports.NPC_SPAWN_TIMEOUT = 10.0;

    exports.CELL_SIZE = 112; // 96+16
    exports.CELL_SIZE_HALF = exports.CELL_SIZE * 0.5;
    exports.CELL_LOAD_RANGE = 2;
    exports.WORLD_SCALE = 2;

})(this);