/**
 * CIP.js - a CIP client in JavaScript
 * Jens Christian Hillerup, BIT BLUEPRINT - jc@bitblueprint.com
 *
 * This code includes the Qwest library in order to handle AJAX
 * requests in a nice way. Qwest is released under an MIT license.
 */

var request = require('request'),
    Promise = require('bluebird'),
    cipCatalog = require('./cip-catalog'),
    cipAsset = require('./cip-asset'),
    cipTable = require('./cip-table'),
    cipSearchresult = require('./cip-searchresult'),
    cipCommon = require('./cip-common');

/**
 * A general-purpose client library for CIP endpoints. Implements session
 * handling and requests.
 * @constructor
 * @param {string} config - A 'handle' object defining various settings about the CIP endpoint.
 */

function CIPClient(config) {
    this.config = config;
    this.jsessionid = null;
    this.DEBUG = true;

    cipCommon.assert(config !== undefined,
                     'The CIPClient must be passed a config object.');
    cipCommon.assert(config.endpoint !== undefined,
                     'The config must have an endpoint property.');

    this.cache = {
        catalogs: null
    };

    this.defaultNamedParameters = {
        apiversion: config.apiVersion || 4,
        serveraddress: config.serverAddress || 'localhost'
    };

    /**
     * Populates an object with named parameters with the default values.
     *
     * @param {object}|{false} named_parameters - The parameters for the
     *        query string, false if they should be leaved out.
     */
    this.namedParametersWithDefaults = function(givenNamedParameters) {
        var namedParameters = {};

        // We start with the default named parameters
        for (var p in this.defaultNamedParameters) {
            namedParameters[p] = this.defaultNamedParameters[p];
        }

        // Did we get any named parameters?
        if (typeof(givenNamedParameters) === 'undefined' ||
            givenNamedParameters === null) {
            givenNamedParameters = {};
        } else if (typeof(givenNamedParameters) !== 'object') {
            throw new Error('The namedParameters parameter must be an object, undefined or null.');
        }

        // Overwrite default named parameters.
        for (var g in givenNamedParameters) {
            var value = givenNamedParameters[g];
            if (value !== null && value !== undefined) {
                namedParameters[g] = value;
            }
        }
        return namedParameters;
    };

    /**
     * Generates a URL to the CIP server.
     *
     * @param {string} operation - The name of the function (the path).
     * @param {object}|{false} namedParameters - The parameters for the
     *        query string, false if they should be leaved out.
     * @param {boolean} withoutJSessionID - Should the jsessionid be left out of the URL? Default: false
     */
    this.generateURL = function(operation, namedParameters, withoutJSessionID) {
        var result = this.config.endpoint + operation;
        var queryString = '';

        // Should we include the jsessionid?
        if (withoutJSessionID !== true && this.jsessionid) {
            result += ';jsessionid=' + this.jsessionid;
        }

        // Populate with defaults.
        if (namedParameters !== false) {
            namedParameters = this.namedParametersWithDefaults(namedParameters);
        } else {
            namedParameters = {};
        }

        // Generate the query string from the named parameters.
        for (var p in namedParameters) {
            if (queryString.length > 0) {
                queryString += '&';
            }
            queryString += p + '=' + namedParameters[p];
        }

        // Prepend the question mark if a query exists.
        if (queryString.length > 0) {
            result += '?' + queryString;
        }

        return result;
    };

    /**
     * Makes a request to the CIP server.
     *
     * @param {string} operation - The name of the function (the path).
     * @param {object}|{boolean} namedParameters - Parameters to pass in the querystring.
     * @param {object}|{boolean} data - POST-data options to pass, if false - defaults are left out.
     */
    this.request = function(operation, namedParameters, data) {
        if (typeof(data) !== 'object') {
            data = null;
        }

        if (typeof(operation) === 'object') {
            operation = operation.join('/');
        }

        if (this.jsessionid === null && operation !== 'session/open') {
            console.warn('No jsessionid - consider calling session_open before calling other action.');
        }

        // We are using post calls, so the named parameters go to the body.
        namedParameters = this.namedParametersWithDefaults(namedParameters);

        var url = this.generateURL(operation, false);

        var rejectUnauthorized = this.config.trustSelfSigned ? false : true;

        return new Promise(function(resolve, reject) {
            var options = {
                url: url,
                method: 'POST',
                timeout: 60000, // 60 secs
                useQuerystring: true,
                json: true,
                rejectUnauthorized: rejectUnauthorized
            };
            if (namedParameters && !data) {
                options.form = namedParameters;
            } else if (data) {
                options.body = data;
            }
            request.post(options, function(err, response) {
                if (!err && response.statusCode >= 400) {
                    var msg = 'Error ' + response.statusCode + ' from CIP';
                    if (response.body && response.body.message) {
                        msg += ': ' + response.body.message;
                    }
                    err = new Error(msg);
                }
                if (err) {
                    reject(err);
                } else {
                    resolve(response);
                }
            });
        });
    };

    /**
     * Opens a session to the CIP endpoint with the given username
     * and password. This function, unlike most other functions in
     * this SDK is asynchronous. The philosophy is that all library
     * calls should be synchronous but called within asynchronous
     * *handlers* (like this one).
     *
     * @param {string} username - The username to log in with.
     * @param {string} password - The password to log in with.
     * @param {function} success - The callback function on success.
     * @param {function} error - The callback function on failure.
     */
    this.sessionOpen = function(username, password) {
        var client = this;
        return this.request([
            'session',
            'open'
        ], {
            user: username,
            password: password
        }).then(function(response) {
            if (response && response.body && response.body.jsessionid) {
                client.jsessionid = response.body.jsessionid;
                return response;
            } else {
                throw new Error('jsessionid is missing from the response!');
            }
        });
    };

    /**
     * Closes the currently open session.
     */
    this.sessionClose = function() {
        return this.request(['session', 'close']);
    };

    /**
     * Returns true if the CIP connection is established.
     */
    this.isConnected = function() {
        // If the CIP connection has a session ID, we're connected.
        return this.jsessionid !== null;
    };

    /**
     * Returns a list of catalogs on the CIP service. Caches the result.
     * @param {function} callback The callback
     * @param {function} error_callback - The callback function called an error occurs.
     */
    this.getCatalogs = function() {
        cipCommon.assert(this.isConnected(), 'Need a session to get catalogs');

        var client = this;

        if (client.cache.catalogs) {
            return Promise.resolve(client.cache.catalogs);
        }

        return this.request('metadata/getcatalogs', {}, false)
        .then(function(response) {
            client.cache.catalogs =  [];
            var catalogs = response.body.catalogs;
            var aliases = client.config.catalogAliases;
            for (var i=0; i<catalogs.length; i++) {
                var catobj = catalogs[i];
                if (catobj.name in aliases)  {
                    var catalog = new cipCatalog.CIPCatalog(client, catalogs[i]);
                    client.cache.catalogs.push(catalog);
                } else {
                    // throw new Error('The CIP returned an unknown catalog: ' + catobj.name);
                    continue; // Let's just ignore this
                }
            }
            return client.cache.catalogs;
        });
    };

    /**
     * Performs a metadata search in the CIP. Called from higher-level classes.
     * @param {object} table - The table to search in, as returned by NatMus#get_tables.
     * @param {string} query - The query to search for.
     * @param {function} callback - The callback function called when an answer is ready, this is passed an instance of CIPSearchResult.
     * @param {function} error_callback - The callback function called an error occurs.
     */
    this.search = function(table, query) {
        return this.advancedSearch(table, undefined, query, undefined);
    };

    /**
     * Performs a metadata search in the CIP given as a query string. Called from higher-level classes.
     * @param {object} table - The table to search in, as returned by NatMus#get_tables.
     * @param {string} querystring - The query to search for.
     * @param {function} callback - The callback function called when an answer is ready, this is passed an instance of CIPSearchResult.
     * @param {function} error_callback - The callback function called an error occurs.
     */
    this.criteriaSearch = function(table, querystring, sortby) {
        return this.advancedSearch(table, querystring, undefined, sortby);
    };

    /**
     * Performs an advanced metadata search in the CIP given as a query string and a search term.
     * The query string is in Cumulus Query Language and the search term is a simple human-readable textstring.
     * @param {object} table - The table to search in, as returned by NatMus#get_tables.
     * @param {string} querystring - The query to search for.
     * @param {string} searchterm - The free-text to search for.
     * @param {function} callback - The callback function called when an answer is ready, this is passed an instance of CIPSearchResult.
     * @param {function} error_callback - The callback function called an error occurs.
     */
    this.advancedSearch = function(table, querystring, searchterm, sortby, returnSingleAsset) {
        cipCommon.assert(table.catalog.alias !== undefined, 'Catalog must have an alias.');
        cipCommon.assert(querystring !== undefined || searchterm !== undefined, 'Either querystring or searchterm must be defined.');
        var cip = this;

        if (returnSingleAsset) {
            // If we are going for a single asset, we might as well exclude the
            // collection and include the view path-parameter right away.
            //
            cipCommon.assert(this.config.constants && this.config.constants.layoutAlias,
              'The layoutAlias constant must be set in the config.');

            // Make the request.
            return this.request([
              'metadata',
              'search',
              table.catalog.alias,
              this.config.constants.layoutAlias
            ], {
                querystring: querystring,
                quicksearchstring: searchterm,
                sortby: sortby,
                table: table.name,
                maxreturned: 1
            }).then(function(response) {
                if (response && response.body) {
                    if (response.body.items) {
                        if (response.body.items.length === 1) {
                            return new cipAsset.CIPAsset(cip, response.body.items[0], table.catalog);
                        } else {
                            throw new Error('Expected one asset, got ' + response.items.length);
                        }
                    } else {
                        console.error(response.body);
                        throw new Error('Malformed response, missing the items');
                    }
                } else {
                    throw new Error('Received an empty result from the CIP, when searching.');
                }
            });
        } else {
            return this.request([
                'metadata',
                'search',
                table.catalog.alias
            ], {
                querystring: querystring,
                quicksearchstring: searchterm,
                sortby: sortby,
                table: table.name,
                collection: ''  // We pass an empty collection to get the system to create one for us and return the name
            }).then(function(response) {
                return new cipSearchresult.CIPSearchResult(cip,
                                                           response.body,
                                                           table.catalog);
            });
        }
    };

    /**
     * Gives a reference to a CIPAsset with or without its metadata.
     * @param {string} catalog_alias - The catalog alias from with to fetch the asset.
     * @param {number} asset_id - The ID of the asset as known in Cumulus.
     * @param {boolean} fetch_metadata - Should the CIPAsset have it's metadata populated?
     */
    this.getAsset = function(catalog_alias, asset_id, fetch_metadata) {
        var table = this.getTable(catalog_alias);
        // The asset_id must be sat.
        cipCommon.assert(asset_id !== undefined, 'The asset_id must have a value.');

        if (fetch_metadata === true) {
            // Search for the id, no searchterm or sorting. The final boolean argument
            // tells the search to return a single asset, without creating an
            // intermediary result object.
            return this.advancedSearch(table, 'id == ' + asset_id, undefined, null, true);
        } else {
            return new Promise(function (resolve, reject) {
        var asset = new cipAsset.CIPAsset(this, { id: asset_id }, table.catalog);
        resolve(asset);
      });
        }
    };

    /**
     * Gives a reference to a CIPTable.
     * @param {string} catalog_alias - The catalog alias from with to fetch the asset.
     * @param {string} table_name - The name of the table as known in Cumulus.
     * @return {CIPTable} An object representing a table in the CIP.
     */
    this.getTable = function(catalog_alias, table_name) {
        cipCommon.assert(catalog_alias !== undefined, 'Catalog must have an alias.');
        if (typeof(table_name) == 'undefined') {
            table_name = 'AssetRecords';
        }
        var catalog = new cipCatalog.CIPCatalog(this, { alias: catalog_alias });
        var table = new cipTable.CIPTable(this, catalog, table_name);
        return table;
    };

    /**
     * Gets the version of the various services on the CIP stack.
     * @param {function} callback - A function that is called with an object as first argument when the request succeeds.
     * @param {function} error_callback - A function that is called when the request fails.
     */
    this.getVersion = function(callback, error_callback) {
        cipCommon.assert(typeof(callback) === 'function', 'The callback must be a function.');
        this.request(['system', 'getversion']).then(function(response) {
            return response.version;
        });
    };
}

if (process.browser) {
    window.CIPClient = CIPClient;
} else {
    exports.CIPClient = CIPClient;
}
