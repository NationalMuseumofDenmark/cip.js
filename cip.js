/**
 * CIP.js - a CIP client in JavaScript
 * Jens Christian Hillerup, BIT BLUEPRINT - jc@bitblueprint.com
 * 
 * This code includes the Qwest library in order to handle AJAX
 * requests in a nice way. Qwest is released under an MIT license.
 */

// Shim to avoid failures on browsers without console.
window.console = window.console || {log: function() {}, error: function() {}};

// Handy assertion function
function assert(condition, message) {
    if (!condition) {
        throw message || "Assertion failed.";
    }
};

/**
 * Represents a catalog in CIP.
 * @constructor
 * @param {CIPClient} cip - The CIP client taking care of session handling etc.
 * @param {object} options - An object as returned by the CIP describing the catalog.
 */
function CIPCatalog(cip, options) {
    this.cip = cip;
    
    for (var key in options) {
        this[key] = options[key];
    }

    this.alias = cip.config.catalog_aliases[this.name];
    
    /**
     * Returns a list of tables in a given catalog.
     * @param {object} catalog - The catalog, as returned by NatMus#get_catalogs.
     */
    this.get_tables = function() {
        assert(cip.is_connected());
        var returnvalue = [];
        
        // We need to cache the catalog because the callback later binds this to the CIP client.
        var catalog = this;

        this.cip.ciprequest("metadata/gettables/"+cip.config.constants.catch_all_alias, 
                            {
                                catalogname: this.name
                            }, 
                            function(response, cip) {
                                for (var i = 0; i < response.tables.length; i++ ) {
                                    returnvalue.push(new CIPTable(this, catalog, response.tables[i]));
                                }
                            });
        
        return returnvalue;
    };
}

function CIPTable(cip, catalog, name) {
    this.cip = cip;
    this.catalog = catalog;
    this.name = name;
    
    this.layout = null;

    // TODO: Must have a reference to the layout it uses
    
    /**
     * Returns the layout of a given table in a given catalog.
     * @param {object} catalog - The catalog, as returned by NatMus#get_catalogs.
     * @param {object} table - The table, as returned by NatMus#get_tables.
     */
    this.get_layout = function() {
        assert(this.cip.is_connected());
        var returnvalue = null;

        this.cip.ciprequest("metadata/getlayout/"+this.cip.config.constants.layout_alias, {
            catalogname: this.catalog.name,
            table: this.name
        }, function(response) {
            returnvalue = new CIPLayout(this, response.fields);
        }); 
        
        this.layout = returnvalue;

        return returnvalue;
    };
    
    this.search = function(query) {
        return cip.search(this, query);
    };

}


function CIPLayout(cip, fields) {
    this.cip = cip;
    this.fields = fields;
    
    // TODO: Cache

    this.lookup_field = function (alias) {
        for (var i = 0; i < fields.length; i++) {
            if (this.fields[i].key === key) {
                return this.fields[i];
            }
        }
        
        // If we didn't find the field, (explicitly) return undefined :(
        return undefined;
    };
}


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


/**
 * A general-purpose client library for CIP endpoints. Implements session
 * handling and requests.
 * @constructor
 * @param {string} endpoint - The URL to the CIP endpoint
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
     */
    this.ciprequest = function(name, options, success, error) {
        var self = this; // TODO: Fix this hack
        
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

        return qwest.post(this.config.endpoint + name + jsessionid_container, 
                          queryStringObject, 
                          {async:false},
                          function() {
                              // Set XMLHTTP properties here
                          })
            .success(success || function(response) {
                console.log(["default success", name, response]);
            })
            .error(error || function(response) {
                console.log(["default error", name, response]);
            });
    };
    
    /**
     * Opens a session to the CIP endpoint with the given username
     * and password.
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
                                // fail
                                return;
                            }
                        },
                        function(response) {
                            error(response) || console.error("Could not make request to CIP.");
                        });

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
     * @param {boolean} force - Ask the server for the list, regardless of the cache 
     */
    this.get_catalogs = function(force) {
        assert(this.is_connected());

        if (force !== true && this.cache.catalogs !== null) {
            return this.cache.catalogs;
        }

        var returnvalue = null;
        this.ciprequest("metadata/getcatalogs", {}, function(response) {
            this.cache.catalogs =  [];
            
            for (var i=0; i < response.catalogs.length; i++) {
                this.cache.catalogs.push(new CIPCatalog(this, response.catalogs[i]));
            }
            
            returnvalue = this.cache.catalogs;
        });
        return returnvalue;
    };
    
    /**
     * Performs a metadata search in the CIP.
     * @param {object} catalog - The catalog to search in, as returned by NatMus#get_catalogs.
     * @param {object} table - The table to search in, as returned by NatMus#get_tables.
     * @param {string} query - The query to search for.
     */
    this.search = function(table, query) {
        assert(this.is_connected());        
        assert(table.catalog.alias !== undefined, "Catalog must have an alias.");
        assert(query !== undefined && query !== "", "Must define a query");
        
        var returnvalue = "";

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
                returnvalue = new CIPSearchResult(this, response);
                
            }
        );
        
        return returnvalue;
    };
}
