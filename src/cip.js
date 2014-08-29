/**
 * CIP.js - a CIP client in JavaScript
 * Jens Christian Hillerup, BIT BLUEPRINT - jc@bitblueprint.com
 * 
 * This code includes the Qwest library in order to handle AJAX
 * requests in a nice way. Qwest is released under an MIT license.
 */

request = require('request');
cip_catalog = require('./cip-catalog.js');
cip_searchresult = require('./cip-searchresult.js');
cip_common = require('./cip-common.js');

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
    
    this.cache = {
        catalogs: null
    };

    /** 
     * Makes a request to the CIP server.
     * 
     * @param {string} name - The name of the function (the path).
     * @param {object} options - POST-data options to pass.
     * @param {function} success - The callback function on success.
     * @param {function} error - The callback function on failure.
     * @param {boolean} async - Whether the call should be asynchronous
     */
    this.ciprequest = function(name, options, success, error, async) {
        var self = this; // TODO: Fix this hack

        if (async === undefined) {
            async = false;
        }

        var queryStringObject = { 
            apiversion: 4,
            serveraddress: "localhost"
        };

        if (options !== undefined) {
            for (var key in options) {
                queryStringObject[key] = options[key];
            }
        }

        if (this.jsessionid === null && name !== "session/open") {
            console.error("ERROR: No jsessionid");
        }

        var jsessionid_container = this.jsessionid===null?"":";jsessionid=" + this.jsessionid;

        if (typeof(success) === "function") {
            success = success.bind(this);
        }

        if (typeof(error) === "function") {
            error = error.bind(this);
        }

        var error = error;
        var success = success;

        return request.post(
            {
                url: this.config.endpoint + name + jsessionid_container,
                method: 'POST',
                form: queryStringObject
            },
            function(is_error, response, body) {
                if(response.statusCode != 200) {
                    if(error === undefined) {
                        console.log("No error function defined, calling success(null) :(");
                        success(null);
                    } else {
                        error(response.body);
                    }
                } else {
                    success(JSON.parse(response.body));
                }
            }
        );
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

        this.ciprequest("session/open", {user: username, password: password}, 
                        function(response) {
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
                            error(response) || console.error("Could not make request to CIP.");
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
                    this.cache.catalogs.push(new cip_catalog.CIPCatalog(this, response.catalogs[i]));
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
     * @param {object} catalog - The catalog to search in, as returned by NatMus#get_catalogs.
     * @param {object} table - The table to search in, as returned by NatMus#get_tables.
     * @param {string} query - The query to search for.
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
     * Gets the version of the various services on the CIP stack.
     * @return object
     */
    this.get_version = function(callback) {
        this.ciprequest("system/getversion", {}, function(response) {
            callback(response.version);
        });
    };
}

if(typeof(exports) != "undefined") {
    exports.CIPClient = CIPClient;
}
