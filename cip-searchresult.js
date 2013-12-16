/**
 * A wrapper object for search results. Allows pagination, sorting, etc.
 * @constructor
 * @param {CIPClient} parent - An instance of a CIPClient to do the subsequent polling.
 * @param {object} collection - An object consisting of the number of rows and collection ID of the available search results.
 */
function CIPSearchResult(parent, collection) {
    this.cip = parent;
    this.total_rows = collection.totalcount;
    this.collection_id = collection.collection;
    this.pointer = 0 ;

    /**
     * Gets a specified number of search results, conveniently formatted as 
     * objects with key-value pairs (this structure differs from the API-returned
     * one).
     */
    this.get = function(num_rows) {
        var returnvalue = null;

        if (num_rows === undefined) {
            num_rows = 100;
        }
        
        this.cip.ciprequest("metadata/getfieldvalues/web", 
                            {
                                collection: this.collection_id,
                                startindex: this.pointer,
                                maxreturned: num_rows
                            }, 
                            function(response) {
                                returnvalue = response.items;
                                this.pointer += num_rows;
                            });
        
        // TODO: translate names of fields before returning
        
        return returnvalue;
    };
}