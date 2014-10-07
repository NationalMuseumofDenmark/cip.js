/**
 * Represents a table in CIP. End-users should not need to instantiate this class.
 * @constructor
 * @param {CIPClient} cip - The parent CIP object.
 * @param {CIPCatalog} catalog - The catalog to which the table belongs.
 * @param {string} name - The name of the table.
 */

if(typeof(require) != "undefined") {
    cip_common = require('./cip-common.js');
    cip_layout = require('./cip-layout.js');
}


function CIPTable(cip, catalog, name) {
    this.cip = cip;
    this.catalog = catalog;
    this.name = name;
    
    this.layout = null;

    // TODO: Must have a reference to the layout it uses
    
    /**
     * Returns the layout of the table.
     * @param {function} callback The callback.
     */
    this.get_layout = function(callback) {
        cip_common.assert(this.cip.is_connected());
        var returnvalue = null;
        var cip = this.cip;

        var path = [
            "metadata",
            "getlayout",
            this.catalog.alias,
            this.cip.config.constants.layout_alias
        ].join("/");

        this.cip.ciprequest(path, {
            table: this.name
        }, function(response) {
            this.layout = response;
            callback(new cip_layout.CIPLayout(cip, this.layout.fields));
        });
    };
    
    /**
     * Free-text search in the table.
     * @param {string} query - The query to search for.
     */
    this.search = function(query, callback) {
        this.cip.search(this, query, callback);
    };

    this.criteriasearch = function(querystring, callback) {
        this.cip.criteriasearch(this, querystring, callback);
    };
}

if(typeof(exports) != "undefined") {
    exports.CIPTable = CIPTable;
} else {
    window.cip_table = {
        CIPTable: CIPTable
    };
}
