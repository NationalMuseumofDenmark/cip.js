/**
 * NatMus.js - an interface to the collections of Nationalmuseet
 * Jens Christian Hillerup, BIT BLUEPRINT - jc@bitblueprint.com
 */

/**
 * TODO: it would be pretty cool if NatMus.prototype = CIP, since
 * NatMus cannot live without a CIP.js anyway.
 * 
 * TODO: Make an ORM around this. That would also remove some 
 * of the ugliness around doing searches because then we could 
 * just return an easily enumerable NatMusCollection object.
 */

// Handy assertion function
window.assert = function(condition, message) {
    if (!condition) {
        throw message || "Assertion failed.";
    }
};


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

var cip = new CIPClient("http://samlinger.natmus.dk/CIP/");
var nm = new NatMus(cip);

nm.session_open(BB_USERNAME, BB_PASSWORD, function() {
    var catalogs = nm.get_catalogs();
    var tables = nm.get_tables(catalogs[3].name);
    var layout = nm.get_layout(catalogs[3].name, tables[0]);
    
    // var catalog = catalog[0]
    // var table = catalog.get_tables(search query?)
    // for (record in table.get_records(query?)) { ... }

    console.log(["layout = ", layout]);

    // nm.cip.ciprequest("metadata/search/any/web", {
    //     table: "AssetRecords",
    //     quicksearchstring: "ID *",
    //     debug: 1
    // }, function(response) {
    //     console.log(response);
    // });
});
