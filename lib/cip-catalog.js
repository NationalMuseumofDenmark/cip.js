/**
 * Represents a catalog in CIP.
 * @constructor
 * @param {CIPClient} cip - The CIP client taking care of session handling etc.
 * @param {object} options - An object as returned by the CIP describing the catalog.
 */
function CIPCatalog(cip, options) {
    this.cip = cip;
    
    for (var key in options) {
        this[key] = options[key];
    }

    this.alias = cip.config.catalog_aliases[this.name];
    
    /**
     * Returns a list of tables in the catalog.
     */
    this.get_tables = function() {
        assert(this.cip.is_connected());
        var returnvalue = [];
        
        // We need to cache the catalog because the callback later binds this to the CIP client.
        var catalog = this;

        this.cip.ciprequest("metadata/gettables/"+cip.config.constants.catch_all_alias, 
                            {
                                catalogname: this.name
                            }, 
                            function(response, cip) {
                                for (var i = 0; i < response.tables.length; i++ ) {
                                    returnvalue.push(new CIPTable(this, catalog, response.tables[i]));
                                }
                            });
        
        return returnvalue;
    };
}
