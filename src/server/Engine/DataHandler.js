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
/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */


 var   Class = require('../../common/class');
 var q = require('q');
var DataHandler = Class.extend({
    init: function(db) {
        console.log("creating dataHandler");
        this.mysql = db;
        this.Load();
    },
    Load: function() {
        var dataHandler = this;
        var promise = q.defer();
        this.itemsLoaded = false;
        this.unitsLoaded = false;
        dataHandler.items = [];
        dataHandler.units = [];
        this.mysql.query('SELECT * FROM ib_item_templates',
            function (err, results, fields) {
                if (err) throw err;
                for(var u=0;u<results.length;u++) {
                    var itemdata = results[u];
                    dataHandler.items[itemdata.id] = itemdata;
                }
                dataHandler.itemsLoaded = true;
                console.log("loaded item_templates: " + dataHandler.items.length)
            });

        this.mysql.query('SELECT * FROM ib_unit_templates',
            function (err, results, fields) {
                if (err) throw err;
                for(var u=0;u<results.length;u++) {
                    var unitdata = results[u];
                    dataHandler.units[unitdata.id] = unitdata;
                }
                dataHandler.unitsLoaded = true;
        console.log("loaded unit_templates: "+ dataHandler.units.length);
            });
    }
});

module.exports = DataHandler;