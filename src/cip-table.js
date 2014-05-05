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
     * Returns the layout of the table.
     * @param {function} callback The callback.
     */
    this.get_layout = function(callback) {
        assert(this.cip.is_connected());
        var returnvalue = null;

        this.cip.ciprequest("metadata/getlayout/"+this.cip.config.constants.layout_alias, {
            catalogname: this.catalog.name,
            table: this.name
        }, function(response) {
            this.layout = returnvalue;

            callback(this.layout);
        }); 
        
    };
    
    /**
     * Free-text search in the table.
     * @param {string} query - The query to search for.
     */
    this.search = function(query, callback) {
        cip.search(this, query, callback);
    };

}

if(typeof(exports) != "undefined") {
    exports.CIPTable = CIPTable;
}
