/**
 * Represents a table in CIP. End-users should not need to instantiate this class.
 * @constructor
 * @param {CIPClient} cip - The parent CIP object.
 * @param {CIPCatalog} catalog - The catalog to which the table belongs.
 * @param {string} name - The name of the table.
 */
function CIPTable(cip, catalog, name) {
    this.cip = cip;
    this.catalog = catalog;
    this.name = name;
    
    this.layout = null;

    // TODO: Must have a reference to the layout it uses
    
    /**
     * Returns the layout of a given table in a given catalog.
     * @param {object} catalog - The catalog, as returned by NatMus#get_catalogs.
     * @param {object} table - The table, as returned by NatMus#get_tables.
     */
    this.get_layout = function() {
        assert(this.cip.is_connected());
        var returnvalue = null;

        this.cip.ciprequest("metadata/getlayout/"+this.cip.config.constants.layout_alias, {
            catalogname: this.catalog.name,
            table: this.name
        }, function(response) {
            returnvalue = new CIPLayout(this, response.fields);
        }); 
        
        this.layout = returnvalue;

        return returnvalue;
    };
    
    /**
     * Free-text search in the table.
     * @param {string} query - The query to search for.
     */
    this.search = function(query) {
        return cip.search(this, query);
    };

}