/**
 * Represents a catalog in CIP.
 * @constructor
 * @param {CIPClient} cip - The CIP client taking care of session handling etc.
 * @param {object} options - An object as returned by the CIP describing the catalog.
 */

if(typeof(require) != "undefined") {
    cip_table = require('./cip-table.js');
    cip_common = require('./cip-common.js');
}

function CIPCatalog(cip, options) {
    this.cip = cip;
    
    for (var key in options) {
        this[key] = options[key];
    }

    if(this.alias === undefined) {
        this.alias = cip.config.catalog_aliases[this.name];
    }
    
    /**
     * Returns a list of tables in the catalog.
     * @param {function} callback The callback function.
     */
    this.get_tables = function(callback) {
        cip_common.assert(this.cip.is_connected());
        var returnvalue = [];
        
        // We need to cache the catalog because the callback later binds this to the CIP client.
        var catalog = this;

        this.cip.ciprequest("metadata/gettables/"+cip.config.constants.catch_all_alias, 
                            {
                                catalogname: this.name
                            }, 
                            function(response, cip) {
                                if(response !== null) {
                                    for (var i = 0; i < response.tables.length; i++ ) {
                                        returnvalue.push(new cip_table.CIPTable(this, catalog, response.tables[i]));
                                    }

                                    callback(returnvalue);
                                } else {
                                    callback(null);
                                }
                            });
        
    };

    this.get_categories = function(id, levels, callback) {
        cip_common.assert(this.cip.is_connected());
        var returnvalue = [];
        
        // We need to cache the catalog because the callback later binds this to the CIP client.
        var catalog = this;

        this.cip.ciprequest("metadata/getcategories/" + this.alias + "/categories", 
                            {
                                categoryid: id,
                                levels: levels
                            }, 
                            function(response, cip) {
                                if(response == null) {
                                    callback(null);
                                } else {
                                    callback(response);
                                }
                            });
        
    };

}

if(typeof(exports) != "undefined") {
    exports.CIPCatalog = CIPCatalog;
} else {
    window.cip_catalog = {
        CIPCatalog: CIPCatalog
    };
}
