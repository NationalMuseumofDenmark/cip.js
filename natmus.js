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
 * @þaram {NatMus} nm - A NatMus object.
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
    this.cip = cip;
    this.catalogs = null;
    
    this.onready = function() {
        // TODO: This is called once the CIP is connected. Cache stuff here?
    };

    this.is_connected = function() {
        // If the CIP connection has a session ID, we're connected.
        return cip.jsessionid !== null;
    };
    
    this.get_catalogs = function(force) {
        assert(this.is_connected());

        if (force !== true && this.catalogs !== null) {
            return this.catalogs;
        }

        var returnvalue = null;
        nm.cip.ciprequest("metadata/getcatalogs", {}, function(response) {
            console.log(response.catalogs);
            this.catalogs =  response.catalogs;
            returnvalue = this.catalogs;
        });
        return returnvalue;
    };
    
    this.get_tables = function(catalog) {
        assert(this.is_connected());
        var returnvalue = null;
        
        nm.cip.ciprequest("metadata/gettables/any", {catalogname: catalog}, function(response) {
            //console.log(response);
            returnvalue = response.tables;
        });
        
        return returnvalue;
    };
    
    this.get_layout = function(catalog, table) {
        var returnvalue = null;

        nm.cip.ciprequest("metadata/getlayout/web", {
            catalogname: catalog,
            table: table
        }, function(response) {
            console.log(response.fields);
            var list = _.pluck(response.fields, 'name');

            console.log(list);
        }); 
        
        return returnvalue;
    };

    this.session_open = function(username, password, success) {
        cip.session_open(username, password, success);
    };
    

    // If the given CIP is already connected, run our onready
    if (this.is_connected()) {
        this.onready();
    }
}

