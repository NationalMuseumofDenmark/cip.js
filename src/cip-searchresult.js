/**
 * A wrapper object for search results. Allows pagination, sorting, etc.
 * @constructor
 * @param {CIPClient} cip - An instance of a CIPClient to do the subsequent polling.
 * @param {object} collection - An object consisting of the number of rows and collection ID of the available search results.
 * @param {CIPCatalog} catalog - The catalog
 */

var cip_asset = require('./cip-asset.js');

function CIPSearchResult(cip, collection, catalog) {
    if(!cip || !collection || !catalog) {
      throw new Error('Both CIP, collection and catalog must have values when creating a result.');
    }
    this.total_rows = collection.totalcount;
    this.collection_id = collection.collection;
    this.catalog = catalog;

    if(typeof(this.total_rows) !== 'number') {
        throw new Error('A CIPSearchResult.total_rows must be a number.');
    }
    if(typeof(this.collection_id) !== 'string') {
        throw new Error('A CIPSearchResult.collection_id must be a string.');
    }

    /**
     * Gets a specified number of search results, conveniently formatted as
     * objects with key-value pairs (this structure differs from the API-returned
     * one). NB: This function is synchronous because of its iterative nature.
     */
    this.get = function(numRows, pointer) {
        if (numRows === undefined) {
            numRows = 100;
        }

        var layoutAlias = cip.config.constants.layout_alias;

        return cip.request(['metadata', 'getfieldvalues', layoutAlias], {
            collection: this.collection_id,
            startindex: pointer,
            maxreturned: numRows
        }).then(function(response) {
          if(response === null || !response.body.items) {
            throw new Error('The request for field values returned a null or empty result.');
          } else {
            var result = [];
            for (var i = 0; i < response.body.items.length; i++) {
                result.push(new cip_asset.CIPAsset(cip, response.body.items[i], catalog));
            }
            return result;
          }
        });
    };
}

exports.CIPSearchResult = CIPSearchResult;
