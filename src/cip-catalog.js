/**
 * Represents a catalog in CIP.
 * @constructor
 * @param {CIPClient} cip - The CIP client taking care of session handling etc.
 * @param {object} options - An object as returned by the CIP describing the catalog.
 */

var cip_table = require('./cip-table'),
    cip_common = require('./cip-common');

function CIPCatalog(cip, options) {

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
    this.getTables = function() {
        // We need to cache the catalog because the callback later binds this to the CIP client.
        var catalog = this;

        return cip.request([
          'metadata',
          'gettables',
          cip.config.constants.catch_all_alias
        ], {
          catalogname: this.name
        }, false).then(function(response) {
          var result = [];
          if(response && response.body && response.body.tables) {
            var tables = response.body.tables;
            for (var i = 0; i < tables.length; i++ ) {
              result.push(new cip_table.CIPTable(cip, catalog, tables[i]));
            }
            return result;
          } else {
            throw new Error('Malformed response.');
          }
        });
    };

    this.get_categories = function(id, levels, callback) {
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

exports.CIPCatalog = CIPCatalog;
