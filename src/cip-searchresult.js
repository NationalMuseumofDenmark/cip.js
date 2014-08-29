/**
 * A wrapper object for search results. Allows pagination, sorting, etc.
 * @constructor
 * @param {CIPClient} cip - An instance of a CIPClient to do the subsequent polling.
 * @param {object} collection - An object consisting of the number of rows and collection ID of the available search results.
 * @param {CIPCatalog} catalog - The catalog 
 */

if(typeof(require) != "undefined") {
    cip_asset = require('./cip-asset.js');
}

function CIPSearchResult(cip, collection, catalog) {
    this.cip = cip;
    this.total_rows = collection.totalcount;
    this.collection_id = collection.collection;
    this.catalog = catalog;

    /**
     * Gets a specified number of search results, conveniently formatted as 
     * objects with key-value pairs (this structure differs from the API-returned
     * one). NB: This function is synchronous because of its iterative nature.
     */
    this.get = function(num_rows, pointer, success) {
        var returnvalue = [];

        // We need this hack because the success function is bound to the CIPClient
        var self = this; 

        if (num_rows === undefined) {
            num_rows = 100;
        }

        this.cip.ciprequest(
            "metadata/getfieldvalues/web", 
            {
                collection: this.collection_id,
                startindex: pointer,
                maxreturned: num_rows
            },
            function(response) {
                for (var i = 0; i<response.items.length; i++) {
                    returnvalue.push(new cip_asset.CIPAsset(this, response.items[i], catalog));
                }
                success(returnvalue);
            });

    };
}

if(typeof(exports) != "undefined") {
    exports.CIPSearchResult = CIPSearchResult;
} else {
    window.cip_searchresult = {
        CIPSearchResult: CIPSearchResult
    };
}