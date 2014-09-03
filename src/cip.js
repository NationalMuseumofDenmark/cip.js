/**
 * CIP.js - a CIP client in JavaScript
 * Jens Christian Hillerup, BIT BLUEPRINT - jc@bitblueprint.com
 * 
 * This code includes the Qwest library in order to handle AJAX
 * requests in a nice way. Qwest is released under an MIT license.
 */

if(typeof(require) != "undefined") {
    request = require('request');
    cip_catalog = require('./cip-catalog.js');
    cip_searchresult = require('./cip-searchresult.js');
    cip_common = require('./cip-common.js');
}

/**
 * A general-purpose client library for CIP endpoints. Implements session
 * handling and requests.
 * @constructor
 * @param {string} config - A "handle" object defining various settings about the CIP endpoint.
 */

function CIPClient(config) {
    this.config = config;
    this.jsessionid = null;
    this.DEBUG = true;
    
    cip_common.assert(config !== undefined, "The CIPClient must be passed a config object.");
    cip_common.assert(config.endpoint !== undefined, "The config must have an endpoint property.");

    this.cache = {
        catalogs: null
    };

    this.default_named_parameters = {
        apiversion: 4,
        serveraddress: "localhost"
    };

    /** 
     * Populates an object with named parameters with the default values.
     * 
     * @param {object}|{false} named_parameters - The parameters for the
     *        query string, false if they should be leaved out.
     */
    this.named_parameters_with_defaults = function( named_parameters ) {
        // We start with the default named parameters.
        var result = this.default_named_parameters;

        // Did we get any named parameters?
        if(typeof(named_parameters) === "undefined" || named_parameters === null) {
            named_parameters = {};
        } else if(typeof(named_parameters) !== "object") {
            throw "The named_parameters parameter must be an object, undefined or null.";
        }

        // Overwrite default named parameters.
        for(var p in named_parameters) {
            result[p] = named_parameters[p];
        }
    }

    /** 
     * Generates a URL to the CIP server.
     * 
     * @param {string} operation - The name of the function (the path).
     * @param {object}|{false} named_parameters - The parameters for the
     *        query string, false if they should be leaved out.
     * @param {boolean} without_jsessionid - Should the jsessionid be left out of the URL? Default: false
     */
    this.generate_url = function( operation, named_parameters, without_jsessionid ) {
        var result = this.config.endpoint + operation;
        var query_string = "";

        // Should we include the jsessionid?
        if(without_jsessionid !== true && this.jsessionid) {
            result += ";jsessionid" + this.jsessionid;
        }

        // Populate with defaults.
        if(named_parameters !== false) {
            named_parameters = this.named_parameters_with_defaults(named_parameters);
        } else {
            named_parameters = {}
        }

        // Generate the query string from the named parameters.
        for(var p in named_parameters) {
            if(query_string.length > 0) {
                query_string += "&";
            }
            query_string += p + ":" + named_parameters[p];
        }

        // Prepend the question mark if a query exists.
        if(query_string.length > 0) {
            result += "?" + query_string;
        }

        return result;
    }

    /** 
     * Makes a request to the CIP server.
     * 
     * @param {string} operation - The name of the function (the path).
     * @param {object} named_parameters - POST-data options to pass.
     * @param {function} success - The callback function on success.
     * @param {function} error - The callback function on failure.
     * @param {boolean} async - Whether the call should be asynchronous
     */
    this.ciprequest = function(operation, named_parameters, success, error, async) {
        var self = this; // TODO: Fix this hack

        if (async === undefined) {
            async = false;
        }

        if (this.jsessionid === null && operation !== "session/open") {
            console.warn("No jsessionid - consider calling session_open before calling other action.");
        }

        if (typeof(success) === "function") {
            success = success.bind(this);
        } else {
            // The default success function.
            success = function(response) {
                console.warn( "Unhandled success from the CIP - consider adding a success callback function the ciprequest call." );
                console.log( response );
            };
        }

        if (typeof(error) === "function") {
            error = error.bind(this);
        } else {
            // The default error function.
            error = function(response) {
                console.warn( "Unhandled error from the CIP - consider adding an error callback function the ciprequest call." );
                console.error( "An error occured when communicating with the CIP.", response );
                console.trace();
            };
        }

        // TODO: Consider if this has any effect.
        var error = error;
        var success = success;

        // We are using post calls, so the named parameters go to the body.
        named_parameters = this.named_parameters_with_defaults(named_parameters);

        var url = this.generate_url( operation, false );

        if(typeof(require) != "undefined" && request) {
            return request.post(
                {
                    url: url,
                    method: 'POST',
                    form: named_parameters
                },
                function(is_error, response, body) {
                    if(is_error || response.statusCode != 200) {
                        error( response );
                    } else {
                        success( JSON.parse(response.body) );
                    }
                }
            );
        } else if ( qwest && typeof(qwest) === 'object' ) {
            return qwest.post( url, named_parameters,
                {
                    async: async
                })
                .success(success)
                .error(error);
        }
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
    this.session_open = function(username, password, success, error) {
        var self = this; // TODO: fix this hack

        this.ciprequest("session/open", {
            user: username,
            password: password
        }, function(response) {
            if (response.jsessionid) {
                self.jsessionid = response.jsessionid;
                console.log("Connected to CIP: "+self.jsessionid);
                success(response);
            } else {
                debugger;
                console.log("SessionID is missing!");
                // fail
                return;
            }
        },
        function(response) {
            (error && error(response)) || console.error("Could not make request to CIP.");
        },
        true);

    };
    
    /**
     * Closes the currently open session.
     */
    this.session_close = function() {
        this.ciprequest("session/close", {});
        //qwest.post(this.CIP_BASE + "session/close", {jsessionid: this.jsessionid});
    };

    /**
     * Returns true if the CIP connection is established.
     */
    this.is_connected = function() {
        // If the CIP connection has a session ID, we're connected.
        return this.jsessionid !== null;
    };    
    
    /** 
     * Returns a list of catalogs on the CIP service. Caches the result.
     * @param {function} callback The callback
     */
    this.get_catalogs = function(callback) {
        cip_common.assert(this.is_connected());

        if (this.cache.catalogs !== null) {
            callback(this.cache.catalogs);
        }

        this.ciprequest("metadata/getcatalogs", {}, function(response) {
            this.cache.catalogs =  [];
            var aliases = this.config['catalog_aliases'];
            
            for (var i=0; i < response.catalogs.length; i++) {
                var catobj = response.catalogs[i];
                if ((catobj.name in aliases))  {
                    var catalog = new cip_catalog.CIPCatalog(this, response.catalogs[i]);
                    this.cache.catalogs.push(catalog);
                }
            }
            callback(this.cache.catalogs);
        });
        
    };
    
    /**
     * Performs a metadata search in the CIP. Called from higher-level classes.
     * @param {object} catalog - The catalog to search in, as returned by NatMus#get_catalogs.
     * @param {object} table - The table to search in, as returned by NatMus#get_tables.
     * @param {string} query - The query to search for.
     */
    this.search = function(table, query, callback) {
        cip_common.assert(this.is_connected());        
        cip_common.assert(table.catalog.alias !== undefined, "Catalog must have an alias.");
        cip_common.assert(query !== undefined && query !== "", "Must define a query");
        
        this.ciprequest(
            "metadata/search/"+table.catalog.alias, 
            {
                quicksearchstring: query,
                table: table.name,
                collection: ""  // We pass an empty collection to get the system to create one for us and return the name
            }, 
            function(response) {
                // The API returns a collection ID which we will then proceed to enumerate
                var collection = response.collection;
                callback(new cip_searchresult.CIPSearchResult(this, response, table.catalog));
                
            }
        );
    };
    
    /**
     * Performs a metadata search in the CIP given as a query string. Called from higher-level classes.
     * @param {object} table - The table to search in, as returned by NatMus#get_tables.
     * @param {string} query - The query to search for.
     * @param {function} callback - The callback function called when an answer is ready, this is passed an instance of CIPSearchResult.
     */
    this.criteriasearch = function(table, querystring, callback) {
        cip_common.assert(this.is_connected());        
        cip_common.assert(table.catalog.alias !== undefined, "Catalog must have an alias.");
        cip_common.assert(querystring !== undefined && querystring !== "", "Must define a query");

        this.ciprequest(
            "metadata/search/"+table.catalog.alias, 
            {
                querystring: querystring,
                table: table.name,
                collection: ""  // We pass an empty collection to get the system to create one for us and return the name
            }, 
            function(response) {
                // The API returns a collection ID which we will then proceed to enumerate
                var collection = response.collection;
                callback(new cip_searchresult.CIPSearchResult(this, response, table.catalog));
            }
        );
    };
    
    /**
     * Gives a reference to a CIPAsset with or without its metadata.
     * @param {string} catalog_alias - The catalog alias from with to fetch the asset.
     * @param {number} asset_id - The ID of the asset as known in Cumulus.
     * @param {boolean} fetch_metadata - Should the CIPAsset have it's metadata populated?
     * @param {function} callback - The callback function called when an answer is ready, this is passed an instance of CIPAsset.
     */
    this.get_asset = function(catalog_alias, asset_id, fetch_metadata, callback) {
        assert(this.is_connected());
        assert(catalog_alias !== undefined, "Catalog must have an alias.");
        assert(asset_id !== undefined, "The asset_id must have a value.");

        console.log("get_asset after assets ..");

        var catalog = new cip_catalog.CIPCatalog(this, { alias: catalog_alias });
        
        if(fetch_metadata === true) {
            console.log("fetch_metadata was true ..");
            var table = new cip_table.CIPTable(this, catalog, "AssetRecords");
            console.log(catalog, table);

            this.criteriasearch(table, 'id == ' + asset_id, function(result) {
                console.log("criteriasearch returned result ..", result);
                // Found a result - get the actual asset.
                result.get(1, 0, function(assets) {
                    if(assets.length !== 1) {
                        log.warning( "The criteriasearch didn't return exactly one result. Check parameters." );
                        callback( null );
                    } else {
                        var asset = assets[0];
                        callback( asset );
                    };
                });
            });
        } else {
            var asset = new cip_asset.CIPAsset(this, { id: asset_id }, catalog);
            callback( asset );
        }
    };
    
    /**
     * Gets the version of the various services on the CIP stack.
     * @return object
     */
    this.get_version = function(callback) {
        cip_common.assert(typeof(callback) === "function", "The callback must be a function.");
        this.ciprequest("system/getversion", {}, function(response) {
            callback(response.version);
        });
    };
}

if(typeof(exports) != "undefined") {
    exports.CIPClient = CIPClient;
}
