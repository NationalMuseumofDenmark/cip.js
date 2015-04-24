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
    if(!cip || !collection || !catalog) {
        throw new Error('Both CIP, collection and catalog must have values when creating a result.');
    }
    this.cip = cip;
    this.total_rows = collection.totalcount;
    this.collection_id = collection.collection;
    this.catalog = catalog;

    /**
     * Gets a specified number of search results, conveniently formatted as 
     * objects with key-value pairs (this structure differs from the API-returned
     * one). NB: This function is synchronous because of its iterative nature.
     */
    this.get = function(num_rows, pointer, callback, error_callback) {
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
                if(response == null || !response.items) {
					if(error_callback) {
	                    error_callback( new Error('The request for field values returned a null or empty result.') );
					} else {
						callback( null );
					}
                } else {
		            for (var i = 0; i<response.items.length; i++) {
		                returnvalue.push(new cip_asset.CIPAsset(this, response.items[i], catalog));
		            }
		            callback(returnvalue);
				}
            },
			error_callback
		);
    };
}

if(typeof(exports) != "undefined") {
    exports.CIPSearchResult = CIPSearchResult;
} else {
    window.cip_searchresult = {
        CIPSearchResult: CIPSearchResult
    };
}

