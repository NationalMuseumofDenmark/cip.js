/**
 * Represents a table in CIP. End-users should not need to instantiate this class.
 * @constructor
 * @param {CIPClient} cip - The parent CIP object.
 * @param {CIPCatalog} catalog - The catalog to which the table belongs.
 * @param {string} name - The name of the table.
 */

var cipCommon = require('./cip-common.js'),
    cip_layout = require('./cip-layout.js');

function CIPTable(cip, catalog, name) {
    this.catalog = catalog;
    this.name = name;

    this.layout = null;

    // TODO: Must have a reference to the layout it uses

    /**
     * Returns the layout of the table.
     * @param {function} callback The callback.
     */
    this.getLayout = function(callback) {
        return cip.request([
            'metadata',
            'getlayout',
            this.catalog.alias,
            this.cip.config.constants.layout_alias
        ], {
            table: this.name
        }).then(function(response) {
            return new cip_layout.CIPLayout(cip, this.layout.fields);
        });
    };

    /**
     * Free-text search in the table.
     * @param {string} query - The query to search for.
     */
    this.search = function(query) {
        return cip.search(this, query);
    };

    this.criteriaSearch = function(querystring, callback) {
        return cip.criteriaSearch(this, querystring, callback);
    };
}

exports.CIPTable = CIPTable;
