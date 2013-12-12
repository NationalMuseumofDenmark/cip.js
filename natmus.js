/**
 * NatMus.js - an interface to the collections of Nationalmuseet
 * Jens Christian Hillerup, BIT BLUEPRINT - jc@bitblueprint.com
 */

// Handy assertion function
window.assert = function(condition, message) {
    if (!condition) {
        throw message || "Assertion failed.";
    }
};

/**
 * The Nationalmuseet object that can emit various other objects
 * related to data gathering from Nationalmuseet.
 * @constructor
 * @param {CIPClient} cip - A CIP.js client object
 */
function NatMus(cip) {
    this.constants = {
        catch_all_alias: "any",
        layout_alias: "web"
    };

    this.catalogs = null;
    
    /**
     * Inner function that is called when the NatMus object is ready.
     */
    var _onready = function() {
        
    };
    
    /**
     * The "constructor" function.
     */
    var init = function() {
        // TODO: make these things work

        // if (this.is_connected()) {
        //     this._onready();
        // }
    };

    
    /**
     * Performs a search in the CIP.
     * @param {object} catalog : The catalog to search in, as returned by NatMus#get_catalogs.
     * @param {object} table : The table to search in, as returned by NatMus#get_tables.
     * @param {string} query : The query to search for.
     */
    this.search = function(catalog, table, query) {
        assert(this.is_connected());
        
        
    };
    
    init();
}
