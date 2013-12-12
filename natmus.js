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
 * An object containing results from CIP searches. Enumerable.
 * @constructor
 * @param {NatMus} nm - A NatMus object.
 */
function NatMusCollection(nm) {
    this.nm = nm;
    assert (this.nm !== undefined);
    
    // TODO: Functionality
}

/**
 * The Nationalmuseet object that can emit various other objects
 * related to data gathering from Nationalmuseet.
 * @constructor
 * @param {CIPClient} cip - A CIP.js client object
 */
function NatMus(cip) {
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
     * Returns true if the underlying CIP connection is established.
     */
    this.is_connected = function() {
        // If the CIP connection has a session ID, we're connected.
        return this.jsessionid !== null;
    };
    
    /**
     * Returns a list of catalogs on the CIP service. Caches the result.
     * @param {boolean} force : Ask the server for the list, regardless of the cache
     */
    this.get_catalogs = function(force) {
        assert(this.is_connected());

        if (force !== true && this.catalogs !== null) {
            return this.catalogs;
        }

        var returnvalue = null;
        this.ciprequest("metadata/getcatalogs", {}, function(response) {
            this.catalogs =  response.catalogs;
            returnvalue = this.catalogs;
        });
        return returnvalue;
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

    /**
     * Returns a list of tables in a given catalog.
     * @param {object} catalog : The catalog, as returned by NatMus#get_catalogs.
     */
    this.get_tables = function(catalog) {
        assert(this.is_connected());
        var returnvalue = null;
        
        this.ciprequest("metadata/gettables/any", {catalogname: catalog.name}, function(response) {
            returnvalue = response.tables;
        });
        
        return returnvalue;
    };
    
    /**
     * Returns the layout of a given table in a given catalog.
     * @param {object} catalog: The catalog, as returned by NatMus#get_catalogs.
     * @param {object} table: The table, as returned by NatMus#get_tables.
     */
    this.get_layout = function(catalog, table) {
        assert(this.is_connected());
        var returnvalue = null;

        this.ciprequest("metadata/getlayout/web", {
            catalogname: catalog.name,
            table: table
        }, function(response) {
            // var list = _.pluck(response.fields, 'name');
            returnvalue = response.fields;
        }); 
        
        return returnvalue;
    };
    
    /**
     * Establishes a connection from the underlying CIP to its endpoint. Delegates to CIPClient#session_open.
     * @param {string} username : The username for the CIP service
     * @param {string} password : The password for the CIP service.
     * @param {function} success: The success callback.
     * @param {function} error: The failure callback.
     */
    // this.session_open = function(username, password, success, error) {
    //     cip.session_open(username, password, success, error);
    // };
    
    init();
}
